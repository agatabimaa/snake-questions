import React from 'react';
import { Player, TileData } from '../types/game';
import { getTileGridPosition } from '../utils/board';

interface BoardProps {
  tiles: TileData[];
  player1: Player;
  player2: Player;
  onTileClick?: (tile: TileData) => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  player1,
  player2,
  onTileClick,
}) => {
  // Sort tiles to render from Top (row 9, tile 50) down to Bottom (row 0, tile 1)
  // Grid layout: 10 rows (numbered 0 at top to 9 at bottom), 5 columns (0 to 4)

  const getTileBg = (tile: TileData) => {
    switch (tile.type) {
      case 'START':
        return 'bg-[#FFFDF8]';
      case 'FINISH':
        return 'bg-gradient-to-br from-[#FFD23F] via-[#FF758F] to-[#80DED9]';
      case 'LADDER':
        return 'bg-[#D8F3DC] border-[#2D6A4F]';
      case 'SNAKE':
        return 'bg-[#FFE5D9] border-[#D90429]';
      case 'BOY':
        return 'bg-[#E0F2FE]';
      case 'GIRL':
        return 'bg-[#FFF0F3]';
      case 'DEEPTALK':
        return 'bg-[#F3E8FF]';
      case 'ACTION':
        return 'bg-[#FEF3C7]';
      case 'CHILL':
      default:
        return 'bg-[#FFFFFF]';
    }
  };

  const getTileBadge = (tile: TileData) => {
    switch (tile.type) {
      case 'START':
        return { text: 'START', color: 'bg-[#FFD23F]', icon: '🏁' };
      case 'FINISH':
        return { text: 'FINISH', color: 'bg-[#FF5964] text-white', icon: '🏆' };
      case 'LADDER':
        return { text: `➔ ${tile.targetTile}`, color: 'bg-[#06D6A0] text-black', icon: '🪜' };
      case 'SNAKE':
        return { text: `➔ ${tile.targetTile}`, color: 'bg-[#FF5964] text-white', icon: '🐍' };
      case 'BOY':
        return { text: 'COWOK', color: 'bg-[#80DED9]', icon: '👦' };
      case 'GIRL':
        return { text: 'CEWEK', color: 'bg-[#FF758F] text-white', icon: '👧' };
      case 'DEEPTALK':
        return { text: 'DEEP', color: 'bg-[#B5A6C9] text-black', icon: '💜' };
      case 'ACTION':
        return { text: 'DARE', color: 'bg-[#FFD23F]', icon: '💌' };
      case 'CHILL':
      default:
        return { text: 'SANTAI', color: 'bg-gray-200 text-gray-700', icon: '☕' };
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2 sm:p-4">
      {/* Legend Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold">
        <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          👦 Soal Cowok
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          👧 Soal Cewek
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#F3E8FF] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          💜 Deep Talk
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#D8F3DC] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          🪜 Tangga
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#FFE5D9] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          🐍 Ular
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center gap-1">
          💌 Love Dare
        </span>
      </div>

      {/* Main Board Container */}
      <div className="relative bg-[#FAF6EE] p-2 sm:p-3 rounded-2xl border-4 border-[#1E1B18] shadow-[6px_6px_0px_#1E1B18]">
        {/* Board 10x5 Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: 50 }, (_, i) => {
            // Display row 9 (tiles 46-50) down to row 0 (tiles 1-5)
            // Reverse so tile 50 is at top
            const displayIndex = 49 - i;
            const rowFromBottom = Math.floor(displayIndex / 5);
            const colInRow = displayIndex % 5;
            const tileId = rowFromBottom % 2 === 0 
              ? rowFromBottom * 5 + colInRow + 1 
              : rowFromBottom * 5 + (4 - colInRow) + 1;

            const tile = tiles.find((t) => t.id === tileId) || {
              id: tileId,
              type: 'CHILL',
              title: `Petak ${tileId}`,
            };

            const isP1Here = player1.position === tile.id;
            const isP2Here = player2.position === tile.id;
            const badge = getTileBadge(tile);

            return (
              <div
                key={`tile-${tile.id}`}
                onClick={() => onTileClick && onTileClick(tile)}
                className={`relative aspect-square rounded-xl border-2 sm:border-3 border-[#1E1B18] p-1 flex flex-col justify-between transition-all select-none shadow-[2px_2px_0px_#1E1B18] hover:translate-y-[-1px] ${getTileBg(
                  tile
                )}`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between leading-none">
                  <span className="font-archivo text-[11px] sm:text-xs text-[#1E1B18]">
                    {tile.id}
                  </span>
                  <span className="text-xs sm:text-sm">{badge.icon}</span>
                </div>

                {/* Pawns Overlay */}
                <div className="my-auto flex items-center justify-center gap-1 z-10">
                  {isP1Here && (
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#80DED9] border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center justify-center text-xs sm:text-base animate-bounce"
                      title={`${player1.name}`}
                    >
                      {player1.avatar}
                    </div>
                  )}
                  {isP2Here && (
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FF758F] text-white border-2 border-[#1E1B18] shadow-[1px_1px_0px_#1E1B18] flex items-center justify-center text-xs sm:text-base animate-bounce"
                      title={`${player2.name}`}
                    >
                      {player2.avatar}
                    </div>
                  )}
                </div>

                {/* Subtext / Target Badge */}
                <div className="flex justify-center">
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold px-1 rounded border border-[#1E1B18] truncate max-w-full leading-tight ${badge.color}`}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
