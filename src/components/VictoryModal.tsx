import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, AnsweredLog } from '../types/game';
import { sound } from '../utils/audio';
import { Trophy, Heart, Gift, RotateCcw, BookOpen } from 'lucide-react';

interface VictoryModalProps {
  winner: Player;
  otherPlayer: Player;
  turnCount: number;
  logs: AnsweredLog[];
  onRestart: () => void;
  onViewHistory: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  otherPlayer,
  turnCount,
  logs,
  onRestart,
  onViewHistory,
}) => {
  useEffect(() => {
    sound.playVictory();

    // Confetti cannon
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD23F', '#FF758F', '#80DED9', '#06D6A0'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD23F', '#FF758F', '#80DED9', '#06D6A0'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[10px_10px_0px_#1E1B18] p-6 sm:p-8 text-center max-h-[92vh] overflow-y-auto">
        {/* Floating Crown / Trophy */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto -mt-12 mb-3 rounded-2xl bg-[#FFD23F] border-4 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] flex items-center justify-center text-3xl sm:text-4xl rotate-3">
          🏆
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-[#FF758F] text-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] font-archivo text-xs uppercase tracking-wider mb-2">
          Love Milestone Tercapai!
        </div>

        <h2 className="font-archivo text-2xl sm:text-3xl text-[#1E1B18] leading-tight mb-2">
          SELAMAT {winner.name.toUpperCase()} & {otherPlayer.name.toUpperCase()}!
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 font-medium mb-6">
          Kalian berhasil menyelesaikan papan Snake Questions dan saling membuka hati dengan luar biasa.
        </p>

        {/* Couple Certificate Box */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] mb-5 text-left">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-dashed border-[#1E1B18]/30">
            <Gift className="w-5 h-5 text-[#FF5964]" />
            <h4 className="font-archivo text-sm text-[#1E1B18] uppercase">
              Kupon Hadiah Cinta Spesial:
            </h4>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed mb-3">
            Sebagai bentuk apresiasi atas kejujuran dan waktu yang kalian luangkan berdua, si pemenang berhak menukarkan salah satu kupon ini ke pasangannya:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-[#FEF3C7] border-2 border-[#1E1B18] text-xs font-bold text-[#1E1B18] flex items-center gap-2">
              <span>🎟️</span>
              <span>1x Traktiran Minuman/Makanan Favorit Bebas Pilih</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E0F2FE] border-2 border-[#1E1B18] text-xs font-bold text-[#1E1B18] flex items-center gap-2">
              <span>💆</span>
              <span>1x Pijatan Pundak / Pelukan Hangat Tanpa Batas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF0F3] border-2 border-[#1E1B18] text-xs font-bold text-[#1E1B18] flex items-center gap-2">
              <span>🎬</span>
              <span>1x Nonton Film Pilihanmu Tanpa Protes</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
            <span className="block font-archivo text-lg sm:text-xl text-[#1E1B18]">{turnCount}</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Putaran</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
            <span className="block font-archivo text-lg sm:text-xl text-[#FF758F]">{logs.length}</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Soal Terjawab</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
            <span className="block font-archivo text-lg sm:text-xl text-[#06D6A0]">100%</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Keintiman</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onViewHistory();
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white text-[#1E1B18] border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#1E1B18]" />
            <span>Lihat Catatan Soal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full flex-1 py-3 px-5 rounded-xl bg-[#FFD23F] text-[#1E1B18] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] font-archivo text-sm sm:text-base uppercase tracking-wider active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi Dari Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
