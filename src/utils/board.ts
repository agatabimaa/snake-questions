import { TileData } from '../types/game';

// 11 Ladders exactly from the reference image
export const LADDERS: Record<number, number> = {
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94,
};

// 10 Snakes exactly from the reference image
export const SNAKES: Record<number, number> = {
  16: 6,
  47: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 72,
  93: 73,
  95: 75,
  99: 80,
};

// Tile coordinate in 1000x1000 viewBox (each cell is 100x100)
// Grid is 10 rows (0 at top, 9 at bottom), 10 cols (0 at left, 9 at right)
export function getTileCoordinates(tileId: number): { x: number; y: number; row: number; col: number } {
  const index = Math.max(1, Math.min(100, tileId)) - 1; // 0..99
  const rowFromBottom = Math.floor(index / 10); // 0..9
  const colInRow = index % 10; // 0..9

  // Even rowFromBottom (0, 2, 4, 6, 8): Left to Right (0 -> 9)
  // Odd rowFromBottom (1, 3, 5, 7, 9): Right to Left (9 -> 0)
  const col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
  const row = 9 - rowFromBottom; // 0 at top (tiles 91-100), 9 at bottom (tiles 1-10)

  const x = col * 100 + 50;
  const y = row * 100 + 50;

  return { x, y, row, col };
}

// Tile pastel background colors matching the reference image palette
const TILE_COLORS = [
  '#FFF0F3', // pastel pink
  '#FEF9C3', // pastel yellow
  '#E0F2FE', // pastel sky blue
  '#FFEDD5', // pastel orange/peach
  '#DCFCE7', // pastel mint green
  '#F3E8FF', // pastel lilac/purple
];

export function generate100Tiles(): TileData[] {
  const tiles: TileData[] = [];

  for (let i = 1; i <= 100; i++) {
    if (i === 1) {
      tiles.push({
        id: i,
        type: 'START',
        title: 'Mulai',
        subtext: 'Buka Hati & Bismillah'
      });
    } else if (i === 100) {
      tiles.push({
        id: i,
        type: 'FINISH',
        title: 'Finish 🏠',
        subtext: 'Love Milestone & Hadiah'
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
    } else if ([3, 9, 13, 18, 24, 30, 35, 41, 46, 52, 58, 65, 70, 76, 83, 88, 92, 97].includes(i)) {
      tiles.push({
        id: i,
        type: 'BOY',
        title: 'Soal Cowok',
        subtext: 'Isi Kepala & Beban'
      });
    } else if ([4, 10, 17, 23, 29, 34, 40, 45, 50, 56, 63, 69, 75, 82, 86, 90, 96].includes(i)) {
      tiles.push({
        id: i,
        type: 'GIRL',
        title: 'Soal Cewek',
        subtext: 'Rasa Aman & Afeksi'
      });
    } else if ([5, 12, 20, 27, 33, 39, 48, 55, 61, 68, 77, 85, 94].includes(i)) {
      tiles.push({
        id: i,
        type: 'DEEPTALK',
        title: 'Deep Talk',
        subtext: 'Masa Depan & Komitmen'
      });
    } else if ([6, 19, 22, 32, 37, 43, 54, 59, 66, 73, 79, 81].includes(i)) {
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
        subtext: 'Tersenyum Berdua'
      });
    }
  }

  return tiles;
}

export function getTileColor(tileId: number): string {
  // Deterministic pastel palette distribution
  return TILE_COLORS[(tileId * 7 + 3) % TILE_COLORS.length];
}
