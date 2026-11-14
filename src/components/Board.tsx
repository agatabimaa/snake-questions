import React from 'react';
import { Player, TileData } from '../types/game';
import { BoardOverlay } from './BoardOverlay';
import { getTileColor } from '../utils/board';

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
  // 100 Tiles: 10 rows x 10 columns
  // Render top row (row 9, tiles 100 down to 91) to bottom row (row 0, tiles 1 to 10)
  const rows = [];
  for (let r = 9; r >= 0; r--) {
    const rowTiles = [];
    for (let c = 0; c < 10; c++) {
      // Calculate tile ID
      const tileId = r % 2 === 0
        ? r * 10 + c + 1
        : r * 10 + (9 - c) + 1;

      const tile = tiles.find((t) => t.id === tileId) || {
        id: tileId,
        type: 'CHILL',
        title: `Petak ${tileId}`,
      };
      rowTiles.push(tile);
    }
    rows.push(rowTiles);
  }

  const getTileIcon = (tile: TileData) => {
    switch (tile.type) {
      case 'START':
        return '👉';
      case 'FINISH':
        return '🏠';
      case 'LADDER':
        return '🪜';
      case 'SNAKE':
        return '🐍';
      case 'BOY':
        return '👦';
      case 'GIRL':
        return '👧';
      case 'DEEPTALK':
        return '💜';
      case 'ACTION':
        return '💌';
      case 'CHILL':
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-1.5 sm:p-3 select-none">
      {/* Category Legend Bar */}
      <div className="mb-2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] font-bold">
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          👦 Cowok
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FFF0F3] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          👧 Cewek
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F3E8FF] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          💜 Deep Talk
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#DCFCE7] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          🪜 Naik Tangga
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FFE5D9] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          🐍 Turun Ular
        </span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          💌 Love Dare
        </span>
      </div>

      {/* Main Board Grid with SVG Overlay */}
      <div className="relative aspect-square w-full bg-[#FAF6EE] rounded-2xl border-4 sm:border-[5px] border-[#1E1B18] shadow-[6px_6px_0px_#1E1B18] overflow-hidden">
        {/* 10x10 Grid Cells */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {rows.flat().map((tile) => {
            const isP1StaticHere = !animatingPawn && player1.position === tile.id;
            const isP2StaticHere = !animatingPawn && player2.position === tile.id;
            const icon = getTileIcon(tile);
            const bgColor = getTileColor(tile.id);

            return (
              <div
                key={`tile-${tile.id}`}
                onClick={() => onTileClick && onTileClick(tile)}
                style={{ backgroundColor: bgColor }}
                className="relative border-[0.5px] sm:border border-[#1E1B18]/40 p-0.5 sm:p-1 flex flex-col justify-between hover:brightness-95 transition-all"
              >
                {/* Tile Number */}
                <div className="flex items-center justify-between leading-none">
                  <span className="font-archivo text-[9px] sm:text-xs text-[#1E1B18] font-bold drop-shadow-sm">
                    {tile.id}
                  </span>
                  {icon && (
                    <span className="text-[9px] sm:text-xs leading-none drop-shadow-sm">
                      {icon}
                    </span>
                  )}
                </div>

                {/* Static Pawns on Tile */}
                <div className="my-auto flex items-center justify-center gap-0.5 z-20">
                  {isP1StaticHere && (
                    <div
                      className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#80DED9] border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center justify-center text-[10px] sm:text-sm animate-bounce"
                      title={`${player1.name}`}
                    >
                      {player1.avatar}
                    </div>
                  )}
                  {isP2StaticHere && (
                    <div
                      className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#FF758F] text-white border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center justify-center text-[10px] sm:text-sm animate-bounce"
                      title={`${player2.name}`}
                    >
                      {player2.avatar}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Snakes & Ladders SVG Overlay */}
        <BoardOverlay />

        {/* Dynamic Animating Pawn (during smooth climb or slide) */}
        {animatingPawn && (
          <div
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none"
            style={{
              left: `${animatingPawn.xPercent}%`,
              top: `${animatingPawn.yPercent}%`,
            }}
          >
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border-3 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] flex items-center justify-center text-sm sm:text-lg animate-pulse ${
                animatingPawn.playerId === 'p1' ? 'bg-[#80DED9]' : 'bg-[#FF758F] text-white'
              }`}
            >
              {animatingPawn.playerId === 'p1' ? player1.avatar : player2.avatar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
