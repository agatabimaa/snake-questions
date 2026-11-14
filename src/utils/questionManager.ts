import { Question, QuestionCategory, GameMode } from '../types/game';
import {
  BOY_QUESTIONS,
  GIRL_QUESTIONS,
  DEEPTALK_QUESTIONS,
  LADDER_QUESTIONS,
  SNAKE_QUESTIONS,
  VIRTUAL_DARES,
  OFFLINE_DARES
} from '../data/questions';

export class QuestionManager {
  private pools: Record<QuestionCategory, Question[]> = {
    BOY: [],
    GIRL: [],
    DEEPTALK: [],
    LADDER_APPRECIATION: [],
    SNAKE_REFLECTION: [],
    VIRTUAL_DARE: [],
  };

  private usedIds: Set<string> = new Set();
  private gameMode: GameMode = 'LDR';

  constructor(gameMode: GameMode = 'LDR') {
    this.gameMode = gameMode;
    this.resetPools();
  }

  public setMode(mode: GameMode) {
    this.gameMode = mode;
    this.resetPools();
  }

  public resetPools() {
    this.usedIds.clear();
    this.pools.BOY = this.shuffle([...BOY_QUESTIONS]);
    this.pools.GIRL = this.shuffle([...GIRL_QUESTIONS]);
    this.pools.DEEPTALK = this.shuffle([...DEEPTALK_QUESTIONS]);
    this.pools.LADDER_APPRECIATION = this.shuffle([...LADDER_QUESTIONS]);
    this.pools.SNAKE_REFLECTION = this.shuffle([...SNAKE_QUESTIONS]);
    
    // Virtual Dares or Offline Dares depending on mode
    const dares = this.gameMode === 'LDR' ? VIRTUAL_DARES : [...VIRTUAL_DARES, ...OFFLINE_DARES];
    this.pools.VIRTUAL_DARE = this.shuffle(dares);
  }

  // Fisher-Yates shuffle
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Draw an unused question randomly
  public drawQuestion(category: QuestionCategory): Question {
    let pool = this.pools[category];

    // Filter out already used questions
    const unused = pool.filter(q => !this.usedIds.has(q.id));

    if (unused.length === 0) {
      // If pool is exhausted, clear usedIds for this category and reshuffle
      this.resetCategory(category);
      pool = this.pools[category];
    }

    const available = pool.filter(q => !this.usedIds.has(q.id));
    const selected = available.length > 0 ? available[0] : pool[0];

    this.usedIds.add(selected.id);
    return selected;
  }

  // Reroll to get another question from same category
  public reroll(category: QuestionCategory, currentId: string): Question {
    const pool = this.pools[category];
    // Find one that is not currentId and not used if possible
    const candidates = pool.filter(q => q.id !== currentId && !this.usedIds.has(q.id));

    if (candidates.length > 0) {
      const next = candidates[0];
      this.usedIds.add(next.id);
      return next;
    }

    // Otherwise pick any other in pool
    const other = pool.filter(q => q.id !== currentId);
    return other.length > 0 ? other[Math.floor(Math.random() * other.length)] : pool[0];
  }

  private resetCategory(category: QuestionCategory) {
    if (category === 'BOY') this.pools.BOY = this.shuffle([...BOY_QUESTIONS]);
    if (category === 'GIRL') this.pools.GIRL = this.shuffle([...GIRL_QUESTIONS]);
    if (category === 'DEEPTALK') this.pools.DEEPTALK = this.shuffle([...DEEPTALK_QUESTIONS]);
    if (category === 'LADDER_APPRECIATION') this.pools.LADDER_APPRECIATION = this.shuffle([...LADDER_QUESTIONS]);
    if (category === 'SNAKE_REFLECTION') this.pools.SNAKE_REFLECTION = this.shuffle([...SNAKE_QUESTIONS]);
    if (category === 'VIRTUAL_DARE') {
      const dares = this.gameMode === 'LDR' ? VIRTUAL_DARES : [...VIRTUAL_DARES, ...OFFLINE_DARES];
      this.pools.VIRTUAL_DARE = this.shuffle(dares);
    }
  }
}
