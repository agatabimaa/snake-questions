import React, { useState, useEffect, useRef } from 'react';
import { Player, GameStatus, TileData, Question, AnsweredLog, SyncedGameState, StoredSession } from './types/game';
import { generate49Tiles, getTileCoordinates, TOTAL_TILES } from './utils/board';
import { QuestionManager } from './utils/questionManager';
import { sound } from './utils/audio';
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

  // Players
  const [player1, setPlayer1] = useState<Player>({
    id: 'p1',
    name: 'Bima',
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
    name: 'Agata',
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

  // Audio toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);

  const qManagerRef = useRef<QuestionManager>(new QuestionManager('LDR'));

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
    const p1 = updatedP1 || player1;
    const p2 = updatedP2 || player2;
    const status = updatedStatus || gameStatus;
    const turn = updatedTurn || currentTurn;
    const logList = updatedLogs || logs;
    const q = updatedQ !== undefined ? updatedQ : currentQuestion;
    const d = updatedDare !== undefined ? updatedDare : currentDare;

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
      lastUpdated: Date.now(),
    };

    localStorage.setItem('sq_active_game_state', JSON.stringify(syncedState));

    // Also keep active session updated
    const sessionData: StoredSession = {
      roomCode: activeRoomCode,
      myRole,
      isMultiplayer,
      myPlayer: myRole === 'p2' ? p2 : p1,
      otherPlayer: myRole === 'p2' ? p1 : p2,
      lastActive: Date.now(),
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
    persistState('PLAYING', p1, p2, 'p1', []);
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

    persistState('PLAYING', p1, p2, 'p1', []);
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
        executeMovement(event.value);
      } else if (event.type === 'QUESTION_OPENED') {
        setCurrentQuestion(event.question);
        setGameStatus('QUESTION');
        persistState('QUESTION', undefined, undefined, undefined, undefined, event.question);
      } else if (event.type === 'DARE_OPENED') {
        setCurrentDare(event.dare);
        setGameStatus('ACTION_DARE');
        persistState('ACTION_DARE', undefined, undefined, undefined, undefined, null, event.dare);
      } else if (event.type === 'QUESTION_REROLLED') {
        setCurrentQuestion(event.question);
      } else if (event.type === 'DARE_REROLLED') {
        setCurrentDare(event.dare);
      } else if (event.type === 'TURN_COMPLETED') {
        if (event.log) {
          setLogs((prev) => [event.log!, ...prev]);
        }
        setCurrentQuestion(null);
        setCurrentDare(null);
        setCurrentTurn(event.nextTurn);
        setTurnCount((prev) => prev + 1);
        setGameStatus('PLAYING');
      } else if (event.type === 'RESTART_GAME') {
        clearAllSessionData();
        setGameStatus('LOBBY');
      }
    });

    const unsubscribeState = multiplayer.onGameState((state) => {
      if (state && state.roomCode) {
        setPlayer1(state.player1);
        setPlayer2(state.player2);
        setCurrentTurn(state.currentTurn);
        setTurnCount(state.turnCount);
        setLogs(state.logs || []);
        setCurrentQuestion(state.currentQuestion);
        setCurrentDare(state.currentDare);
        setGameStatus(state.status);
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeState();
    };
  }, [currentTurn, player1, player2]);

  // Roll completed
  const handleLocalRollComplete = (diceValue: number) => {
    if (isMultiplayer) {
      multiplayer.send({
        type: 'DICE_ROLL',
        value: diceValue,
        power: 60,
      });
    }
    executeMovement(diceValue);
  };

  // Step-by-step movement (260ms per step for clear action)
  const executeMovement = (diceValue: number) => {
    setGameStatus('MOVING');

    const startPos = activePlayer.position;
    const targetPos = Math.min(TOTAL_TILES, startPos + diceValue);

    let currentStep = startPos;
    const stepInterval = setInterval(() => {
      currentStep++;
      sound.playPawnHop();

      if (currentTurn === 'p1') {
        setPlayer1((prev) => ({ ...prev, position: currentStep, stepsTaken: prev.stepsTaken + 1 }));
      } else {
        setPlayer2((prev) => ({ ...prev, position: currentStep, stepsTaken: prev.stepsTaken + 1 }));
      }

      if (currentStep >= targetPos) {
        clearInterval(stepInterval);
        // Suspense pause (650ms) so players clearly see where the pawn landed before card triggers!
        setTimeout(() => handleTileLanded(targetPos), 650);
      }
    }, 260);
  };

  // Smooth animation along ladder or snake
  const animatePawnMovement = (
    fromTile: number,
    toTile: number,
    durationMs: number,
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
        playerId: currentTurn,
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
  const handleTileLanded = (tileId: number) => {
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) {
      advanceTurn();
      return;
    }

    // Finish
    if (tile.type === 'FINISH' || tileId >= TOTAL_TILES) {
      setWinner(activePlayer);
      setGameStatus('VICTORY');
      persistState('VICTORY');
      return;
    }

    // Ladder
    if (tile.type === 'LADDER' && tile.targetTile) {
      sound.playLadderClimb();
      const target = tile.targetTile;

      animatePawnMovement(tileId, target, 1100, () => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        }

        const q = qManagerRef.current.drawQuestion('LADDER_APPRECIATION');
        setTimeout(() => {
          sound.playModalPop();
          openQuestionModal(q);
        }, 400);
      });
      return;
    }

    // Snake
    if (tile.type === 'SNAKE' && tile.targetTile) {
      sound.playSnakeSlide();
      const target = tile.targetTile;

      animatePawnMovement(tileId, target, 1200, () => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        }

        const q = qManagerRef.current.drawQuestion('SNAKE_REFLECTION');
        setTimeout(() => {
          sound.playModalPop();
          openQuestionModal(q);
        }, 400);
      });
      return;
    }

    // Question tiles with dramatic pop-up
    if (tile.type === 'BOY') {
      setTimeout(() => {
        sound.playModalPop();
        const q = qManagerRef.current.drawQuestion('BOY');
        openQuestionModal(q);
      }, 350);
      return;
    }

    if (tile.type === 'GIRL') {
      setTimeout(() => {
        sound.playModalPop();
        const q = qManagerRef.current.drawQuestion('GIRL');
        openQuestionModal(q);
      }, 350);
      return;
    }

    if (tile.type === 'DEEPTALK') {
      setTimeout(() => {
        sound.playModalPop();
        const q = qManagerRef.current.drawQuestion('DEEPTALK');
        openQuestionModal(q);
      }, 350);
      return;
    }

    if (tile.type === 'ACTION') {
      setTimeout(() => {
        sound.playModalPop();
        const dare = qManagerRef.current.drawQuestion('VIRTUAL_DARE');
        openDareModal(dare);
      }, 350);
      return;
    }

    // Chill tile: brief pause then next turn
    setTimeout(() => {
      advanceTurn();
    }, 500);
  };

  const openQuestionModal = (q: Question) => {
    setCurrentQuestion(q);
    setGameStatus('QUESTION');
    persistState('QUESTION', undefined, undefined, undefined, undefined, q);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'QUESTION_OPENED',
        question: q,
      });
    }
  };

  const openDareModal = (dare: Question) => {
    setCurrentDare(dare);
    setGameStatus('ACTION_DARE');
    persistState('ACTION_DARE', undefined, undefined, undefined, undefined, null, dare);
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
        setPlayer1((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
      } else {
        setPlayer2((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
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
    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    if (isMultiplayer) {
      multiplayer.send({
        type: 'TURN_COMPLETED',
        nextTurn,
        log,
      });
    }
    setCurrentTurn(nextTurn);
    setTurnCount((prev) => prev + 1);
    setGameStatus('PLAYING');
    persistState('PLAYING', undefined, undefined, nextTurn, updatedLogs, null, null);
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
        bgmEnabled={bgmEnabled}
        roomCode={activeRoomCode}
        onToggleSound={handleToggleSound}
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
    </div>
  );
};

export default App;
