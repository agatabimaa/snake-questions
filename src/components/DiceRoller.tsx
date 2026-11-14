import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Dices, Sparkles } from 'lucide-react';

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
      currentPower += powerDirectionRef.current * 4;
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
        // Final roll outcome (1-6)
        const finalNum = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalNum);
        setIsRolling(false);
        sound.playPawnHop();

        // Playful commentary ala MainWarga62
        let comment = '';
        if (finalNum === 1) {
          comment = '😅 Cuma dapet 1! Pelan-pelan asal selamat.';
        } else if (finalNum === 6) {
          comment = '🔥 HOKI MAKSIMAL! Dadu 6 meluncur kencang!';
        } else if (power > 75) {
          comment = `✨ DEEP TALK POWER! Dadu ${finalNum} mendarat sempurna.`;
        } else {
          comment = `🎲 Dadu ${finalNum}! Saatnya melangkah bersama.`;
        }
        setToastComment(comment);

        // Notify parent
        onRollComplete(finalNum);
      }
    }, 60);
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
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] p-2 grid grid-cols-3 grid-rows-3 gap-0.5 transition-transform ${
        isRolling ? 'rotate-12 scale-110 animate-spin' : ''
      }`}>
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

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2 sticky bottom-2 z-20">
      <div className="bg-[#FAF6EE] p-3 sm:p-4 rounded-2xl border-4 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18]">
        {/* Toast Comment Banner */}
        {toastComment && (
          <div className="mb-2 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] text-xs font-bold text-[#1E1B18] animate-bounce">
              {toastComment}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Dice Face Container */}
          <div className="flex items-center gap-2">
            {renderDiceFace(diceResult)}
            <div className="hidden xs:block text-left">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">
                Giliran Pemain
              </span>
              <span className="font-archivo text-sm text-[#1E1B18] flex items-center gap-1">
                {activePlayer.avatar} {activePlayer.name}
              </span>
            </div>
          </div>

          {/* Hold Button & Power Gauge */}
          <div className="flex-1 max-w-xs">
            {/* Power Gauge Bar */}
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold">
              <span className="text-gray-600">Meter Kedalaman:</span>
              <span className={`px-1.5 py-0.2 rounded border border-[#1E1B18] text-[9px] ${meter.color}`}>
                {meter.text}
              </span>
            </div>

            <div className="w-full h-3.5 bg-white rounded-full border-2 border-[#1E1B18] overflow-hidden p-0.5 shadow-inner">
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

            {/* Hold to Roll Button */}
            <button
              type="button"
              onMouseDown={startHold}
              onMouseUp={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              disabled={disabled || isRolling}
              className={`w-full mt-2 py-2.5 px-3 rounded-xl border-3 border-[#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all ${
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
                  ? 'LEPASKAN UNTUK LEMPAR!'
                  : 'TAHAN UNTUK KOCOK DADU'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
