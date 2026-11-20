import React, { useState, useEffect } from 'react';
import { Player, Question } from '../types/game';
import { sound } from '../utils/audio';
import { Heart, Timer, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);

  useEffect(() => {
    sound.playCardFlip();
    setIsFlipped(false);
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 120);
    return () => clearTimeout(timer);
  }, [dare.id]);

  const handleReroll = () => {
    sound.playCardFlip();
    setIsRerolling(true);
    setIsFlipped(false);
    setTimeout(() => {
      onReroll();
      setIsRerolling(false);
      setTimeout(() => setIsFlipped(true), 120);
    }, 320);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg select-none"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          {/* BACK OF CARD (Mystery Face) */}
          <div
            className="w-full bg-[#FF758F] text-white rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: isFlipped ? 'absolute' : 'relative',
              top: 0,
              left: 0,
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#FFFDF8] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] flex items-center justify-center text-4xl mb-4 animate-bounce">
              🎭
            </div>
            <h2 className="font-archivo text-xl sm:text-2xl uppercase tracking-wider text-white mb-1">
              Love Dare
            </h2>
            <p className="font-bold text-xs uppercase tracking-widest text-white/80 mb-4">
              Tantangan Romantis & Aksi Seru
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1B18] text-[#FFD23F] text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Membuka Tantangan...</span>
            </div>
          </div>

          {/* FRONT OF CARD (Dare Details) */}
          <div
            className="w-full bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-4 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="px-2.5 sm:px-3 py-1 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] font-archivo text-[11px] sm:text-xs uppercase tracking-wider rotate-[-1deg]">
                💌 LOVE DARE (AKSI MANIS)
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                {dare.tag}
              </span>
            </div>

            {/* Inner Card */}
            <div className="bg-[#FFFDF8] rounded-2xl border-3 border-[#1E1B18] p-3.5 sm:p-5 shadow-[3px_3px_0px_#1E1B18] mb-4 sm:mb-5 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-[#FF758F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-xl sm:text-2xl text-white">
                💖
              </div>

              <h3 className="font-archivo text-base sm:text-xl text-[#1E1B18] mb-1.5 sm:mb-2">
                {dare.title}
              </h3>

              <p className="font-grotesk text-sm sm:text-lg font-semibold text-[#1E1B18] leading-relaxed mb-3 sm:mb-4">
                {dare.question}
              </p>

              {dare.subPrompt && (
                <p className="text-xs sm:text-sm text-gray-600 italic bg-[#FAF6EE] p-2 sm:p-2.5 rounded-xl border border-[#1E1B18]/30">
                  {dare.subPrompt}
                </p>
              )}

              {/* Optional Interactive Timer */}
              {initialDuration && (
                <div className="mt-3 pt-2.5 border-t border-dashed border-[#1E1B18]/30">
                  {secondsLeft === null ? (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="px-3.5 py-1.5 rounded-xl bg-[#80DED9] text-[#1E1B18] font-archivo text-xs uppercase border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center gap-1.5 mx-auto active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Mulai Timer {initialDuration} Detik</span>
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="font-archivo text-2xl sm:text-3xl text-[#FF5964] animate-pulse">
                        {secondsLeft}s
                      </div>
                      <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                        {secondsLeft === 0 ? 'Waktu habis! Keren banget!' : 'Tahan jangan senyum/ketawa!'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={isRerolling}
                onClick={handleReroll}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-white text-[#1E1B18] border-2 sm:border-3 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] sm:shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E1B18] ${isRerolling ? 'animate-spin' : ''}`} />
                <span>Ganti Tantangan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onComplete();
                }}
                className="w-full flex-1 py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#FFD23F] text-[#1E1B18] border-2 sm:border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] sm:shadow-[4px_4px_0px_#1E1B18] font-archivo text-xs sm:text-base uppercase tracking-wider active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E1B18]" />
                <span>Selesai Dilakukan! Lanjut</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
