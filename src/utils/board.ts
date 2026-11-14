import { TileData } from '../types/game';

// Define Snakes and Ladders mappings
export const LADDERS: Record<number, number> = {
  4: 14,
  12: 22,
  19: 31,
  28: 39,
  35: 47,
};

export const SNAKES: Record<number, number> = {
  17: 7,
  25: 15,
  33: 21,
  43: 29,
  48: 36,
};

export function generateBoardTiles(): TileData[] {
  const tiles: TileData[] = [];

  for (let i = 1; i <= 50; i++) {
    if (i === 1) {
      tiles.push({
        id: i,
        type: 'START',
        title: 'Mulai',
        subtext: 'Bismillah & Buka Hati'
      });
    } else if (i === 50) {
      tiles.push({
        id: i,
        type: 'FINISH',
        title: 'Finish',
        subtext: 'Pelukan & Love Milestone'
      });
    } else if (LADDERS[i]) {
      tiles.push({
        id: i,
        type: 'LADDER',
        title: 'Tangga Cinta',
        subtext: `Naik ke ${LADDERS[i]}`,
        targetTile: LADDERS[i]
      });
    } else if (SNAKES[i]) {
      tiles.push({
        id: i,
        type: 'SNAKE',
        title: 'Ular Manja',
        subtext: `Turun ke ${SNAKES[i]}`,
        targetTile: SNAKES[i]
      });
    } else if ([3, 9, 18, 24, 32, 41].includes(i)) {
      tiles.push({
        id: i,
        type: 'BOY',
        title: 'Soal Cowok',
        subtext: 'Isi Kepala & Beban Pria'
      });
    } else if ([2, 8, 13, 23, 37, 44].includes(i)) {
      tiles.push({
        id: i,
        type: 'GIRL',
        title: 'Soal Cewek',
        subtext: 'Rasa Aman & Perhatian'
      });
    } else if ([6, 11, 22, 30, 38, 45].includes(i)) {
      tiles.push({
        id: i,
        type: 'DEEPTALK',
        title: 'Deep Talk',
        subtext: 'Masa Depan & Komitmen'
      });
    } else if ([5, 10, 20, 27, 39, 46].includes(i)) {
      tiles.push({
        id: i,
        type: 'ACTION',
        title: 'Love Dare',
        subtext: 'Aksi Manis Ramah LDR'
      });
    } else {
      tiles.push({
        id: i,
        type: 'CHILL',
        title: 'Santai',
        subtext: 'Istirahat & Senyum'
      });
    }
  }

  return tiles;
}

// 5 columns x 10 rows snake path grid
// Row 0 (bottom) to Row 9 (top)
export function getTileGridPosition(tileId: number) {
  const index = tileId - 1; // 0..49
  const rowFromBottom = Math.floor(index / 5); // 0..9
  const colInRow = index % 5; // 0..4

  // In even rows (0, 2, 4, 6, 8): Left to Right
  // In odd rows (1, 3, 5, 7, 9): Right to Left
  const col = rowFromBottom % 2 === 0 ? colInRow : 4 - colInRow;
  const row = 9 - rowFromBottom; // 0 at top, 9 at bottom for CSS grid

  return { row, col, rowFromBottom };
}
