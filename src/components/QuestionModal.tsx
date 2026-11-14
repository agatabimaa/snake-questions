import React, { useState } from 'react';
import { Player, Question } from '../types/game';
import { sound } from '../utils/audio';
import { voiceOver } from '../utils/voiceOver';
import { Volume2, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

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
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleReadAloud = () => {
    sound.playClick();
    setIsSpeaking(true);
    voiceOver.speak(question.question, {
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Polaroid Card Container */}
      <div className="relative w-full max-w-lg bg-[#FAF6EE] rounded-3xl border-4 border-[#1E1B18] shadow-[8px_8px_0px_#1E1B18] p-5 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Top Floating Badge & Speak Button */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className={`px-3 py-1 rounded-full border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] font-archivo text-xs uppercase tracking-wider rotate-[-1deg] ${theme.banner}`}
          >
            {theme.sticker}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReadAloud}
              className={`p-1.5 rounded-xl border-2 border-[#1E1B18] shadow-[1.5px_1.5px_0px_#1E1B18] text-xs font-bold flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 ${
                isSpeaking ? 'bg-[#FFD23F] animate-pulse' : 'bg-white'
              }`}
              title="Dengarkan Soal (Voice Over)"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#1E1B18]" />
              <span className="text-[10px] hidden xs:inline">Bacakan</span>
            </button>

            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              {question.tag}
            </span>
          </div>
        </div>

        {/* Polaroid Inner Frame */}
        <div className="bg-[#FFFDF8] rounded-2xl border-3 border-[#1E1B18] p-4 sm:p-5 shadow-[3px_3px_0px_#1E1B18] mb-5">
          {/* Answering indicator */}
          <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg border border-[#1E1B18] w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD23F]" />
            <span>{theme.answeringText}</span>
          </div>

          {/* Title */}
          <h3 className="font-archivo text-lg sm:text-xl text-[#1E1B18] leading-tight mb-3">
            "{question.title}"
          </h3>

          {/* Question Text */}
          <p className="font-grotesk text-base sm:text-lg font-semibold text-[#1E1B18] leading-relaxed mb-4">
            {question.question}
          </p>

          {/* SubPrompt */}
          {question.subPrompt && (
            <div className="p-3 rounded-xl bg-[#FAF6EE] border-2 border-dashed border-[#1E1B18]/40 text-xs sm:text-sm text-gray-700 leading-relaxed italic">
              💡 {question.subPrompt}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              voiceOver.stop();
              onReroll();
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white text-[#1E1B18] border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 text-[#1E1B18]" />
            <span>Tukar Soal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              voiceOver.stop();
              onAnswerComplete();
            }}
            className="w-full flex-1 py-3 px-5 rounded-xl bg-[#06D6A0] text-[#1E1B18] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] font-archivo text-sm sm:text-base uppercase tracking-wider active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Sudah Dijawab! Lanjut</span>
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-500 font-medium">
          Dengarkan dengan penuh empati tanpa menyela atau menghakimi.
        </p>
      </div>
    </div>
  );
};
