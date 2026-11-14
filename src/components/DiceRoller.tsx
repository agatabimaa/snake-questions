import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Dices, Eye, EyeOff, Sparkles } from 'lucide-react';

interface DiceRollerProps {
  activePlayer: Player;
  onRollComplete: (diceValue: number) => void;
  disabled?: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  activePlayer,
  onRollComplete,
  disabled = false,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [gaugePower, setGaugePower] = useState(0); // 0 to 100
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [toastComment, setToastComment] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const holdIntervalRef = useRef<any>(null);
  const powerDirectionRef = useRef<number>(1);

  // Meter levels ala MainWarga62
  const getMeterLabel = (power: number) => {
    if (power < 35) return { text: 'SANTAI', color: 'bg-[#80DED9]', tip: 'Kocokan santai & tenang' };
    if (power < 75) return { text: 'INTIM', color: 'bg-[#FFD23F]', tip: 'Kocokan hangat penuh cinta' };
    return { text: 'DEEP TALK ★', color: 'bg-[#FF5964] text-white', tip: 'Kekuatan penuh! Siap buka hati' };
  };

  const startHold = () => {
    if (disabled || isRolling) return;
    setIsHolding(true);
    setToastComment(null);
    sound.playDiceRattle();

    powerDirectionRef.current = 1;
    let currentPower = 0;

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      currentPower += powerDirectionRef.current * 5;
      if (currentPower >= 100) {
        currentPower = 100;
        powerDirectionRef.current = -1;
      } else if (currentPower <= 0) {
        currentPower = 0;
        powerDirectionRef.current = 1;
      }
      setGaugePower(currentPower);
    }, 25);
  };

  const endHold = () => {
    if (!isHolding || disabled || isRolling) return;
    setIsHolding(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    triggerRoll(gaugePower);
  };

  const triggerRoll = (power: number) => {
    setIsRolling(true);
    sound.playDiceRattle();

    // Roll animation cycling random numbers
    let rollTicks = 0;
    const rollTimer = setInterval(() => {
      rollTicks++;
      const tempNum = Math.floor(Math.random() * 6) + 1;
      setDiceResult(tempNum);

      if (rollTicks > 12) {
        clearInterval(rollTimer);
        const finalNum = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalNum);
        setIsRolling(false);
        sound.playPawnHop();

        // Playful commentary
        let comment = '';
        if (finalNum === 1) {
          comment = '😅 Dadu 1! Santai, pelan-pelan tapi pasti.';
        } else if (finalNum === 6) {
          comment = '🔥 HOKI MAKSIMAL! Dadu 6 meluncur!';
        } else if (power > 75) {
          comment = `✨ DEEP TALK POWER! Dadu ${finalNum} mendarat!`;
        } else {
          comment = `🎲 Dadu ${finalNum}! Siap melangkah bersama.`;
        }
        setToastComment(comment);

        onRollComplete(finalNum);
      }
    }, 65);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const meter = getMeterLabel(gaugePower);

  // Render 3D-ish dice face
  const renderDiceFace = (val: number | null) => {
    const dots: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const currentDots = val ? dots[val] || [] : [4];

    return (
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] p-2 grid grid-cols-3 grid-rows-3 gap-0.5 transition-all select-none ${
          isRolling ? 'rotate-12 scale-110 animate-spin' : ''
        }`}
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {currentDots.includes(idx) && (
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1E1B18]" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Minimized docked view
  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 z-30">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-3 py-2 rounded-2xl bg-[#FFD23F] border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] font-archivo text-xs uppercase flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <Dices className="w-4 h-4 text-[#1E1B18]" />
          <span>Buka Dadu di Tengah</span>
        </button>
      </div>
    );
  }

  // Center Game Hub ("Dadunya seakan-akan ada di tengah permainan")
  return (
    <div className="w-full max-w-md mx-auto px-3 my-2 z-20">
      <div className="relative bg-[#FAF6EE] p-3 sm:p-4 rounded-3xl border-4 border-[#1E1B18] shadow-[6px_6px_0px_#1E1B18]">
        {/* Minimize / Intip Papan Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="absolute -top-3 right-3 px-2 py-0.5 rounded-full bg-white border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] text-[10px] font-bold text-gray-700 flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
          title="Sembunyikan sementara untuk melihat papan"
        >
          <Eye className="w-3 h-3" />
          <span>Intip Papan</span>
        </button>

        {/* Center Title Badge */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] text-[10px] font-archivo uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Pusat Kocok Dadu Cinta</span>
          </div>
        </div>

        {/* Toast Comment Banner */}
        {toastComment && (
          <div className="mb-2 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFFDF8] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] text-xs font-bold text-[#1E1B18] animate-bounce">
              {toastComment}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* 3D Dice Display */}
          <div className="flex flex-col items-center gap-1">
            {renderDiceFace(diceResult)}
            <span className="text-[10px] font-bold text-gray-700">
              {activePlayer.avatar} {activePlayer.name}
            </span>
          </div>

          {/* Controls: Gauge & Hold Button */}
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
              <span className="text-gray-700">Tingkat Kedalaman:</span>
              <span className={`px-1.5 py-0.5 rounded border border-[#1E1B18] text-[9px] ${meter.color}`}>
                {meter.text}
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-3 bg-white rounded-full border-2 border-[#1E1B18] overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  gaugePower < 35
                    ? 'bg-[#80DED9]'
                    : gaugePower < 75
                    ? 'bg-[#FFD23F]'
                    : 'bg-[#FF5964]'
                }`}
                style={{ width: `${gaugePower}%` }}
              />
            </div>

            {/* Hold to roll button */}
            <button
              type="button"
              onMouseDown={startHold}
              onMouseUp={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              disabled={disabled || isRolling}
              className={`w-full mt-2 py-2.5 px-3 rounded-2xl border-3 border-[#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all ${
                disabled || isRolling
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : isHolding
                  ? 'bg-[#FF5964] text-white shadow-none translate-x-1 translate-y-1'
                  : 'bg-[#FFD23F] text-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] hover:-translate-y-0.5'
              }`}
            >
              <Dices className="w-4 h-4" />
              <span>
                {isRolling
                  ? 'Menggelinding...'
                  : isHolding
                  ? 'LEPASKAN SEKARANG!'
                  : 'TAHAN UNTUK KOCOK'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
