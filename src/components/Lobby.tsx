import React, { useState } from 'react';
import { Player, GameMode } from '../types/game';
import { sound } from '../utils/audio';
import { Heart, Sparkles, Video, Users, ArrowRight } from 'lucide-react';

interface LobbyProps {
  onStartGame: (p1: Player, p2: Player, mode: GameMode) => void;
}

const AVATAR_OPTIONS = ['🦁', '🐱', '🦦', '🦖', '🦕', '☕', '🧋', '☀️', '🌙', '🌸'];

export const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
  const [p1Name, setP1Name] = useState('Bima');
  const [p1Avatar, setP1Avatar] = useState('🦁');

  const [p2Name, setP2Name] = useState('Agata');
  const [p2Avatar, setP2Avatar] = useState('🌸');

  const [mode, setMode] = useState<GameMode>('LDR');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    sound.playLadderClimb();

    const player1: Player = {
      id: 'p1',
      name: p1Name.trim() || 'Dia (Cowok)',
      gender: 'BOY',
      avatar: p1Avatar,
      color: '#80DED9',
      bgColor: 'bg-[#80DED9]',
      borderColor: 'border-[#1E1B18]',
      position: 1,
      stepsTaken: 0,
      questionsAnswered: 0,
      laddersClimbed: 0,
      snakesSlid: 0,
    };

    const player2: Player = {
      id: 'p2',
      name: p2Name.trim() || 'Dia (Cewek)',
      gender: 'GIRL',
      avatar: p2Avatar,
      color: '#FF758F',
      bgColor: 'bg-[#FF758F]',
      borderColor: 'border-[#1E1B18]',
      position: 1,
      stepsTaken: 0,
      questionsAnswered: 0,
      laddersClimbed: 0,
      snakesSlid: 0,
    };

    onStartGame(player1, player2, mode);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Hero Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] text-xs font-bold uppercase tracking-wider rotate-[-1deg] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#1E1B18]" />
          <span>Edisi Pasangan & Deep Talk</span>
        </div>
        <h2 className="font-archivo text-3xl sm:text-4xl text-[#1E1B18] tracking-tight uppercase leading-none drop-shadow-sm">
          SNAKE QUESTIONS
        </h2>
        <p className="mt-2 text-sm sm:text-base font-medium text-gray-700 max-w-md mx-auto">
          Ular tangga interaktif untuk saling mengenal lebih dalam, bertukar pikiran, dan melunakkan ego bersama pasangan tercinta.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Mode Selector Card */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Pilih Situasi Hubungan Kalian:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* LDR Mode */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('LDR');
              }}
              className={`p-3 rounded-xl border-3 border-[#1E1B18] text-left transition-all ${
                mode === 'LDR'
                  ? 'bg-[#FFD23F] shadow-[3px_3px_0px_#1E1B18] -translate-y-0.5'
                  : 'bg-white shadow-[1px_1px_0px_#1E1B18] opacity-75'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-[#1E1B18]" />
                <span className="font-archivo text-sm uppercase">LDR / Video Call</span>
              </div>
              <p className="text-[11px] text-gray-700 leading-tight">
                Tantangan disesuaikan via telponan (Voice Note, kirim PAP, share lagu, tatap layar).
              </p>
            </button>

            {/* Offline Mode */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('OFFLINE');
              }}
              className={`p-3 rounded-xl border-3 border-[#1E1B18] text-left transition-all ${
                mode === 'OFFLINE'
                  ? 'bg-[#06D6A0] shadow-[3px_3px_0px_#1E1B18] -translate-y-0.5'
                  : 'bg-white shadow-[1px_1px_0px_#1E1B18] opacity-75'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#1E1B18]" />
                <span className="font-archivo text-sm uppercase">Satu Tempat</span>
              </div>
              <p className="text-[11px] text-gray-700 leading-tight">
                Ketemu langsung (tatap mata langsung, pelukan hangat, genggam tangan).
              </p>
            </button>
          </div>
        </div>

        {/* Player 1 Card (Cowok / Pasangan 1) */}
        <div className="p-4 rounded-2xl bg-[#E0F2FE] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#80DED9] border-2 border-[#1E1B18] text-xs font-bold uppercase shadow-[1px_1px_0px_#1E1B18]">
              👦 Pemain 1 (Cowok)
            </span>
            <span className="text-2xl">{p1Avatar}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                placeholder="Contoh: Bima"
                required
                className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#1E1B18] font-bold text-sm shadow-[2px_2px_0px_#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#80DED9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Avatar:</label>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`p1-${av}`}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setP1Avatar(av);
                    }}
                    className={`w-9 h-9 rounded-lg border-2 border-[#1E1B18] flex items-center justify-center text-lg transition-all ${
                      p1Avatar === av
                        ? 'bg-[#80DED9] shadow-[2px_2px_0px_#1E1B18] -translate-y-0.5'
                        : 'bg-white shadow-[1px_1px_0px_#1E1B18]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Card (Cewek / Pasangan 2) */}
        <div className="p-4 rounded-2xl bg-[#FFF0F3] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF758F] text-white border-2 border-[#1E1B18] text-xs font-bold uppercase shadow-[1px_1px_0px_#1E1B18]">
              👧 Pemain 2 (Cewek)
            </span>
            <span className="text-2xl">{p2Avatar}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder="Contoh: Agata"
                required
                className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#1E1B18] font-bold text-sm shadow-[2px_2px_0px_#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#FF758F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Avatar:</label>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`p2-${av}`}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setP2Avatar(av);
                    }}
                    className={`w-9 h-9 rounded-lg border-2 border-[#1E1B18] flex items-center justify-center text-lg transition-all ${
                      p2Avatar === av
                        ? 'bg-[#FF758F] text-white shadow-[2px_2px_0px_#1E1B18] -translate-y-0.5'
                        : 'bg-white shadow-[1px_1px_0px_#1E1B18]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#FFD23F] text-[#1E1B18] font-archivo text-lg sm:text-xl uppercase tracking-wider border-4 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group"
        >
          <span>MULAI DEEP TALK BERSAMA</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-xs text-gray-500 font-medium">
          ❤️ Tips: Siapkan segelas minuman favorit dan tempat yang tenang agar obrolan mengalir santai.
        </p>
      </form>
    </div>
  );
};
