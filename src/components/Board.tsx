import React, { useState } from 'react';
import { Player, TileData } from '../types/game';
import { BoardOverlay } from './BoardOverlay';
import { getTileColor, TOTAL_TILES, GRID_SIZE } from '../utils/board';
import { Box } from 'lucide-react';

interface BoardProps {
  tiles: TileData[];
  player1: Player;
  player2: Player;
  animatingPawn?: {
    playerId: 'p1' | 'p2';
    xPercent: number;
    yPercent: number;
  } | null;
  onTileClick?: (tile: TileData) => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  player1,
  player2,
  animatingPawn,
  onTileClick,
}) => {
  const [is3DView, setIs3DView] = useState(true);

  // 49 Tiles: 7 rows x 7 columns
  const rows = [];
  for (let r = GRID_SIZE - 1; r >= 0; r--) {
    const rowTiles = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const tileId = r % 2 === 0
        ? r * GRID_SIZE + c + 1
        : r * GRID_SIZE + ((GRID_SIZE - 1) - c) + 1;

      const tile = tiles.find((t) => t.id === tileId) || {
        id: tileId,
        type: 'CHILL',
        title: `Petak ${tileId}`,
      };
      rowTiles.push(tile);
    }
    rows.push(rowTiles);
  }

  const getTileBadge = (tile: TileData) => {
    switch (tile.type) {
      case 'START':
        return { text: 'START', icon: '👉', badgeBg: 'bg-[#FFD23F]' };
      case 'FINISH':
        return { text: 'FINISH', icon: '🏠', badgeBg: 'bg-[#FF5964] text-white' };
      case 'LADDER':
        return { text: `➔ ${tile.targetTile}`, icon: '🪜', badgeBg: 'bg-[#06D6A0]' };
      case 'SNAKE':
        return { text: `➔ ${tile.targetTile}`, icon: '🐍', badgeBg: 'bg-[#FF5964] text-white' };
      case 'BOY':
        return { text: 'COWOK', icon: '👦', badgeBg: 'bg-[#80DED9]' };
      case 'GIRL':
        return { text: 'CEWEK', icon: '👧', badgeBg: 'bg-[#FF758F] text-white' };
      case 'DEEPTALK':
        return { text: 'DEEP', icon: '💜', badgeBg: 'bg-[#B5A6C9]' };
      case 'ACTION':
        return { text: 'DARE', icon: '💌', badgeBg: 'bg-[#FFD23F]' };
      case 'CHILL':
      default:
        return { text: 'SANTAI', icon: null, badgeBg: 'bg-white/70 text-gray-700' };
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-1 sm:p-2 select-none">
      {/* Category Legend & 3D Toggle */}
      <div className="mb-2 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
            👦 Cowok
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
            👧 Cewek
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#F3E8FF] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
            💜 Deep Talk
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
            🪜 Tangga
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#FFE5D9] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18]">
            🐍 Ular
          </span>
        </div>

        {/* 3D Isometric View Switcher */}
        <button
          type="button"
          onClick={() => setIs3DView(!is3DView)}
          className={`px-2.5 py-1 rounded-xl border-2 border-[#1E1B18] text-[10px] font-archivo uppercase flex items-center gap-1 shadow-[2px_2px_0px_#1E1B18] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
            is3DView ? 'bg-[#FFD23F]' : 'bg-white text-gray-600'
          }`}
          title="Ubah sudut pandang 3D / 2D"
        >
          <Box className="w-3.5 h-3.5" />
          <span>{is3DView ? '3D View' : '2D View'}</span>
        </button>
      </div>

      {/* Main Board Container with 3D Depth */}
      <div
        className="w-full transition-all duration-500 ease-out py-2"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          className={`relative aspect-square w-full bg-[#FAF6EE] rounded-3xl border-4 sm:border-[5px] border-[#1E1B18] overflow-hidden transition-all duration-500 ${
            is3DView
              ? 'origin-bottom shadow-[0_16px_0px_#1E1B18,0_24px_35px_rgba(30,27,24,0.3)]'
              : 'shadow-[8px_12px_0px_#1E1B18]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: is3DView ? 'rotateX(18deg) scale(0.96)' : 'none',
          }}
        >
          {/* 7x7 Grid Cells */}
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-7">
            {rows.flat().map((tile) => {
              const isP1StaticHere = !animatingPawn && player1.position === tile.id;
              const isP2StaticHere = !animatingPawn && player2.position === tile.id;
              const badge = getTileBadge(tile);
              const bgColor = getTileColor(tile.id);

              return (
                <div
                  key={`tile-${tile.id}`}
                  onClick={() => onTileClick && onTileClick(tile)}
                  style={{ backgroundColor: bgColor }}
                  className="relative border border-[#1E1B18]/40 p-1 sm:p-1.5 flex flex-col justify-between hover:brightness-95 transition-all shadow-inner"
                >
                  {/* Tile Header: Number & Category Icon */}
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-archivo text-xs sm:text-sm text-[#1E1B18] font-bold drop-shadow-sm">
                      {tile.id}
                    </span>
                    {badge.icon && (
                      <span className="text-xs sm:text-base leading-none drop-shadow-sm">
                        {badge.icon}
                      </span>
                    )}
                  </div>

                  {/* Static Pawns on Tile with 3D Pop */}
                  <div className="my-auto flex items-center justify-center gap-1 z-20">
                    {isP1StaticHere && (
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#80DED9] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-xs sm:text-base animate-bounce"
                        style={{ transform: is3DView ? 'translateZ(15px)' : 'none' }}
                        title={`${player1.name}`}
                      >
                        {player1.avatar}
                      </div>
                    )}
                    {isP2StaticHere && (
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FF758F] text-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center text-xs sm:text-base animate-bounce"
                        style={{ transform: is3DView ? 'translateZ(15px)' : 'none' }}
                        title={`${player2.name}`}
                      >
                        {player2.avatar}
                      </div>
                    )}
                  </div>

                  {/* Subtext Tag */}
                  <div className="flex justify-center">
                    <span
                      className={`text-[8px] sm:text-[10px] font-bold px-1 rounded border border-[#1E1B18] truncate max-w-full leading-tight shadow-[1px_1px_0px_#1E1B18] ${badge.badgeBg}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual 3D Snakes & Ladders SVG Overlay */}
          <BoardOverlay />

          {/* Dynamic Animating Pawn */}
          {animatingPawn && (
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none"
              style={{
                left: `${animatingPawn.xPercent}%`,
                top: `${animatingPawn.yPercent}%`,
                transform: is3DView ? 'translate(-50%, -50%) translateZ(25px)' : 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] flex items-center justify-center text-base sm:text-xl animate-pulse ${
                  animatingPawn.playerId === 'p1' ? 'bg-[#80DED9]' : 'bg-[#FF758F] text-white'
                }`}
              >
                {animatingPawn.playerId === 'p1' ? player1.avatar : player2.avatar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
