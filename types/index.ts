import { Timestamp } from "firebase/firestore";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  displayName: string;
  isGuest: boolean;
  photoURL?: string;
}

// ─── Room / Game ──────────────────────────────────────────────────────────────

export type GameType = "hangman" | "sos" | "dots-and-boxes" | "name-place";

export type RoomStatus = "waiting" | "active" | "finished";

export interface Player {
  uid: string;
  displayName: string;
  isGuest: boolean;
  score: number;
  isReady: boolean;
  color: string; // player color for Dots & Boxes
}

export interface Room {
  roomId: string;
  gameType: GameType;
  status: RoomStatus;
  hostId: string;
  players: Player[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  gameState: HangmanState | SOSState | DotsState | NamePlaceState;
  settings: GameSettings;
}

export interface GameSettings {
  gridSize?: number; // SOS / Dots: 3–6
  totalRounds?: number; // Name Place: default 5
  timerSeconds?: number; // Name Place: default 60
}

// ─── Hangman ──────────────────────────────────────────────────────────────────

export interface HangmanState {
  word: string;
  maskedWord: string[]; // '_' or revealed letter
  guessedLetters: string[];
  wrongGuesses: number; // 0–6
  category: string;
  winner: string | null; // uid or null
  loser: string | null;
}

// ─── SOS ──────────────────────────────────────────────────────────────────────

export type SOSCell = "S" | "O" | null;

export interface SOSSequence {
  cells: [number, number][];
  playerUid: string;
}

export interface SOSState {
  gridSize: number;
  grid: SOSCell[][];
  currentPlayerUid: string;
  scores: Record<string, number>;
  sosSequences: SOSSequence[];
  winner: string | null; // uid or "draw"
}

// ─── Dots and Boxes ───────────────────────────────────────────────────────────

export interface DotsState {
  gridSize: number; // number of dots per side
  hLines: boolean[][]; // [row][col] — horizontal lines, (gridSize-1) cols, gridSize rows
  vLines: boolean[][]; // [row][col] — vertical lines, gridSize cols, (gridSize-1) rows
  hLineOwner: (string | null)[][];
  vLineOwner: (string | null)[][];
  boxes: (string | null)[][]; // uid of player who completed the box
  currentPlayerUid: string;
  scores: Record<string, number>;
  winner: string | null;
}

// ─── Name Place Animal Thing ──────────────────────────────────────────────────

export interface RoundAnswers {
  name: string;
  place: string;
  animal: string;
  thing: string;
  submittedAt?: Timestamp;
}

export type RoundStatus = "waiting" | "answering" | "scoring" | "finished";

export interface NamePlaceState {
  round: number;
  totalRounds: number;
  currentLetter: string;
  roundStatus: RoundStatus;
  roundStartAt: Timestamp | null;
  timerSeconds: number;
  answers: Record<string, RoundAnswers>; // uid → answers
  roundScores: Record<string, Record<string, number>>; // round → uid → score
  scores: Record<string, number>; // total scores
  winner: string | null;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface GameCardInfo {
  type: GameType;
  title: string;
  description: string;
  icon: string;
  color: string; // sticky note background tint
  rotation: string; // CSS rotate value
  players: string;
}
