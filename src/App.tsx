import React, { useState, useEffect, useRef } from 'react';
import { Player, GameStatus, TileData, Question, AnsweredLog, SyncedGameState, StoredSession } from './types/game';
import { generate49Tiles, getTileCoordinates, TOTAL_TILES } from './utils/board';
import { QuestionManager } from './utils/questionManager';
import { sound } from './utils/audio';
import { announcer } from './utils/announcer';
import { multiplayer } from './utils/multiplayer';

import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import { DiceRoller } from './components/DiceRoller';
import { QuestionModal } from './components/QuestionModal';
import { ActionDareModal } from './components/ActionDareModal';
import { HistoryModal } from './components/HistoryModal';
import { VictoryModal } from './components/VictoryModal';

export const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('LOBBY');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [myRole, setMyRole] = useState<'p1' | 'p2' | 'local'>('local');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');

  // Players (generic defaults, replaced by Lobby inputs)
  const [player1, setPlayer1] = useState<Player>({
    id: 'p1',
    name: 'Pemain 1',
    gender: 'BOY',
    avatar: '🦁',
    color: '#80DED9',
    bgColor: 'bg-[#80DED9]',
    borderColor: 'border-[#1E1B18]',
    position: 1,
    stepsTaken: 0,
    questionsAnswered: 0,
    laddersClimbed: 0,
    snakesSlid: 0,
  });

  const [player2, setPlayer2] = useState<Player>({
    id: 'p2',
    name: 'Pemain 2',
    gender: 'GIRL',
    avatar: '🌸',
    color: '#FF758F',
    bgColor: 'bg-[#FF758F]',
    borderColor: 'border-[#1E1B18]',
    position: 1,
    stepsTaken: 0,
    questionsAnswered: 0,
    laddersClimbed: 0,
    snakesSlid: 0,
  });

  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [tiles] = useState<TileData[]>(generate49Tiles());

  // Visual pawn animation during ladder/snake slide
  const [animatingPawn, setAnimatingPawn] = useState<{
    playerId: 'p1' | 'p2';
    xPercent: number;
    yPercent: number;
  } | null>(null);

  // Questions and Modals
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentDare, setCurrentDare] = useState<Question | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<AnsweredLog[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Audio toggles (BGM Musik Santai default ON as requested)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [announcerSubtitle, setAnnouncerSubtitle] = useState<string | null>(null);

  // Subscribe to announcer subtitles
  useEffect(() => {
    return announcer.subscribeSubtitle((text) => {
      setAnnouncerSubtitle(text);
    });
  }, []);

  const qManagerRef = useRef<QuestionManager>(new QuestionManager('LDR'));
  const isMovingRef = useRef(false);
  const activeMovementIntervalRef = useRef<any>(null);
  const lastStateTimestampRef = useRef<number>(Date.now());
  const pendingModalRef = useRef<{ type: 'QUESTION' | 'DARE'; data: Question } | null>(null);

  const player1Ref = useRef<Player>(player1);
  const player2Ref = useRef<Player>(player2);
  const currentTurnRef = useRef<'p1' | 'p2'>(currentTurn);

  useEffect(() => {
    player1Ref.current = player1;
  }, [player1]);

  useEffect(() => {
    player2Ref.current = player2;
  }, [player2]);

  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);

  const activePlayer = currentTurn === 'p1' ? player1 : player2;
  const otherPlayer = currentTurn === 'p1' ? player2 : player1;
  const isMyTurn = !isMultiplayer || myRole === currentTurn;

  // Persist game state to localStorage and retained MQTT topic
  const persistState = (
    updatedStatus?: GameStatus,
    updatedP1?: Player,
    updatedP2?: Player,
    updatedTurn?: 'p1' | 'p2',
    updatedLogs?: AnsweredLog[],
    updatedQ?: Question | null,
    updatedDare?: Question | null
  ) => {
    const p1 = updatedP1 || player1Ref.current;
    const p2 = updatedP2 || player2Ref.current;
    const status = updatedStatus || gameStatus;
    const turn = updatedTurn || currentTurnRef.current;
    const logList = updatedLogs || logs;
    const q = updatedQ !== undefined ? updatedQ : currentQuestion;
    const d = updatedDare !== undefined ? updatedDare : currentDare;

    const now = Date.now();
    lastStateTimestampRef.current = now;

    const syncedState: SyncedGameState = {
      roomCode: activeRoomCode,
      status,
      currentTurn: turn,
      turnCount,
      player1: p1,
      player2: p2,
      currentQuestion: q,
      currentDare: d,
      logs: logList,
      winner,
      lastUpdated: now,
    };

    localStorage.setItem('sq_active_game_state', JSON.stringify(syncedState));

    // Also keep active session updated
    const sessionData: StoredSession = {
      roomCode: activeRoomCode,
      myRole,
      isMultiplayer,
      myPlayer: myRole === 'p2' ? p2 : p1,
      otherPlayer: myRole === 'p2' ? p1 : p2,
      lastActive: now,
    };
    localStorage.setItem('sq_active_session', JSON.stringify(sessionData));

    // Save to recent rooms list
    if (activeRoomCode) {
      try {
        const rawRecent = localStorage.getItem('sq_recent_rooms');
        const recent: string[] = rawRecent ? JSON.parse(rawRecent) : [];
        const updated = [activeRoomCode, ...recent.filter((r) => r !== activeRoomCode)].slice(0, 5);
        localStorage.setItem('sq_recent_rooms', JSON.stringify(updated));
      } catch (e) {}
    }

    if (isMultiplayer && activeRoomCode) {
      multiplayer.publishGameState(syncedState);
    }
  };

  // Bulletproof Auto-restore session on page load / refresh
  useEffect(() => {
    try {
      const rawState = localStorage.getItem('sq_active_game_state');
      const rawSession = localStorage.getItem('sq_active_session');

      if (rawState) {
        const state = JSON.parse(rawState) as SyncedGameState;
        const session = rawSession ? (JSON.parse(rawSession) as StoredSession) : null;

        // Valid if game was already started (not in LOBBY)
        if (state && state.status && state.status !== 'LOBBY') {
          // If was refreshed during pawn moving animation, reset to PLAYING so game is never locked
          const safeStatus: GameStatus = state.status === 'MOVING' ? 'PLAYING' : state.status;
          
          setGameStatus(safeStatus);
          setPlayer1(state.player1);
          setPlayer2(state.player2);
          setCurrentTurn(state.currentTurn);
          setTurnCount(state.turnCount || 1);
          setLogs(state.logs || []);
          setCurrentQuestion(state.currentQuestion);
          setCurrentDare(state.currentDare);
          setWinner(state.winner);

          const isOnline = Boolean(state.roomCode);
          setIsMultiplayer(isOnline);
          setActiveRoomCode(state.roomCode || '');

          const role = session?.myRole || (isOnline ? 'p1' : 'local');
          setMyRole(role);

          qManagerRef.current.setMode(isOnline ? 'LDR' : 'OFFLINE');

          // Sync room code to browser URL without reloading
          if (isOnline && state.roomCode && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.get('room') !== state.roomCode) {
              url.searchParams.set('room', state.roomCode);
              window.history.replaceState({}, '', url.toString());
            }

            // Resume MQTT WebSocket connection
            multiplayer.resumeRoomSession(state.roomCode, role === 'p1').then((retained) => {
              if (retained) {
                setPlayer1(retained.player1);
                setPlayer2(retained.player2);
                setCurrentTurn(retained.currentTurn);
                setTurnCount(retained.turnCount);
                setLogs(retained.logs || []);
                setCurrentQuestion(retained.currentQuestion);
                setCurrentDare(retained.currentDare);
                if (retained.status && retained.status !== 'MOVING') {
                  setGameStatus(retained.status);
                }
              }
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error restoring session:', e);
    }
  }, []);

  const handleToggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
  };

  const handleToggleBgm = () => {
    const active = sound.toggleBGM();
    setBgmEnabled(active);
  };

  const handleToggleVoice = () => {
    announcer.enabled = !announcer.enabled;
    setVoiceEnabled(announcer.enabled);
  };

  // Start Local 1-Device Game
  const handleStartLocalGame = (p1: Player, p2: Player) => {
    setPlayer1(p1);
    setPlayer2(p2);
    setIsMultiplayer(false);
    setMyRole('local');
    setActiveRoomCode('');
    setCurrentTurn('p1');
    setTurnCount(1);
    setLogs([]);
    setWinner(null);
    setAnimatingPawn(null);

    const sessionData: StoredSession = {
      roomCode: '',
      myRole: 'local',
      isMultiplayer: false,
      myPlayer: p1,
      otherPlayer: p2,
      lastActive: Date.now(),
    };
    localStorage.setItem('sq_active_session', JSON.stringify(sessionData));

    qManagerRef.current.setMode('OFFLINE');
    setGameStatus('PLAYING');
    sound.startBGM();
    persistState('PLAYING', p1, p2, 'p1', []);
    setTimeout(() => announcer.announceTurn(p1.name), 600);
  };

  // Start Online Multiplayer Game
  const handleStartOnlineGame = (me: Player, partner: Player, isHost: boolean) => {
    setIsMultiplayer(true);
    setMyRole(isHost ? 'p1' : 'p2');
    const room = multiplayer.roomCode;
    setActiveRoomCode(room);

    setCurrentTurn('p1');
    setTurnCount(1);
    setLogs([]);
    setWinner(null);
    setAnimatingPawn(null);

    const p1 = isHost ? me : partner;
    const p2 = isHost ? partner : me;

    setPlayer1(p1);
    setPlayer2(p2);

    const sessionData: StoredSession = {
      roomCode: room,
      myRole: isHost ? 'p1' : 'p2',
      isMultiplayer: true,
      myPlayer: me,
      otherPlayer: partner,
      lastActive: Date.now(),
    };
    localStorage.setItem('sq_active_session', JSON.stringify(sessionData));

    // Update URL query parameter without page reload
    if (typeof window !== 'undefined' && room) {
      const url = new URL(window.location.href);
      url.searchParams.set('room', room);
      window.history.replaceState({}, '', url.toString());
    }

    qManagerRef.current.setMode('LDR');
    setGameStatus('PLAYING');
    sound.startBGM();

    persistState('PLAYING', p1, p2, 'p1', []);
    setTimeout(() => announcer.announceTurn(p1.name), 600);
  };

  // Resume session from Lobby card
  const handleResumeSession = (session: StoredSession) => {
    try {
      const rawState = localStorage.getItem('sq_active_game_state');
      if (rawState) {
        const state = JSON.parse(rawState) as SyncedGameState;
        setActiveRoomCode(session.roomCode);
        setIsMultiplayer(session.isMultiplayer);
        setMyRole(session.myRole);
        setGameStatus(state.status === 'MOVING' ? 'PLAYING' : state.status);
        sound.startBGM();
        setPlayer1(state.player1);
        setPlayer2(state.player2);
        setCurrentTurn(state.currentTurn);
        setTurnCount(state.turnCount || 1);
        setLogs(state.logs || []);
        setCurrentQuestion(state.currentQuestion);
        setCurrentDare(state.currentDare);

        if (session.isMultiplayer && session.roomCode) {
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('room', session.roomCode);
            window.history.replaceState({}, '', url.toString());
          }
          multiplayer.resumeRoomSession(session.roomCode, session.myRole === 'p1');
        }
      }
    } catch (e) {}
  };

  const switchTurn = () => {
    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    setCurrentTurn(nextTurn);
    setTurnCount((prev) => prev + 1);
    setGameStatus('PLAYING');
    persistState('PLAYING', undefined, undefined, nextTurn);
  };

  // Listen to multiplayer network events
  useEffect(() => {
    const unsubscribeEvents = multiplayer.onEvent((event) => {
      if (event.type === 'DICE_ROLL') {
        announcer.announceDice(event.value);
        executeMovement(event.value, event.turn, event.fromPos, event.targetPos);
      } else if (event.type === 'QUESTION_OPENED') {
        if (isMovingRef.current) {
          pendingModalRef.current = { type: 'QUESTION', data: event.question };
        } else {
          setCurrentQuestion(event.question);
          setGameStatus('QUESTION');
        }
        if (event.question.category === 'GIRL') {
          announcer.announceGirlQuestion();
        } else if (event.question.category === 'BOY') {
          announcer.announceBoyQuestion();
        } else if (event.question.category === 'DEEPTALK') {
          announcer.announceDeeptalkQuestion();
        }
      } else if (event.type === 'DARE_OPENED') {
        if (isMovingRef.current) {
          pendingModalRef.current = { type: 'DARE', data: event.dare };
        } else {
          setCurrentDare(event.dare);
          setGameStatus('ACTION_DARE');
        }
        announcer.announceDare();
      } else if (event.type === 'QUESTION_REROLLED') {
        setCurrentQuestion(event.question);
      } else if (event.type === 'DARE_REROLLED') {
        setCurrentDare(event.dare);
      } else if (event.type === 'TURN_COMPLETED') {
        if (event.log) {
          setLogs((prev) => {
            if (prev.some((l) => l.id === event.log!.id)) return prev;
            return [event.log!, ...prev];
          });
        }
        setCurrentQuestion(null);
        setCurrentDare(null);
        setCurrentTurn(event.nextTurn);
        currentTurnRef.current = event.nextTurn;
        setTurnCount((prev) => prev + 1);
        setGameStatus('PLAYING');
        setTimeout(() => {
          announcer.announceTurn(event.nextTurn === 'p1' ? player1Ref.current.name : player2Ref.current.name);
        }, 450);
      } else if (event.type === 'RESTART_GAME') {
        clearAllSessionData();
        setGameStatus('LOBBY');
      }
    });

    const unsubscribeState = multiplayer.onGameState((state) => {
      if (state && state.roomCode) {
        // Discard outdated state from network/broker retained buffer
        if (state.lastUpdated && state.lastUpdated < lastStateTimestampRef.current) {
          return;
        }
        lastStateTimestampRef.current = state.lastUpdated || Date.now();

        // Do not stomp local position during active movement animation
        if (!isMovingRef.current) {
          setPlayer1(state.player1);
          player1Ref.current = state.player1;
          setPlayer2(state.player2);
          player2Ref.current = state.player2;
          setCurrentTurn(state.currentTurn);
          currentTurnRef.current = state.currentTurn;
          setTurnCount(state.turnCount);
          setLogs(state.logs || []);
          setCurrentQuestion(state.currentQuestion);
          setCurrentDare(state.currentDare);
          if (state.status && state.status !== 'MOVING') {
            setGameStatus(state.status);
          }
        }
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeState();
    };
  }, [activeRoomCode, isMultiplayer]);

  // Roll completed
  const handleLocalRollComplete = (diceValue: number) => {
    const turn = currentTurnRef.current;
    const mover = turn === 'p1' ? player1Ref.current : player2Ref.current;
    const startPos = mover.position;
    const targetPos = Math.min(TOTAL_TILES, Math.max(startPos, startPos + diceValue));

    if (isMultiplayer) {
      multiplayer.send({
        type: 'DICE_ROLL',
        value: diceValue,
        power: 60,
        turn,
        fromPos: startPos,
        targetPos,
      });
    }
    executeMovement(diceValue, turn, startPos, targetPos);
  };

  // Step-by-step authentic board walk (420ms per step with clear hop sound and hop animation)
  const executeMovement = (
    diceValue: number,
    explicitTurn?: 'p1' | 'p2',
    explicitFromPos?: number,
    explicitTargetPos?: number
  ) => {
    // If already moving, clear previous interval to prevent concurrent race
    if (activeMovementIntervalRef.current) {
      clearInterval(activeMovementIntervalRef.current);
      activeMovementIntervalRef.current = null;
    }

    setGameStatus('MOVING');
    isMovingRef.current = true;

    const movingTurn = explicitTurn || currentTurnRef.current;
    const movingPlayer = movingTurn === 'p1' ? player1Ref.current : player2Ref.current;
    const startPos = explicitFromPos !== undefined ? explicitFromPos : movingPlayer.position;
    const targetPos = explicitTargetPos !== undefined ? explicitTargetPos : Math.min(TOTAL_TILES, Math.max(startPos, startPos + diceValue));

    let currentStep = startPos;
    if (currentStep >= targetPos) {
      isMovingRef.current = false;
      handleTileLanded(targetPos, movingTurn);
      return;
    }

    activeMovementIntervalRef.current = setInterval(() => {
      currentStep++;
      sound.playPawnHop();

      if (movingTurn === 'p1') {
        setPlayer1((prev) => {
          const updated = { ...prev, position: currentStep, stepsTaken: prev.stepsTaken + 1 };
          player1Ref.current = updated;
          return updated;
        });
      } else {
        setPlayer2((prev) => {
          const updated = { ...prev, position: currentStep, stepsTaken: prev.stepsTaken + 1 };
          player2Ref.current = updated;
          return updated;
        });
      }

      if (currentStep >= targetPos) {
        if (activeMovementIntervalRef.current) {
          clearInterval(activeMovementIntervalRef.current);
          activeMovementIntervalRef.current = null;
        }

        // Suspense pause (750ms) so players can clearly see where the pawn landed before card triggers!
        setTimeout(() => {
          isMovingRef.current = false;
          if (pendingModalRef.current) {
            const pending = pendingModalRef.current;
            pendingModalRef.current = null;
            if (pending.type === 'QUESTION') {
              setCurrentQuestion(pending.data);
              setGameStatus('QUESTION');
            } else {
              setCurrentDare(pending.data);
              setGameStatus('ACTION_DARE');
            }
            return;
          }

          handleTileLanded(targetPos, movingTurn);
        }, 750);
      }
    }, 420);
  };

  // Smooth animation along ladder or snake
  const animatePawnMovement = (
    fromTile: number,
    toTile: number,
    durationMs: number,
    playerId: 'p1' | 'p2',
    onFinish: () => void
  ) => {
    const start = getTileCoordinates(fromTile);
    const end = getTileCoordinates(toTile);
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentX = (start.x + (end.x - start.x) * easeProgress) / 10;
      const currentY = (start.y + (end.y - start.y) * easeProgress) / 10;

      setAnimatingPawn({
        playerId,
        xPercent: currentX,
        yPercent: currentY,
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setAnimatingPawn(null);
        onFinish();
      }
    };

    requestAnimationFrame(frame);
  };

  // Handle tile landed
  const handleTileLanded = (tileId: number, movingTurn: 'p1' | 'p2') => {
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) {
      advanceTurn();
      return;
    }

    const currentMover = movingTurn === 'p1' ? player1Ref.current : player2Ref.current;

    // Finish
    if (tile.type === 'FINISH' || tileId >= TOTAL_TILES) {
      sound.playVictory();
      announcer.announceVictory(currentMover.name);
      setWinner(currentMover);
      setGameStatus('VICTORY');
      persistState('VICTORY', player1Ref.current, player2Ref.current);
      return;
    }

    // Ladder
    if (tile.type === 'LADDER' && tile.targetTile) {
      const target = tile.targetTile;
      setTimeout(() => {
        sound.playLadderClimb();
        announcer.announceLadder(currentMover.name);

        animatePawnMovement(tileId, target, 1400, movingTurn, () => {
          let updatedP1 = player1Ref.current;
          let updatedP2 = player2Ref.current;
          if (movingTurn === 'p1') {
            updatedP1 = { ...updatedP1, position: target, laddersClimbed: updatedP1.laddersClimbed + 1 };
            player1Ref.current = updatedP1;
            setPlayer1(updatedP1);
          } else {
            updatedP2 = { ...updatedP2, position: target, laddersClimbed: updatedP2.laddersClimbed + 1 };
            player2Ref.current = updatedP2;
            setPlayer2(updatedP2);
          }

          // Suspense pause at top of ladder (700ms)
          setTimeout(() => {
            const q = qManagerRef.current.drawQuestion('LADDER_APPRECIATION');
            openQuestionModal(q, updatedP1, updatedP2);
          }, 700);
        });
      }, 500);
      return;
    }

    // Snake
    if (tile.type === 'SNAKE' && tile.targetTile) {
      const target = tile.targetTile;
      setTimeout(() => {
        sound.playSnakeSlide();
        announcer.announceSnake(currentMover.name);

        animatePawnMovement(tileId, target, 1500, movingTurn, () => {
          let updatedP1 = player1Ref.current;
          let updatedP2 = player2Ref.current;
          if (movingTurn === 'p1') {
            updatedP1 = { ...updatedP1, position: target, snakesSlid: updatedP1.snakesSlid + 1 };
            player1Ref.current = updatedP1;
            setPlayer1(updatedP1);
          } else {
            updatedP2 = { ...updatedP2, position: target, snakesSlid: updatedP2.snakesSlid + 1 };
            player2Ref.current = updatedP2;
            setPlayer2(updatedP2);
          }

          // Suspense pause at bottom of snake (700ms)
          setTimeout(() => {
            const q = qManagerRef.current.drawQuestion('SNAKE_REFLECTION');
            openQuestionModal(q, updatedP1, updatedP2);
          }, 700);
        });
      }, 500);
      return;
    }

    const updatedP1 = movingTurn === 'p1' ? { ...player1Ref.current, position: tileId } : player1Ref.current;
    const updatedP2 = movingTurn === 'p2' ? { ...player2Ref.current, position: tileId } : player2Ref.current;
    player1Ref.current = updatedP1;
    player2Ref.current = updatedP2;
    setPlayer1(updatedP1);
    setPlayer2(updatedP2);

    // Question tiles with dramatic pop-up
    if (tile.type === 'BOY') {
      setTimeout(() => {
        announcer.announceBoyQuestion();
        const q = qManagerRef.current.drawQuestion('BOY');
        openQuestionModal(q, updatedP1, updatedP2);
      }, 550);
      return;
    }

    if (tile.type === 'GIRL') {
      setTimeout(() => {
        announcer.announceGirlQuestion();
        const q = qManagerRef.current.drawQuestion('GIRL');
        openQuestionModal(q, updatedP1, updatedP2);
      }, 550);
      return;
    }

    if (tile.type === 'DEEPTALK') {
      setTimeout(() => {
        announcer.announceDeeptalkQuestion();
        const q = qManagerRef.current.drawQuestion('DEEPTALK');
        openQuestionModal(q, updatedP1, updatedP2);
      }, 550);
      return;
    }

    if (tile.type === 'ACTION') {
      setTimeout(() => {
        announcer.announceDare();
        const dare = qManagerRef.current.drawQuestion('VIRTUAL_DARE');
        openDareModal(dare, updatedP1, updatedP2);
      }, 550);
      return;
    }

    // Chill tile: brief pause then next turn
    setTimeout(() => {
      advanceTurn();
    }, 800);
  };

  const openQuestionModal = (q: Question, p1?: Player, p2?: Player) => {
    setCurrentQuestion(q);
    setGameStatus('QUESTION');
    const uP1 = p1 || player1Ref.current;
    const uP2 = p2 || player2Ref.current;
    persistState('QUESTION', uP1, uP2, undefined, undefined, q);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'QUESTION_OPENED',
        question: q,
      });
    }
  };

  const openDareModal = (dare: Question, p1?: Player, p2?: Player) => {
    setCurrentDare(dare);
    setGameStatus('ACTION_DARE');
    const uP1 = p1 || player1Ref.current;
    const uP2 = p2 || player2Ref.current;
    persistState('ACTION_DARE', uP1, uP2, undefined, undefined, null, dare);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'DARE_OPENED',
        dare: dare,
      });
    }
  };

  // Complete question answer
  const handleAnswerComplete = () => {
    let newLog: AnsweredLog | undefined = undefined;
    let nextLogs = logs;

    if (currentQuestion) {
      newLog = {
        id: `log-${Date.now()}`,
        playerName: activePlayer.name,
        playerAvatar: activePlayer.avatar,
        category: currentQuestion.category,
        questionText: currentQuestion.question,
        turnNumber: turnCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      nextLogs = [newLog, ...logs];
      setLogs(nextLogs);

      if (currentTurn === 'p1') {
        setPlayer1((prev) => {
          const updated = { ...prev, questionsAnswered: prev.questionsAnswered + 1 };
          player1Ref.current = updated;
          return updated;
        });
      } else {
        setPlayer2((prev) => {
          const updated = { ...prev, questionsAnswered: prev.questionsAnswered + 1 };
          player2Ref.current = updated;
          return updated;
        });
      }
    }

    setCurrentQuestion(null);
    advanceTurn(newLog, nextLogs);
  };

  const handleRerollQuestion = () => {
    if (!currentQuestion) return;
    const newQ = qManagerRef.current.reroll(currentQuestion.category, currentQuestion.id);
    setCurrentQuestion(newQ);
    persistState('QUESTION', undefined, undefined, undefined, undefined, newQ);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'QUESTION_REROLLED',
        question: newQ,
      });
    }
  };

  const handleDareComplete = () => {
    let newLog: AnsweredLog | undefined = undefined;
    let nextLogs = logs;

    if (currentDare) {
      newLog = {
        id: `log-${Date.now()}`,
        playerName: activePlayer.name,
        playerAvatar: activePlayer.avatar,
        category: 'VIRTUAL_DARE',
        questionText: `[Aksi/Dare] ${currentDare.title}: ${currentDare.question}`,
        turnNumber: turnCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      nextLogs = [newLog, ...logs];
      setLogs(nextLogs);
    }
    setCurrentDare(null);
    advanceTurn(newLog, nextLogs);
  };

  const handleRerollDare = () => {
    if (!currentDare) return;
    const newDare = qManagerRef.current.reroll('VIRTUAL_DARE', currentDare.id);
    setCurrentDare(newDare);
    persistState('ACTION_DARE', undefined, undefined, undefined, undefined, null, newDare);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'DARE_REROLLED',
        dare: newDare,
      });
    }
  };

  const advanceTurn = (log?: AnsweredLog, updatedLogs?: AnsweredLog[]) => {
    const nextTurn = currentTurnRef.current === 'p1' ? 'p2' : 'p1';
    if (isMultiplayer) {
      multiplayer.send({
        type: 'TURN_COMPLETED',
        nextTurn,
        log,
      });
    }
    setCurrentTurn(nextTurn);
    currentTurnRef.current = nextTurn;
    setTurnCount((prev) => prev + 1);
    setGameStatus('PLAYING');
    persistState('PLAYING', player1Ref.current, player2Ref.current, nextTurn, updatedLogs, null, null);
    setTimeout(() => {
      announcer.announceTurn(nextTurn === 'p1' ? player1Ref.current.name : player2Ref.current.name);
    }, 450);
  };

  const clearAllSessionData = () => {
    localStorage.removeItem('sq_active_session');
    localStorage.removeItem('sq_active_game_state');
    multiplayer.cleanup();
  };

  const handleRestart = () => {
    if (isMultiplayer) {
      multiplayer.send({ type: 'RESTART_GAME' });
    }
    clearAllSessionData();
    setGameStatus('LOBBY');
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col justify-between selection:bg-[#FFD23F]">
      {/* Top Header */}
      <Header
        player1={player1}
        player2={player2}
        currentTurn={currentTurn}
        gameStatus={gameStatus}
        soundEnabled={soundEnabled}
        voiceEnabled={voiceEnabled}
        bgmEnabled={bgmEnabled}
        roomCode={activeRoomCode}
        onToggleSound={handleToggleSound}
        onToggleVoice={handleToggleVoice}
        onToggleBgm={handleToggleBgm}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onRestart={handleRestart}
        historyCount={logs.length}
      />

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {gameStatus === 'LOBBY' && (
          <Lobby
            onStartLocalGame={handleStartLocalGame}
            onStartOnlineGame={handleStartOnlineGame}
            onResumeSession={handleResumeSession}
          />
        )}

        {gameStatus !== 'LOBBY' && (
          <div className="w-full max-w-xl flex flex-col items-center">
            {/* 1. Real 3D Dice Roller di Tengah Permainan */}
            <DiceRoller
              activePlayer={activePlayer}
              onRollComplete={handleLocalRollComplete}
              disabled={
                gameStatus === 'MOVING' ||
                gameStatus === 'QUESTION' ||
                gameStatus === 'ACTION_DARE' ||
                gameStatus === 'VICTORY'
              }
              isMyTurn={isMyTurn}
              isMultiplayer={isMultiplayer}
              roomCode={activeRoomCode}
            />

            {/* 2. Visual 49-Tile (7x7) Board with 3D Depth Toggle */}
            <Board
              tiles={tiles}
              player1={player1}
              player2={player2}
              animatingPawn={animatingPawn}
              onTileClick={(tile) => {
                sound.playClick();
              }}
            />
          </div>
        )}
      </main>

      {/* Question Modal */}
      {gameStatus === 'QUESTION' && currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          activePlayer={activePlayer}
          otherPlayer={otherPlayer}
          onAnswerComplete={handleAnswerComplete}
          onReroll={handleRerollQuestion}
        />
      )}

      {/* Action Dare Modal */}
      {gameStatus === 'ACTION_DARE' && currentDare && (
        <ActionDareModal
          dare={currentDare}
          activePlayer={activePlayer}
          otherPlayer={otherPlayer}
          onComplete={handleDareComplete}
          onReroll={handleRerollDare}
        />
      )}

      {/* History Journal Modal */}
      {isHistoryOpen && (
        <HistoryModal
          logs={logs}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* Victory Modal */}
      {gameStatus === 'VICTORY' && winner && (
        <VictoryModal
          winner={winner}
          otherPlayer={winner.id === 'p1' ? player2 : player1}
          turnCount={turnCount}
          logs={logs}
          onRestart={handleRestart}
          onViewHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* Floating Animated Game Announcer Subtitle Bubble - Placed at TOP so it never blocks the board */}
      {announcerSubtitle && (
        <div className="fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FFD23F] border-2 sm:border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] sm:shadow-[5px_5px_0px_#1E1B18] animate-in slide-in-from-top-3 fade-in flex items-center gap-2.5 pointer-events-none">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border-2 border-[#1E1B18] flex items-center justify-center text-sm sm:text-base shadow-[1px_1px_0px_#1E1B18] shrink-0 animate-bounce">
            🎙️
          </div>
          <p className="font-archivo text-[11px] sm:text-sm text-[#1E1B18] uppercase tracking-wide leading-tight font-black">
            "{announcerSubtitle}"
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
