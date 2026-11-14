import React, { useState, useEffect, useRef } from 'react';
import { Player, GameStatus, TileData, Question, AnsweredLog } from './types/game';
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
    setCurrentTurn('p1');
    setTurnCount(1);
    setLogs([]);
    setWinner(null);
    setAnimatingPawn(null);

    qManagerRef.current.setMode('OFFLINE');
    setGameStatus('PLAYING');
  };

  // Start Online Multiplayer Game
  const handleStartOnlineGame = (me: Player, partner: Player, isHost: boolean) => {
    setIsMultiplayer(true);
    setMyRole(isHost ? 'p1' : 'p2');
    setCurrentTurn('p1');
    setTurnCount(1);
    setLogs([]);
    setWinner(null);
    setAnimatingPawn(null);

    if (isHost) {
      setPlayer1(me);
      setPlayer2(partner);
    } else {
      setPlayer1(partner);
      setPlayer2(me);
    }

    qManagerRef.current.setMode('LDR');
    setGameStatus('PLAYING');
  };

  // Switch turn
  const switchTurn = () => {
    setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
    setTurnCount((prev) => prev + 1);
    setGameStatus('PLAYING');
  };

  // Listen to multiplayer network events
  useEffect(() => {
    const unsubscribe = multiplayer.onEvent((event) => {
      if (event.type === 'DICE_ROLL') {
        executeMovement(event.value);
      } else if (event.type === 'QUESTION_OPENED') {
        setCurrentQuestion(event.question);
        setGameStatus('QUESTION');
      } else if (event.type === 'DARE_OPENED') {
        setCurrentDare(event.dare);
        setGameStatus('ACTION_DARE');
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
        setGameStatus('LOBBY');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentTurn]);

  // Local player rolls dice
  const handleLocalRollComplete = (diceValue: number) => {
    if (isMultiplayer) {
      multiplayer.send({
        type: 'DICE_ROLL',
        value: diceValue,
        power: 50,
      });
    }
    executeMovement(diceValue);
  };

  // Execute step-by-step pawn movement (runs on both devices identically)
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
        setTimeout(() => handleTileLanded(targetPos), 300);
      }
    }, 180);
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
      return;
    }

    // Ladder
    if (tile.type === 'LADDER' && tile.targetTile) {
      sound.playLadderClimb();
      const target = tile.targetTile;

      animatePawnMovement(tileId, target, 850, () => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        }

        const q = qManagerRef.current.drawQuestion('LADDER_APPRECIATION');
        openQuestionModal(q);
      });
      return;
    }

    // Snake
    if (tile.type === 'SNAKE' && tile.targetTile) {
      sound.playSnakeSlide();
      const target = tile.targetTile;

      animatePawnMovement(tileId, target, 950, () => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        }

        const q = qManagerRef.current.drawQuestion('SNAKE_REFLECTION');
        openQuestionModal(q);
      });
      return;
    }

    // Question tiles
    if (tile.type === 'BOY') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('BOY');
      openQuestionModal(q);
      return;
    }

    if (tile.type === 'GIRL') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('GIRL');
      openQuestionModal(q);
      return;
    }

    if (tile.type === 'DEEPTALK') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('DEEPTALK');
      openQuestionModal(q);
      return;
    }

    if (tile.type === 'ACTION') {
      sound.playModalPop();
      const dare = qManagerRef.current.drawQuestion('VIRTUAL_DARE');
      openDareModal(dare);
      return;
    }

    // Chill tile
    advanceTurn();
  };

  const openQuestionModal = (q: Question) => {
    setCurrentQuestion(q);
    setGameStatus('QUESTION');
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
      setLogs((prev) => [newLog!, ...prev]);

      if (currentTurn === 'p1') {
        setPlayer1((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
      } else {
        setPlayer2((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
      }
    }

    setCurrentQuestion(null);
    advanceTurn(newLog);
  };

  const handleRerollQuestion = () => {
    if (!currentQuestion) return;
    const newQ = qManagerRef.current.reroll(currentQuestion.category, currentQuestion.id);
    setCurrentQuestion(newQ);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'QUESTION_REROLLED',
        question: newQ,
      });
    }
  };

  const handleDareComplete = () => {
    let newLog: AnsweredLog | undefined = undefined;
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
      setLogs((prev) => [newLog!, ...prev]);
    }
    setCurrentDare(null);
    advanceTurn(newLog);
  };

  const handleRerollDare = () => {
    if (!currentDare) return;
    const newDare = qManagerRef.current.reroll('VIRTUAL_DARE', currentDare.id);
    setCurrentDare(newDare);
    if (isMultiplayer) {
      multiplayer.send({
        type: 'DARE_REROLLED',
        dare: newDare,
      });
    }
  };

  const advanceTurn = (log?: AnsweredLog) => {
    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    if (isMultiplayer) {
      multiplayer.send({
        type: 'TURN_COMPLETED',
        nextTurn,
        log,
      });
    }
    switchTurn();
  };

  const handleRestart = () => {
    if (isMultiplayer) {
      multiplayer.send({ type: 'RESTART_GAME' });
    }
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
          />
        )}

        {gameStatus !== 'LOBBY' && (
          <div className="w-full max-w-xl flex flex-col items-center">
            {/* 1. Pusat Dadu di Tengah Permainan */}
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
            />

            {/* 2. Visual 49-Tile (7x7) Board with SVG Snakes & Ladders */}
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
