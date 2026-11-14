export type TileType = 
  | 'START' 
  | 'FINISH' 
  | 'BOY' 
  | 'GIRL' 
  | 'DEEPTALK' 
  | 'ACTION' 
  | 'LADDER' 
  | 'SNAKE' 
  | 'CHILL';

export interface TileData {
  id: number;
  type: TileType;
  title: string;
  subtext?: string;
  targetTile?: number; // target if ladder or snake
}

export type QuestionCategory = 
  | 'BOY' 
  | 'GIRL' 
  | 'DEEPTALK' 
  | 'LADDER_APPRECIATION' 
  | 'SNAKE_REFLECTION' 
  | 'VIRTUAL_DARE';

export interface Question {
  id: string;
  category: QuestionCategory;
  title: string;
  question: string;
  subPrompt?: string;
  forWhom: 'BOY' | 'GIRL' | 'BOTH';
  badgeColor?: string;
  tag: string;
}

export interface Player {
  id: 'p1' | 'p2';
  name: string;
  gender: 'BOY' | 'GIRL';
  avatar: string; // emoji or icon
  color: string;
  bgColor: string;
  borderColor: string;
  position: number;
  stepsTaken: number;
  questionsAnswered: number;
  laddersClimbed: number;
  snakesSlid: number;
}

export type GameMode = 'LDR' | 'OFFLINE';

export type GameStatus = 
  | 'LOBBY' 
  | 'PLAYING' 
  | 'MOVING' 
  | 'QUESTION' 
  | 'ACTION_DARE' 
  | 'VICTORY';

export interface AnsweredLog {
  id: string;
  playerName: string;
  playerAvatar: string;
  category: QuestionCategory;
  questionText: string;
  turnNumber: number;
  timestamp: string;
}
