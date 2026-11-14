import { TileData } from '../types/game';

// 5 Ladders for 49-tile (7x7) board - balanced progression
export const LADDERS: Record<number, number> = {
  4: 17,
  9: 24,
  15: 31,
  22: 38,
  33: 46,
};

// 5 Snakes for 49-tile (7x7) board - gentle slides
export const SNAKES: Record<number, number> = {
  20: 6,
  27: 11,
  35: 18,
  44: 25,
  48: 30,
};

export const TOTAL_TILES = 49;
export const GRID_SIZE = 7; // 7x7 grid

// Tile coordinate in 1000x1000 viewBox (each cell is ~142.85 x 142.85)
// Grid is 7 rows (0 at top, 6 at bottom), 7 cols (0 at left, 6 at right)
export function getTileCoordinates(tileId: number): { x: number; y: number; row: number; col: number } {
  const index = Math.max(1, Math.min(TOTAL_TILES, tileId)) - 1; // 0..48
  const rowFromBottom = Math.floor(index / GRID_SIZE); // 0..6
  const colInRow = index % GRID_SIZE; // 0..6

  // Even rowFromBottom (0, 2, 4, 6): Left to Right
  // Odd rowFromBottom (1, 3, 5): Right to Left
  const col = rowFromBottom % 2 === 0 ? colInRow : (GRID_SIZE - 1) - colInRow;
  const row = (GRID_SIZE - 1) - rowFromBottom; // 0 at top, 6 at bottom

  const cellSize = 1000 / GRID_SIZE; // ~142.85
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize + cellSize / 2;

  return { x, y, row, col };
}

// Pastel color palette
const TILE_COLORS = [
  '#FFF0F3', // pastel pink
  '#FEF9C3', // pastel yellow
  '#E0F2FE', // pastel sky blue
  '#FFEDD5', // pastel peach
  '#DCFCE7', // pastel mint green
  '#F3E8FF', // pastel lilac
];

export function generate49Tiles(): TileData[] {
  const tiles: TileData[] = [];

  for (let i = 1; i <= TOTAL_TILES; i++) {
    if (i === 1) {
      tiles.push({
        id: i,
        type: 'START',
        title: 'Mulai',
        subtext: 'Buka Hati'
      });
    } else if (i === TOTAL_TILES) {
      tiles.push({
        id: i,
        type: 'FINISH',
        title: 'Finish 🏠',
        subtext: 'Love Milestone'
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
    } else if ([3, 8, 14, 21, 26, 34, 41, 47].includes(i)) {
      tiles.push({
        id: i,
        type: 'BOY',
        title: 'Soal Cowok',
        subtext: 'Isi Kepala & Beban'
      });
    } else if ([2, 7, 13, 19, 28, 37, 43].includes(i)) {
      tiles.push({
        id: i,
        type: 'GIRL',
        title: 'Soal Cewek',
        subtext: 'Rasa Aman & Afeksi'
      });
    } else if ([5, 12, 16, 23, 32, 40, 45].includes(i)) {
      tiles.push({
        id: i,
        type: 'DEEPTALK',
        title: 'Deep Talk',
        subtext: 'Masa Depan & Nilai'
      });
    } else if ([6, 10, 29, 36, 42].includes(i)) {
      tiles.push({
        id: i,
        type: 'ACTION',
        title: 'Love Dare',
        subtext: 'Aksi Ramah LDR'
      });
    } else {
      tiles.push({
        id: i,
        type: 'CHILL',
        title: 'Santai',
        subtext: 'Tersenyum Bersama'
      });
    }
  }

  return tiles;
}

export function getTileColor(tileId: number): string {
  return TILE_COLORS[(tileId * 5 + 2) % TILE_COLORS.length];
}
