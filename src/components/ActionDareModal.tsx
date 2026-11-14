import React, { useState, useEffect } from 'react';
import { Player, Question } from '../types/game';
import { sound } from '../utils/audio';
import { Heart, Timer, CheckCircle, RefreshCw } from 'lucide-react';

interface ActionDareModalProps {
  dare: Question;
  activePlayer: Player;
  otherPlayer: Player;
  onComplete: () => void;
  onReroll: () => void;
}

export const ActionDareModal: React.FC<ActionDareModalProps> = ({
  dare,
  activePlayer,
  otherPlayer,
  onComplete,
  onReroll,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // If the dare mentions seconds (e.g. 20 detik, 30 detik)
  const matchSeconds = dare.question.match(/(\d+)\s*detik/i);
  const initialDuration = matchSeconds ? parseInt(matchSeconds[1], 10) : null;

  const startTimer = () => {
    if (!initialDuration) return;
    setSecondsLeft(initialDuration);
    setTimerRunning(true);
    sound.playClick();
  };

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft !== null && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (secondsLeft === 0) {
      sound.playLadderClimb();
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-5 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Top Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="px-3 py-1 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] font-archivo text-xs uppercase tracking-wider rotate-[-1deg]">
            💌 LOVE DARE (AKSI MANIS)
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {dare.tag}
          </span>
        </div>

        {/* Inner Card */}
        <div className="bg-[#FFFDF8] rounded-2xl border-3 border-[#1E1B18] p-4 sm:p-5 shadow-[3px_3px_0px_#1E1B18] mb-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FF758F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-2xl text-white">
            💖
          </div>

          <h3 className="font-archivo text-lg sm:text-xl text-[#1E1B18] mb-2">
            {dare.title}
          </h3>

          <p className="font-grotesk text-base sm:text-lg font-semibold text-[#1E1B18] leading-relaxed mb-4">
            {dare.question}
          </p>

          {dare.subPrompt && (
            <p className="text-xs sm:text-sm text-gray-600 italic bg-[#FAF6EE] p-2.5 rounded-xl border border-[#1E1B18]/30">
              {dare.subPrompt}
            </p>
          )}

          {/* Optional Interactive Timer */}
          {initialDuration && (
            <div className="mt-4 pt-3 border-t border-dashed border-[#1E1B18]/30">
              {secondsLeft === null ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="px-4 py-2 rounded-xl bg-[#80DED9] text-[#1E1B18] font-archivo text-xs uppercase border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center gap-1.5 mx-auto active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Timer className="w-4 h-4" />
                  <span>Mulai Timer {initialDuration} Detik</span>
                </button>
              ) : (
                <div className="text-center">
                  <div className="font-archivo text-3xl text-[#FF5964] animate-pulse">
                    {secondsLeft}s
                  </div>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    {secondsLeft === 0 ? 'Waktu habis! Keren banget!' : 'Tahan jangan senyum/ketawa!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onReroll();
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white text-[#1E1B18] border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-[#1E1B18]" />
            <span>Ganti Tantangan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onComplete();
            }}
            className="w-full flex-1 py-3 px-5 rounded-xl bg-[#FFD23F] text-[#1E1B18] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] font-archivo text-sm sm:text-base uppercase tracking-wider active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-[#1E1B18]" />
            <span>Selesai Dilakukan! Lanjut</span>
          </button>
        </div>
      </div>
    </div>
  );
};
