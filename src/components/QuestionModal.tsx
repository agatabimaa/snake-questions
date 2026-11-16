import React, { useState, useEffect } from 'react';
import { Player, Question } from '../types/game';
import { sound } from '../utils/audio';
import { RefreshCw, CheckCircle2, Sparkles, Heart } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  activePlayer: Player;
  otherPlayer: Player;
  onAnswerComplete: () => void;
  onReroll: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  activePlayer,
  otherPlayer,
  onAnswerComplete,
  onReroll,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);

  useEffect(() => {
    sound.playCardFlip();
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

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

  const getCategoryTheme = () => {
    switch (question.category) {
      case 'BOY':
        return {
          banner: 'bg-[#80DED9]',
          sticker: 'SOAL KHUSUS COWOK 👦',
          borderColor: 'border-[#1E1B18]',
          answeringText: `Dijawab oleh ${activePlayer.gender === 'BOY' ? activePlayer.name : otherPlayer.name}`,
        };
      case 'GIRL':
        return {
          banner: 'bg-[#FF758F] text-white',
          sticker: 'SOAL KHUSUS CEWEK 👧',
          borderColor: 'border-[#1E1B18]',
          answeringText: `Dijawab oleh ${activePlayer.gender === 'GIRL' ? activePlayer.name : otherPlayer.name}`,
        };
      case 'DEEPTALK':
        return {
          banner: 'bg-[#B5A6C9]',
          sticker: 'DEEP TALK BERSAMA 💜',
          borderColor: 'border-[#1E1B18]',
          answeringText: 'Didiskusikan & dijawab berdua secara bergantian',
        };
      case 'LADDER_APPRECIATION':
        return {
          banner: 'bg-[#06D6A0]',
          sticker: 'TANGGA CINTA (+NAIK) 🪜',
          borderColor: 'border-[#1E1B18]',
          answeringText: `Apresiasi dari ${activePlayer.name} untuk ${otherPlayer.name}`,
        };
      case 'SNAKE_REFLECTION':
        return {
          banner: 'bg-[#FF5964] text-white',
          sticker: 'ULAR MANJA (-TURUN) 🐍',
          borderColor: 'border-[#1E1B18]',
          answeringText: `Refleksi & melunakkan ego bersama`,
        };
      case 'VIRTUAL_DARE':
      default:
        return {
          banner: 'bg-[#FFD23F]',
          sticker: 'LOVE DARE / VIRTUAL ACTION 💌',
          borderColor: 'border-[#1E1B18]',
          answeringText: `Tantangan manis untuk ${activePlayer.name}`,
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 3D Perspective Card Container */}
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
          {/* BACK OF CARD (Mystery card face shown before flip) */}
          <div
            className="w-full bg-[#FFD23F] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: isFlipped ? 'absolute' : 'relative',
              top: 0,
              left: 0,
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#FFFDF8] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] flex items-center justify-center text-4xl mb-4 animate-pulse">
              💌
            </div>
            <h2 className="font-archivo text-xl sm:text-2xl uppercase tracking-wider text-[#1E1B18] mb-1">
              Snake Questions
            </h2>
            <p className="font-bold text-xs uppercase tracking-widest text-[#1E1B18]/70 mb-4">
              Kartu Kejujuran & Cinta
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1B18] text-white text-xs font-bold animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD23F]" />
              <span>Membuka Kartu...</span>
            </div>
          </div>

          {/* FRONT OF CARD (Question details shown after flip) */}
          <div
            className="w-full bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-4 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Top Floating Badge */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <div
                className={`px-2.5 sm:px-3 py-1 rounded-full border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] font-archivo text-[11px] sm:text-xs uppercase tracking-wider rotate-[-1deg] ${theme.banner}`}
              >
                {theme.sticker}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  {question.tag}
                </span>
              </div>
            </div>

            {/* Polaroid Inner Frame */}
            <div className="bg-[#FFFDF8] rounded-2xl border-3 border-[#1E1B18] p-3.5 sm:p-5 shadow-[3px_3px_0px_#1E1B18] mb-4 sm:mb-5">
              {/* Answering indicator */}
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-[#1E1B18] w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD23F]" />
                <span>{theme.answeringText}</span>
              </div>

              {/* Title */}
              <h3 className="font-archivo text-base sm:text-xl text-[#1E1B18] leading-tight mb-2 sm:mb-3">
                "{question.title}"
              </h3>

              {/* Question Text */}
              <p className="font-grotesk text-sm sm:text-lg font-semibold text-[#1E1B18] leading-relaxed mb-3 sm:mb-4">
                {question.question}
              </p>

              {/* SubPrompt */}
              {question.subPrompt && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF6EE] border-2 border-dashed border-[#1E1B18]/40 text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  💡 {question.subPrompt}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={isRerolling}
                onClick={handleReroll}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-white text-[#1E1B18] border-2 sm:border-3 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] sm:shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E1B18] ${isRerolling ? 'animate-spin' : ''}`} />
                <span>Tukar Soal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onAnswerComplete();
                }}
                className="w-full flex-1 py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#06D6A0] text-[#1E1B18] border-2 sm:border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] sm:shadow-[4px_4px_0px_#1E1B18] font-archivo text-xs sm:text-base uppercase tracking-wider active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sudah Dijawab! Lanjut</span>
              </button>
            </div>

            <p className="mt-2.5 sm:mt-3 text-center text-[10px] sm:text-[11px] text-gray-500 font-medium">
              Dengarkan dengan penuh empati tanpa menyela atau menghakimi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
