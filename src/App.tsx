import React, { useState, useEffect, useRef } from 'react';
import { Player, GameMode, GameStatus, TileData, Question, AnsweredLog } from './types/game';
import { generateBoardTiles } from './utils/board';
import { QuestionManager } from './utils/questionManager';
import { sound } from './utils/audio';

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
  const [gameMode, setGameMode] = useState<GameMode>('LDR');

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
  const [tiles] = useState<TileData[]>(generateBoardTiles());

  // Questions and Modals
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentDare, setCurrentDare] = useState<Question | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<AnsweredLog[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Audio toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);

  // Question Manager ref (maintains random pools)
  const qManagerRef = useRef<QuestionManager>(new QuestionManager('LDR'));

  const activePlayer = currentTurn === 'p1' ? player1 : player2;
  const otherPlayer = currentTurn === 'p1' ? player2 : player1;

  // Toggle audio
  const handleToggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
  };

  const handleToggleBgm = () => {
    const active = sound.toggleBGM();
    setBgmEnabled(active);
  };

  // Start game from Lobby
  const handleStartGame = (p1: Player, p2: Player, mode: GameMode) => {
    setPlayer1(p1);
    setPlayer2(p2);
    setGameMode(mode);
    setCurrentTurn('p1');
    setTurnCount(1);
    setLogs([]);
    setWinner(null);

    qManagerRef.current.setMode(mode);
    setGameStatus('PLAYING');
  };

  // Switch turn
  const switchTurn = () => {
    setCurrentTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
    setTurnCount((prev) => prev + 1);
    setGameStatus('PLAYING');
  };

  // Dice roll completed
  const handleRollComplete = (diceValue: number) => {
    setGameStatus('MOVING');

    const startPos = activePlayer.position;
    const targetPos = Math.min(50, startPos + diceValue);

    // Animate pawn step-by-step
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

  // Process landed tile
  const handleTileLanded = (tileId: number) => {
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) {
      switchTurn();
      return;
    }

    // Check Victory
    if (tile.type === 'FINISH' || tileId >= 50) {
      setWinner(activePlayer);
      setGameStatus('VICTORY');
      return;
    }

    // Check Ladder
    if (tile.type === 'LADDER' && tile.targetTile) {
      sound.playLadderClimb();
      const target = tile.targetTile;
      setTimeout(() => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, laddersClimbed: prev.laddersClimbed + 1 }));
        }
        // Draw appreciation question
        const q = qManagerRef.current.drawQuestion('LADDER_APPRECIATION');
        setCurrentQuestion(q);
        setGameStatus('QUESTION');
      }, 400);
      return;
    }

    // Check Snake
    if (tile.type === 'SNAKE' && tile.targetTile) {
      sound.playSnakeSlide();
      const target = tile.targetTile;
      setTimeout(() => {
        if (currentTurn === 'p1') {
          setPlayer1((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        } else {
          setPlayer2((prev) => ({ ...prev, position: target, snakesSlid: prev.snakesSlid + 1 }));
        }
        // Draw snake reflection question
        const q = qManagerRef.current.drawQuestion('SNAKE_REFLECTION');
        setCurrentQuestion(q);
        setGameStatus('QUESTION');
      }, 400);
      return;
    }

    // Boy tile
    if (tile.type === 'BOY') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('BOY');
      setCurrentQuestion(q);
      setGameStatus('QUESTION');
      return;
    }

    // Girl tile
    if (tile.type === 'GIRL') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('GIRL');
      setCurrentQuestion(q);
      setGameStatus('QUESTION');
      return;
    }

    // Deep talk tile
    if (tile.type === 'DEEPTALK') {
      sound.playModalPop();
      const q = qManagerRef.current.drawQuestion('DEEPTALK');
      setCurrentQuestion(q);
      setGameStatus('QUESTION');
      return;
    }

    // Action Dare tile
    if (tile.type === 'ACTION') {
      sound.playModalPop();
      const dare = qManagerRef.current.drawQuestion('VIRTUAL_DARE');
      setCurrentDare(dare);
      setGameStatus('ACTION_DARE');
      return;
    }

    // Chill tile
    switchTurn();
  };

  // Complete Question Answer
  const handleAnswerComplete = () => {
    if (currentQuestion) {
      const newLog: AnsweredLog = {
        id: `log-${Date.now()}`,
        playerName: activePlayer.name,
        playerAvatar: activePlayer.avatar,
        category: currentQuestion.category,
        questionText: currentQuestion.question,
        turnNumber: turnCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setLogs((prev) => [newLog, ...prev]);

      if (currentTurn === 'p1') {
        setPlayer1((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
      } else {
        setPlayer2((prev) => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }));
      }
    }

    setCurrentQuestion(null);
    switchTurn();
  };

  // Reroll Question
  const handleRerollQuestion = () => {
    if (!currentQuestion) return;
    const newQ = qManagerRef.current.reroll(currentQuestion.category, currentQuestion.id);
    setCurrentQuestion(newQ);
  };

  // Complete Action Dare
  const handleDareComplete = () => {
    if (currentDare) {
      const newLog: AnsweredLog = {
        id: `log-${Date.now()}`,
        playerName: activePlayer.name,
        playerAvatar: activePlayer.avatar,
        category: 'VIRTUAL_DARE',
        questionText: `[Aksi/Dare] ${currentDare.title}: ${currentDare.question}`,
        turnNumber: turnCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
    setCurrentDare(null);
    switchTurn();
  };

  // Reroll Dare
  const handleRerollDare = () => {
    if (!currentDare) return;
    const newDare = qManagerRef.current.reroll('VIRTUAL_DARE', currentDare.id);
    setCurrentDare(newDare);
  };

  // Restart to Lobby
  const handleRestart = () => {
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {gameStatus === 'LOBBY' && (
          <Lobby onStartGame={handleStartGame} />
        )}

        {gameStatus !== 'LOBBY' && (
          <div className="w-full flex flex-col items-center pb-24 sm:pb-28">
            <Board
              tiles={tiles}
              player1={player1}
              player2={player2}
              onTileClick={(tile) => {
                sound.playClick();
              }}
            />

            {/* Bottom Floating Dice Controller */}
            <DiceRoller
              activePlayer={activePlayer}
              onRollComplete={handleRollComplete}
              disabled={gameStatus === 'MOVING' || gameStatus === 'QUESTION' || gameStatus === 'ACTION_DARE' || gameStatus === 'VICTORY'}
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
