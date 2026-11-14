import React from 'react';
import { Player, GameStatus } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Music, BookOpen, RotateCcw, Heart } from 'lucide-react';

interface HeaderProps {
  player1: Player;
  player2: Player;
  currentTurn: 'p1' | 'p2';
  gameStatus: GameStatus;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onOpenHistory: () => void;
  onRestart: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  player1,
  player2,
  currentTurn,
  gameStatus,
  soundEnabled,
  bgmEnabled,
  onToggleSound,
  onToggleBgm,
  onOpenHistory,
  onRestart,
  historyCount,
}) => {
  const activePlayer = currentTurn === 'p1' ? player1 : player2;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF6EE] border-b-4 border-[#1E1B18] px-3 py-2.5 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-xl font-archivo rotate-[-2deg]">
            🐍
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-archivo text-base sm:text-lg leading-none tracking-tight uppercase">
                Snake Questions
              </h1>
              <span className="hidden xs:inline-block text-[10px] font-bold bg-[#FF758F] text-white px-1.5 py-0.5 rounded-full border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
                Deep Talk
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-700 leading-tight">
              Ular Tangga Khusus Pasangan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Button */}
          {gameStatus !== 'LOBBY' && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenHistory();
              }}
              className="relative p-2 rounded-xl bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 text-xs font-bold"
              title="Catatan Deep Talk"
            >
              <BookOpen className="w-4 h-4 text-[#1E1B18]" />
              <span className="hidden sm:inline">Catatan</span>
              {historyCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF758F] text-white text-[10px] w-5 h-5 rounded-full border border-[#1E1B18] flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* Sound SFX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
              soundEnabled ? 'bg-[#80DED9]' : 'bg-gray-200'
            }`}
            title={soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#1E1B18]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={onToggleBgm}
            className={`p-2 rounded-xl border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
              bgmEnabled ? 'bg-[#FFD23F] animate-pulse' : 'bg-gray-200'
            }`}
            title={bgmEnabled ? 'Matikan Musik Lo-Fi' : 'Nyalakan Musik Lo-Fi Pasangan'}
          >
            <Music className="w-4 h-4 text-[#1E1B18]" />
          </button>

          {/* Restart Button */}
          {gameStatus !== 'LOBBY' && (
            <button
              onClick={() => {
                sound.playClick();
                if (window.confirm('Mulai ulang permainan dari awal?')) {
                  onRestart();
                }
              }}
              className="p-2 rounded-xl bg-[#FF5964] text-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              title="Reset Permainan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Turn Ticker (During play) */}
      {gameStatus !== 'LOBBY' && (
        <div className="max-w-2xl mx-auto mt-2 pt-2 border-t border-dashed border-[#1E1B18]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600 uppercase text-[10px] tracking-wider">Giliran:</span>
            <div className={`px-2.5 py-0.5 rounded-full border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] font-bold flex items-center gap-1.5 ${
              activePlayer.id === 'p1' ? 'bg-[#80DED9]' : 'bg-[#FF758F] text-white'
            }`}>
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-bold text-[11px]">
            <span className="flex items-center gap-1 text-[#1E1B18]">
              <span>{player1.avatar}</span> {player1.name}: Petak {player1.position}
            </span>
            <span className="text-gray-400">|</span>
            <span className="flex items-center gap-1 text-[#1E1B18]">
              <span>{player2.avatar}</span> {player2.name}: Petak {player2.position}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
