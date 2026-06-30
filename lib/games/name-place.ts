import { NamePlaceState, RoundAnswers } from "@/types";
import { Timestamp } from "firebase/firestore";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(
  (l) => !["Q", "X", "Z"].includes(l) // remove rare letters
);

export function initialNamePlaceState(
  totalRounds: number,
  timerSeconds: number
): NamePlaceState {
  return {
    round: 0,
    totalRounds,
    currentLetter: "",
    roundStatus: "waiting",
    roundStartAt: null,
    timerSeconds,
    answers: {},
    roundScores: {},
    scores: {},
    winner: null,
  };
}

export function pickLetter(usedLetters: string[]): string {
  const available = ALPHABET.filter((l) => !usedLetters.includes(l));
  if (available.length === 0) return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function startRound(
  state: NamePlaceState,
  usedLetters: string[]
): NamePlaceState {
  const letter = pickLetter(usedLetters);
  return {
    ...state,
    round: state.round + 1,
    currentLetter: letter,
    roundStatus: "answering",
    roundStartAt: Timestamp.now(),
    answers: {},
  };
}

export function submitAnswers(
  state: NamePlaceState,
  playerUid: string,
  answers: RoundAnswers
): NamePlaceState {
  return {
    ...state,
    answers: {
      ...state.answers,
      [playerUid]: { ...answers, submittedAt: Timestamp.now() },
    },
  };
}

export function calculateScores(
  state: NamePlaceState,
  playerUids: string[]
): NamePlaceState {
  const letter = state.currentLetter;
  const categories: (keyof RoundAnswers)[] = ["name", "place", "animal", "thing"];
  const roundKey = `round_${state.round}`;
  const roundScores: Record<string, number> = {};

  for (const uid of playerUids) {
    roundScores[uid] = 0;
    const playerAnswers = state.answers[uid];
    if (!playerAnswers) continue;

    for (const cat of categories) {
      const answer = (playerAnswers[cat] as string)?.trim().toUpperCase();
      if (!answer || !answer.startsWith(letter)) continue;

      // Check uniqueness among all players
      const others = playerUids.filter((u) => u !== uid);
      const isDuplicate = others.some(
        (u) =>
          (state.answers[u]?.[cat] as string)
            ?.trim()
            .toUpperCase() === answer
      );

      roundScores[uid] += isDuplicate ? 5 : 10; // 10 pts unique, 5 pts duplicate
    }
  }

  const newTotalScores = { ...state.scores };
  for (const [uid, score] of Object.entries(roundScores)) {
    newTotalScores[uid] = (newTotalScores[uid] || 0) + score;
  }

  const isLastRound = state.round >= state.totalRounds;
  let winner: string | null = null;
  if (isLastRound) {
    const maxScore = Math.max(...Object.values(newTotalScores));
    const winners = Object.entries(newTotalScores).filter(([, s]) => s === maxScore);
    winner = winners.length === 1 ? winners[0][0] : "draw";
  }

  return {
    ...state,
    roundStatus: isLastRound ? "finished" : "scoring",
    roundScores: { ...state.roundScores, [roundKey]: roundScores },
    scores: newTotalScores,
    winner,
  };
}
