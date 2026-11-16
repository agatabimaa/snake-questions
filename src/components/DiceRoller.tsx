import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { announcer } from '../utils/announcer';
import { Dices, Eye, Sparkles, Hourglass, Copy, Check } from 'lucide-react';

interface DiceRollerProps {
  activePlayer: Player;
  onRollComplete: (diceValue: number) => void;
  disabled?: boolean;
  isMyTurn?: boolean;
  isMultiplayer?: boolean;
  roomCode?: string;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  activePlayer,
  onRollComplete,
  disabled = false,
  isMyTurn = true,
  isMultiplayer = false,
  roomCode,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [gaugePower, setGaugePower] = useState(0); // 0 to 100
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number>(1);
  const [toastComment, setToastComment] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // 3D rotation angles
  const [cubeRotation, setCubeRotation] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  const holdIntervalRef = useRef<any>(null);
  const powerDirectionRef = useRef<number>(1);
  const rollAnimationRef = useRef<any>(null);

  // Map dice number to 3D rotation
  const getRotationForFace = (val: number): { x: number; y: number } => {
    switch (val) {
      case 1:
        return { x: 0, y: 0 }; // Front
      case 2:
        return { x: 0, y: -90 }; // Right
      case 3:
        return { x: -90, y: 0 }; // Top
      case 4:
        return { x: 90, y: 0 }; // Bottom
      case 5:
        return { x: 0, y: 90 }; // Left
      case 6:
      default:
        return { x: 0, y: 180 }; // Back
    }
  };

  const getMeterLabel = (power: number) => {
    if (power < 35) return { text: 'SANTAI', color: 'bg-[#80DED9]', tip: 'Kocokan tenang' };
    if (power < 75) return { text: 'INTIM', color: 'bg-[#FFD23F]', tip: 'Kocokan hangat' };
    return { text: 'DEEP TALK ★', color: 'bg-[#FF5964] text-white', tip: 'Kekuatan penuh!' };
  };

  const startHold = () => {
    if (disabled || isRolling || (!isMyTurn && isMultiplayer)) return;
    setIsHolding(true);
    setToastComment(null);

    powerDirectionRef.current = 1;
    let currentPower = 0;

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      sound.playDiceShake();
      currentPower += powerDirectionRef.current * 4;
      if (currentPower >= 100) {
        currentPower = 100;
        powerDirectionRef.current = -1;
      } else if (currentPower <= 0) {
        currentPower = 0;
        powerDirectionRef.current = 1;
      }
      setGaugePower(currentPower);

      // Jiggle the 3D cube while shaking
      setCubeRotation((prev) => ({
        x: prev.x + (Math.random() * 20 - 10),
        y: prev.y + (Math.random() * 20 - 10),
        z: prev.z + (Math.random() * 10 - 5),
      }));
    }, 40);
  };

  const endHold = () => {
    if (!isHolding || disabled || isRolling || (!isMyTurn && isMultiplayer)) return;
    setIsHolding(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    triggerDramaticRoll();
  };

  // Dramatic slowed-down 3D roll (takes ~2.5 seconds with clear physical deceleration)
  const triggerDramaticRoll = () => {
    setIsRolling(true);
    const finalVal = Math.floor(Math.random() * 6) + 1;
    const finalRot = getRotationForFace(finalVal);

    // Multi-turn 3D tumble
    const extraRotations = 4 + Math.floor(Math.random() * 2);
    const targetX = extraRotations * 360 + finalRot.x;
    const targetY = extraRotations * 360 + finalRot.y;

    const startTime = performance.now();
    const duration = 2500; // 2.5s slowed-down dramatic roll

    let lastSoundTick = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Deceleration curve (Cubic ease out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const curX = targetX * easeProgress;
      const curY = targetY * easeProgress;
      const curZ = Math.sin(progress * Math.PI * 4) * 35 * (1 - progress);

      setCubeRotation({ x: curX, y: curY, z: curZ });

      // Play tumble sound periodically, slower towards the end
      if (now - lastSoundTick > 100 + progress * 280) {
        sound.playDiceTumble(progress);
        lastSoundTick = now;
      }

      if (progress < 1) {
        rollAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Landing impact!
        setCubeRotation({ x: finalRot.x, y: finalRot.y, z: 0 });
        setDiceResult(finalVal);
        sound.playDiceLand(finalVal);
        announcer.announceDice(finalVal);

        // Feedback toast
        let comment = '';
        if (finalVal === 1) {
          comment = '😅 Dadu 1! Santai, pelan-pelan tapi pasti.';
        } else if (finalVal === 6) {
          comment = '🔥 HOKI MAKSIMAL! Dadu 6 mendarat!';
        } else {
          comment = `🎲 Dadu ${finalVal}! Melangkah bersama.`;
        }
        setToastComment(comment);

        // Suspense pause (850ms) so players can clearly see the result before movement starts
        setTimeout(() => {
          setIsRolling(false);
          onRollComplete(finalVal);
        }, 850);
      }
    };

    rollAnimationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (rollAnimationRef.current) cancelAnimationFrame(rollAnimationRef.current);
    };
  }, []);

  const copyRoomCode = () => {
    if (!roomCode) return;
    sound.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const meter = getMeterLabel(gaugePower);
  const canRollNow = !disabled && !isRolling && (isMyTurn || !isMultiplayer);

  return (
    <div className="w-full max-w-md mx-auto px-1 sm:px-2 my-1 sm:my-2 z-20">
      <div className="relative bg-[#FAF6EE] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] sm:shadow-[6px_6px_0px_#1E1B18]">
        {/* Header inside hub: Room code info & Minimize */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          {roomCode ? (
            <button
              type="button"
              onClick={copyRoomCode}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#80DED9] border border-[#1E1B18] sm:border-2 shadow-[1px_1px_0px_#1E1B18] text-[9px] sm:text-xs font-archivo uppercase active:translate-x-0.5 active:translate-y-0.5"
              title="Klik untuk salin kode room"
            >
              <span>🏠 Room: {roomCode}</span>
              {copiedCode ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-700" /> : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD23F] border border-[#1E1B18] sm:border-2 shadow-[1px_1px_0px_#1E1B18] text-[9px] sm:text-[10px] font-archivo uppercase">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Kocok Dadu</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="px-2 py-0.5 rounded-full bg-white border border-[#1E1B18] sm:border-2 shadow-[1px_1px_0px_#1E1B18] text-[9px] sm:text-[10px] font-bold text-gray-700 flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
            title="Sembunyikan dadu untuk melihat seluruh petak"
          >
            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Intip Papan</span>
          </button>
        </div>

        {/* Toast Comment */}
        {toastComment && (
          <div className="mb-2 text-center animate-in fade-in">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFFDF8] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] text-xs font-bold text-[#1E1B18] animate-bounce">
              {toastComment}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* REAL 3D CUBE DICE */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center select-none"
              style={{ perspective: '900px' }}
            >
              <div
                className="relative w-14 h-14 transition-transform ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg) rotateZ(${cubeRotation.z}deg)`,
                }}
              >
                {/* Face 1: Front */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl flex items-center justify-center shadow-inner"
                  style={{ transform: 'rotateY(0deg) translateZ(28px)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#FF5964] shadow-sm" />
                </div>

                {/* Face 6: Back */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl p-1.5 grid grid-cols-2 grid-rows-3 gap-0.5 shadow-inner"
                  style={{ transform: 'rotateY(180deg) translateZ(28px)' }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#1E1B18] m-auto" />
                  ))}
                </div>

                {/* Face 2: Right */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl p-1.5 flex flex-col justify-between shadow-inner"
                  style={{ transform: 'rotateY(90deg) translateZ(28px)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E1B18] self-start" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E1B18] self-end" />
                </div>

                {/* Face 5: Left */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl p-1.5 grid grid-cols-3 grid-rows-3 gap-0.5 shadow-inner"
                  style={{ transform: 'rotateY(-90deg) translateZ(28px)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18] m-auto" />
                  <div />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                </div>

                {/* Face 3: Top */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl p-1.5 flex flex-col justify-between shadow-inner"
                  style={{ transform: 'rotateX(90deg) translateZ(28px)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18] self-start" />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18] self-center" />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18] self-end" />
                </div>

                {/* Face 4: Bottom */}
                <div
                  className="absolute inset-0 bg-[#FFFDF8] border-3 border-[#1E1B18] rounded-xl p-1.5 grid grid-cols-2 grid-rows-2 gap-1.5 shadow-inner"
                  style={{ transform: 'rotateX(-90deg) translateZ(28px)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                  <div className="w-2 h-2 rounded-full bg-[#1E1B18]" />
                </div>
              </div>
            </div>

            {/* Dynamic 3D Floor Shadow */}
            <div
              className={`w-12 h-2.5 rounded-full bg-[#1E1B18]/25 blur-[1px] transition-all duration-200 -mt-1 mb-0.5 ${
                isRolling ? 'scale-75 opacity-40' : 'scale-100 opacity-80'
              }`}
            />

            <span className="text-[10px] font-bold text-gray-700">
              {activePlayer.avatar} {activePlayer.name}
            </span>
          </div>

          {/* Controls: Gauge & Hold Button */}
          <div className="flex-1">
            {canRollNow ? (
              <>
                <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                  <span className="text-gray-700">Tingkat Kedalaman:</span>
                  <span className={`px-1.5 py-0.5 rounded border border-[#1E1B18] text-[9px] ${meter.color}`}>
                    {meter.text}
                  </span>
                </div>

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

                <button
                  type="button"
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  disabled={isRolling}
                  className={`w-full mt-2 py-3 px-3 rounded-2xl border-3 border-[#1E1B18] font-archivo text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 select-none transition-all ${
                    isRolling
                      ? 'bg-[#FFD23F] text-[#1E1B18] animate-pulse cursor-wait'
                      : isHolding
                      ? 'bg-[#FF5964] text-white shadow-none translate-x-1 translate-y-1'
                      : 'bg-[#FFD23F] text-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] hover:-translate-y-0.5'
                  }`}
                >
                  <Dices className="w-4 h-4" />
                  <span>
                    {isRolling
                      ? 'Dadu Menggelinding...'
                      : isHolding
                      ? 'LEPASKAN UNTUK LEMPAR!'
                      : 'TAHAN UNTUK KOCOK'}
                  </span>
                </button>
              </>
            ) : (
              <div className="py-3 px-3 rounded-2xl bg-gray-100 border-2 border-dashed border-[#1E1B18]/40 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 mb-0.5">
                  <Hourglass className="w-3.5 h-3.5 animate-spin text-[#FF5964]" />
                  <span>Giliran {activePlayer.name}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">
                  {isRolling ? 'Dadu sedang menggelinding...' : 'Sedang bersiap mengocok dadu dari HP-nya...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
