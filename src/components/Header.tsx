import React, { useState } from 'react';
import { Player, GameStatus } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Music, BookOpen, RotateCcw, Copy, Check, LogOut } from 'lucide-react';

interface HeaderProps {
  player1: Player;
  player2: Player;
  currentTurn: 'p1' | 'p2';
  gameStatus: GameStatus;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  roomCode?: string;
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
  roomCode,
  onToggleSound,
  onToggleBgm,
  onOpenHistory,
  onRestart,
  historyCount,
}) => {
  const activePlayer = currentTurn === 'p1' ? player1 : player2;
  const [copiedCode, setCopiedCode] = useState(false);

  const copyRoomLink = () => {
    if (!roomCode) return;
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF6EE] border-b-4 border-[#1E1B18] px-3 py-2.5 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Room Badge */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-xl font-archivo rotate-[-2deg]">
            🐍
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-archivo text-base sm:text-lg leading-none tracking-tight uppercase">
                Snake Questions
              </h1>
              {roomCode && (
                <button
                  type="button"
                  onClick={copyRoomLink}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFD23F] text-[#1E1B18] border-2 border-[#1E1B18] text-[11px] sm:text-xs font-archivo uppercase shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 hover:bg-[#FFE066] transition-all"
                  title="Klik untuk salin link room"
                >
                  <span className="font-mono font-black tracking-wide">ROOM: {roomCode}</span>
                  {copiedCode ? (
                    <span className="text-[10px] text-green-800 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Tersalin!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-[#1E1B18]" />
                  )}
                </button>
              )}
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
            title={bgmEnabled ? 'Matikan Musik Santai' : 'Nyalakan Musik Santai Pasangan'}
          >
            <Music className="w-4 h-4 text-[#1E1B18]" />
          </button>

          {/* Leave / Restart Button */}
          {gameStatus !== 'LOBBY' && (
            <button
              onClick={() => {
                sound.playClick();
                if (window.confirm('Keluar dari room dan kembali ke menu utama?')) {
                  onRestart();
                }
              }}
              className="p-2 rounded-xl bg-[#FF5964] text-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              title="Keluar Room & Menu Utama"
            >
              <LogOut className="w-4 h-4" />
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
