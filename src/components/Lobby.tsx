import React, { useState, useEffect } from 'react';
import { Player, PlayMode } from '../types/game';
import { sound } from '../utils/audio';
import { multiplayer } from '../utils/multiplayer';
import { Sparkles, Users, Globe, Copy, Check, Share2, ArrowRight, Loader2 } from 'lucide-react';

interface LobbyProps {
  onStartLocalGame: (p1: Player, p2: Player) => void;
  onStartOnlineGame: (myPlayer: Player, otherPlayer: Player, isHost: boolean) => void;
}

const AVATAR_OPTIONS = ['🦁', '🐱', '🦦', '🦖', '🦕', '☕', '🧋', '☀️', '🌙', '🌸', '🦊', '🐼'];

export const Lobby: React.FC<LobbyProps> = ({
  onStartLocalGame,
  onStartOnlineGame,
}) => {
  // Check URL params for invited room
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const invitedRoomCode = queryParams.get('room') || '';

  const [playMode, setPlayMode] = useState<PlayMode>(invitedRoomCode ? 'ONLINE_ROOM' : 'ONLINE_ROOM');
  const [onlineTab, setOnlineTab] = useState<'CREATE' | 'JOIN'>(invitedRoomCode ? 'JOIN' : 'CREATE');

  // Single player profile (saved in localStorage)
  const [myName, setMyName] = useState(() => {
    return localStorage.getItem('sq_name') || (invitedRoomCode ? 'Agata' : 'Bima');
  });
  const [myGender, setMyGender] = useState<'BOY' | 'GIRL'>(() => {
    return (localStorage.getItem('sq_gender') as any) || (invitedRoomCode ? 'GIRL' : 'BOY');
  });
  const [myAvatar, setMyAvatar] = useState(() => {
    return localStorage.getItem('sq_avatar') || (invitedRoomCode ? '🌸' : '🦁');
  });

  // Local 1-Device mode extra inputs
  const [p2LocalName, setP2LocalName] = useState('Agata');
  const [p2LocalAvatar, setP2LocalAvatar] = useState('🌸');

  // Online Room State
  const [roomCodeInput, setRoomCodeInput] = useState(invitedRoomCode);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [waitingForGuest, setWaitingForGuest] = useState(false);
  const [guestConnected, setGuestConnected] = useState<Player | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('sq_name', myName);
    localStorage.setItem('sq_gender', myGender);
    localStorage.setItem('sq_avatar', myAvatar);
  }, [myName, myGender, myAvatar]);

  // Handle Host creating a room
  const handleCreateRoom = async () => {
    sound.playClick();
    setErrorMessage('');
    const code = multiplayer.generateCode();

    try {
      setWaitingForGuest(true);
      await multiplayer.createRoom(code);
      setCreatedRoomCode(code);

      // Listen for partner connection
      multiplayer.onEvent((event) => {
        if (event.type === 'GUEST_JOINED') {
          sound.playLadderClimb();
          setGuestConnected(event.player);
        }
      });
    } catch (e: any) {
      setWaitingForGuest(false);
      setErrorMessage('Gagal membuat room. Silakan coba lagi.');
    }
  };

  // Host starts the game once guest joined
  const handleHostStartGame = () => {
    if (!guestConnected) return;
    sound.playClick();
    sound.playLadderClimb();

    const hostPlayer: Player = {
      id: 'p1',
      name: myName.trim() || 'Dia (P1)',
      gender: myGender,
      avatar: myAvatar,
      color: '#80DED9',
      bgColor: 'bg-[#80DED9]',
      borderColor: 'border-[#1E1B18]',
      position: 1,
      stepsTaken: 0,
      questionsAnswered: 0,
      laddersClimbed: 0,
      snakesSlid: 0,
    };

    multiplayer.send({
      type: 'START_GAME',
      player1: hostPlayer,
      player2: guestConnected,
    });

    onStartOnlineGame(hostPlayer, guestConnected, true);
  };

  // Guest joining an existing room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    sound.playClick();
    setJoiningLoading(true);
    setErrorMessage('');

    try {
      await multiplayer.joinRoom(roomCodeInput.trim());

      const guestPlayer: Player = {
        id: 'p2',
        name: myName.trim() || 'Dia (P2)',
        gender: myGender,
        avatar: myAvatar,
        color: '#FF758F',
        bgColor: 'bg-[#FF758F]',
        borderColor: 'border-[#1E1B18]',
        position: 1,
        stepsTaken: 0,
        questionsAnswered: 0,
        laddersClimbed: 0,
        snakesSlid: 0,
      };

      // Notify host that guest joined
      multiplayer.send({
        type: 'GUEST_JOINED',
        player: guestPlayer,
      });

      // Listen for host starting the game
      multiplayer.onEvent((event) => {
        if (event.type === 'START_GAME') {
          sound.playLadderClimb();
          onStartOnlineGame(guestPlayer, event.player1, false);
        }
      });
    } catch (err) {
      setJoiningLoading(false);
      setErrorMessage('Room tidak ditemukan atau kode salah. Pastikan pasangan sudah membuat room.');
    }
  };

  // Share / Copy Link
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${createdRoomCode}`
    : '';

  const copyShareLink = () => {
    sound.playClick();
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareToWhatsapp = () => {
    sound.playClick();
    const text = encodeURIComponent(
      `Sayang, yuk main Snake Questions berdua lewat HP! Klik link ini untuk masuk ke room kita: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Local Pass & Play start
  const handleStartLocal = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    sound.playLadderClimb();

    const p1: Player = {
      id: 'p1',
      name: myName.trim() || 'Pemain 1',
      gender: myGender,
      avatar: myAvatar,
      color: '#80DED9',
      bgColor: 'bg-[#80DED9]',
      borderColor: 'border-[#1E1B18]',
      position: 1,
      stepsTaken: 0,
      questionsAnswered: 0,
      laddersClimbed: 0,
      snakesSlid: 0,
    };

    const p2: Player = {
      id: 'p2',
      name: p2LocalName.trim() || 'Pemain 2',
      gender: myGender === 'BOY' ? 'GIRL' : 'BOY',
      avatar: p2LocalAvatar,
      color: '#FF758F',
      bgColor: 'bg-[#FF758F]',
      borderColor: 'border-[#1E1B18]',
      position: 1,
      stepsTaken: 0,
      questionsAnswered: 0,
      laddersClimbed: 0,
      snakesSlid: 0,
    };

    onStartLocalGame(p1, p2);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-8 select-none">
      {/* Hero Badge */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] text-xs font-bold uppercase tracking-wider rotate-[-1deg] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#1E1B18]" />
          <span>Ular Tangga Cinta & Deep Talk</span>
        </div>
        <h2 className="font-archivo text-3xl sm:text-4xl text-[#1E1B18] tracking-tight uppercase leading-none drop-shadow-sm">
          SNAKE QUESTIONS
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-gray-700 max-w-md mx-auto">
          Tukar pikiran, saling membuka hati, dan tertawa bersama pasangan lewat HP masing-masing.
        </p>
      </div>

      {/* Main Mode Toggle: Online LDR vs 1 HP */}
      <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setPlayMode('ONLINE_ROOM');
          }}
          className={`py-2.5 px-3 rounded-xl font-archivo text-xs sm:text-sm uppercase flex items-center justify-center gap-1.5 transition-all ${
            playMode === 'ONLINE_ROOM'
              ? 'bg-[#FFD23F] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] -translate-y-0.5'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <Globe className="w-4 h-4 text-[#1E1B18]" />
          <span>LDR (2 HP / Online)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setPlayMode('LOCAL_1_DEVICE');
          }}
          className={`py-2.5 px-3 rounded-xl font-archivo text-xs sm:text-sm uppercase flex items-center justify-center gap-1.5 transition-all ${
            playMode === 'LOCAL_1_DEVICE'
              ? 'bg-[#06D6A0] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] -translate-y-0.5'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4 text-[#1E1B18]" />
          <span>Main di 1 HP</span>
        </button>
      </div>

      {/* Profile Card (Always filled by the current player) */}
      <div className="p-4 rounded-3xl bg-[#FFFDF8] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-archivo text-xs uppercase text-gray-700">
            Profil Kamu:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMyGender('BOY');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border-2 border-[#1E1B18] transition-all ${
                myGender === 'BOY' ? 'bg-[#80DED9] shadow-[1.5px_1.5px_0px_#1E1B18]' : 'bg-gray-100'
              }`}
            >
              👦 Cowok
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMyGender('GIRL');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border-2 border-[#1E1B18] transition-all ${
                myGender === 'GIRL' ? 'bg-[#FF758F] text-white shadow-[1.5px_1.5px_0px_#1E1B18]' : 'bg-gray-100'
              }`}
            >
              👧 Cewek
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Nama Panggilan Kamu
            </label>
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Misal: Bima"
              className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#1E1B18] font-bold text-sm shadow-[2px_2px_0px_#1E1B18] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Pilih Avatar Kamu:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMyAvatar(av);
                  }}
                  className={`w-9 h-9 rounded-xl border-2 border-[#1E1B18] flex items-center justify-center text-lg transition-all ${
                    myAvatar === av
                      ? 'bg-[#FFD23F] shadow-[2px_2px_0px_#1E1B18] -translate-y-0.5'
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

      {/* ================= MODE ONLINE ROOM (LDR / 2 HP) ================= */}
      {playMode === 'ONLINE_ROOM' && (
        <div className="space-y-4">
          {/* Subtabs: Buat Room vs Gabung Room */}
          {!waitingForGuest && !joiningLoading && (
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setOnlineTab('CREATE');
                }}
                className={`flex-1 py-2 rounded-xl border-2 border-[#1E1B18] font-archivo text-xs uppercase ${
                  onlineTab === 'CREATE' ? 'bg-[#FF758F] text-white shadow-[2px_2px_0px_#1E1B18]' : 'bg-white text-gray-600'
                }`}
              >
                1. Buat Room & Share Link
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setOnlineTab('JOIN');
                }}
                className={`flex-1 py-2 rounded-xl border-2 border-[#1E1B18] font-archivo text-xs uppercase ${
                  onlineTab === 'JOIN' ? 'bg-[#80DED9] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]' : 'bg-white text-gray-600'
                }`}
              >
                2. Gabung Room Pasangan
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {/* TAB A: CREATE ROOM */}
          {onlineTab === 'CREATE' && !waitingForGuest && (
            <div className="p-5 rounded-3xl bg-[#FEF3C7] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] text-center">
              <h3 className="font-archivo text-base uppercase text-[#1E1B18] mb-1">
                Buat Room Untuk Pasangan
              </h3>
              <p className="text-xs text-gray-700 mb-4">
                Kamu akan mendapatkan link room spesial untuk dibagikan ke WhatsApp pasanganmu.
              </p>
              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full py-3.5 rounded-2xl bg-[#FFD23F] font-archivo text-sm uppercase border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>BUAT ROOM & DAPATKAN LINK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* WAITING FOR PARTNER SCREEN (After room created) */}
          {onlineTab === 'CREATE' && waitingForGuest && (
            <div className="p-5 rounded-3xl bg-white border-3 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-center space-y-4 animate-in fade-in">
              <div className="inline-block px-3 py-1 rounded-full bg-[#80DED9] border-2 border-[#1E1B18] font-archivo text-xs uppercase">
                Kode Room: <span className="font-mono text-base">{createdRoomCode}</span>
              </div>

              {!guestConnected ? (
                <div className="py-2">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#FFD23F] border-2 border-[#1E1B18] flex items-center justify-center text-xl animate-spin">
                    ⏳
                  </div>
                  <h4 className="font-archivo text-base text-[#1E1B18]">
                    Menunggu Pasangan Bergabung...
                  </h4>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto mt-1">
                    Kirim link di bawah ini ke WhatsApp pasanganmu agar dia bisa langsung masuk dari HP-nya!
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#D8F3DC] border-2 border-[#1E1B18] animate-bounce">
                  <span className="text-2xl">{guestConnected.avatar}</span>
                  <p className="font-archivo text-sm text-[#2D6A4F] mt-1">
                    {guestConnected.name} Sudah Masuk Room! 🎉
                  </p>
                </div>
              )}

              {/* Share Actions */}
              <div className="space-y-2 pt-2 border-t-2 border-dashed border-[#1E1B18]/30">
                <button
                  type="button"
                  onClick={shareToWhatsapp}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-archivo text-xs sm:text-sm uppercase border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Kirim Link via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={copyShareLink}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-[#1E1B18] font-bold text-xs uppercase border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Tersalin ke Clipboard!' : 'Salin Link Undangan'}</span>
                </button>
              </div>

              {/* Start Button enabled once partner connected */}
              {guestConnected && (
                <button
                  type="button"
                  onClick={handleHostStartGame}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-[#FFD23F] text-[#1E1B18] font-archivo text-base uppercase border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] active:translate-x-1 active:translate-y-1 animate-pulse"
                >
                  MULAI MAIN BERSAMA SEKARANG! 🚀
                </button>
              )}
            </div>
          )}

          {/* TAB B: JOIN EXISTING ROOM */}
          {onlineTab === 'JOIN' && (
            <form onSubmit={handleJoinRoom} className="p-5 rounded-3xl bg-[#E0F2FE] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] space-y-3">
              <h3 className="font-archivo text-base uppercase text-[#1E1B18]">
                Gabung ke Room Pasangan
              </h3>
              <p className="text-xs text-gray-700">
                Masukkan kode room yang diberikan pasanganmu:
              </p>

              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Contoh: LOVE8"
                maxLength={6}
                required
                className="w-full text-center tracking-widest font-mono text-xl py-2.5 rounded-xl bg-white border-3 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] focus:outline-none uppercase font-bold"
              />

              <button
                type="submit"
                disabled={joiningLoading}
                className="w-full py-3 rounded-2xl bg-[#80DED9] font-archivo text-sm uppercase border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                {joiningLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan ke Pasangan...</span>
                  </>
                ) : (
                  <>
                    <span>MASUK KE ROOM PASANGAN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================= MODE 1 HP (PASS & PLAY) ================= */}
      {playMode === 'LOCAL_1_DEVICE' && (
        <form onSubmit={handleStartLocal} className="space-y-4">
          {/* Player 2 Info for Local Mode */}
          <div className="p-4 rounded-3xl bg-[#FFF0F3] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]">
            <span className="font-archivo text-xs uppercase text-[#FF758F] block mb-2">
              Profil Pasangan Kamu (Pemain 2):
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nama Pasangan
                </label>
                <input
                  type="text"
                  value={p2LocalName}
                  onChange={(e) => setP2LocalName(e.target.value)}
                  placeholder="Misal: Agata"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#1E1B18] font-bold text-sm shadow-[2px_2px_0px_#1E1B18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Pilih Avatar Pasangan:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={`p2-${av}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setP2LocalAvatar(av);
                      }}
                      className={`w-9 h-9 rounded-xl border-2 border-[#1E1B18] flex items-center justify-center text-lg transition-all ${
                        p2LocalAvatar === av
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

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#06D6A0] text-[#1E1B18] font-archivo text-base sm:text-lg uppercase tracking-wider border-4 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <span>MULAI MAIN DI 1 HP</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
};
