import React from 'react';
import { AnsweredLog } from '../types/game';
import { sound } from '../utils/audio';
import { BookOpen, X, Heart, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  logs: AnsweredLog[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-5 sm:p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1B18] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFD23F] rounded-xl border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
              <BookOpen className="w-5 h-5 text-[#1E1B18]" />
            </div>
            <div>
              <h3 className="font-archivo text-base sm:text-lg text-[#1E1B18] uppercase">
                Catatan Deep Talk Kita
              </h3>
              <p className="text-[11px] text-gray-600 font-medium">
                {logs.length} pertanyaan telah dibahas dalam sesi ini
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 text-[#1E1B18]" />
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#FFD23F]" />
              <p className="font-bold text-sm">Belum ada pertanyaan yang dijawab.</p>
              <p className="text-xs mt-1">Mulai lempar dadu untuk mengumpulkan memori berdua!</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id || index}
                className="p-3.5 rounded-2xl bg-white border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-base">{log.playerAvatar}</span>
                    <span className="text-gray-800">{log.playerName}</span>
                  </span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-300">
                    Putaran #{log.turnNumber}
                  </span>
                </div>
                <p className="font-medium text-xs sm:text-sm text-[#1E1B18] leading-relaxed">
                  "{log.questionText}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t-2 border-[#1E1B18] flex items-center justify-between text-xs text-gray-600 font-medium">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#FF758F] fill-current" />
            <span>Terus rawat komunikasi berdua</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#FFD23F] font-archivo text-xs border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
