import { SOSState, SOSCell, SOSSequence } from "@/types";

export function initialSOSState(gridSize: number): SOSState {
  return {
    gridSize,
    grid: Array.from({ length: gridSize }, () => Array(gridSize).fill(null)),
    currentPlayerUid: "",
    scores: {},
    sosSequences: [],
    winner: null,
  };
}

export function placeLetter(
  state: SOSState,
  row: number,
  col: number,
  letter: "S" | "O",
  playerUid: string,
  playerUids: string[]
): SOSState {
  if (state.grid[row][col] !== null || state.winner) return state;

  const newGrid = state.grid.map((r) => [...r]) as SOSCell[][];
  newGrid[row][col] = letter;

  // Check for new SOS sequences
  const newSequences = findNewSOS(newGrid, row, col, state.sosSequences);
  const pointsScored = newSequences.length;

  const newScores = { ...state.scores };
  if (pointsScored > 0) {
    newScores[playerUid] = (newScores[playerUid] || 0) + pointsScored;
  }

  // If SOS found, current player gets another turn; else switch
  const currentIndex = playerUids.indexOf(playerUid);
  const nextUid =
    pointsScored > 0
      ? playerUid
      : playerUids[(currentIndex + 1) % playerUids.length];

  // Check board full
  const isFull = newGrid.every((r) => r.every((c) => c !== null));
  let winner: string | null = null;
  if (isFull) {
    const maxScore = Math.max(...Object.values(newScores));
    const winners = Object.entries(newScores).filter(([, s]) => s === maxScore);
    winner = winners.length === 1 ? winners[0][0] : "draw";
  }

  return {
    ...state,
    grid: newGrid,
    currentPlayerUid: nextUid,
    scores: newScores,
    sosSequences: [...state.sosSequences, ...newSequences],
    winner,
  };
}

function findNewSOS(
  grid: SOSCell[][],
  row: number,
  col: number,
  existing: SOSSequence[]
): SOSSequence[] {
  const size = grid.length;
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ];

  const found: SOSSequence[] = [];

  for (const [dr, dc] of directions) {
    // An SOS centered at (row, col) with O at center
    if (grid[row][col] === "O") {
      const r1 = row - dr, c1 = col - dc;
      const r2 = row + dr, c2 = col + dc;
      if (
        r1 >= 0 && r1 < size && c1 >= 0 && c1 < size &&
        r2 >= 0 && r2 < size && c2 >= 0 && c2 < size &&
        grid[r1][c1] === "S" && grid[r2][c2] === "S"
      ) {
        const seq: SOSSequence = {
          cells: [[r1, c1], [row, col], [r2, c2]],
          playerUid: "",
        };
        if (!sequenceExists(seq, existing)) found.push(seq);
      }
    }

    // S at one end
    if (grid[row][col] === "S") {
      for (const sign of [1, -1]) {
        const rm = row + sign * dr, cm = col + sign * dc;
        const re = row + sign * 2 * dr, ce = col + sign * 2 * dc;
        if (
          rm >= 0 && rm < size && cm >= 0 && cm < size &&
          re >= 0 && re < size && ce >= 0 && ce < size &&
          grid[rm][cm] === "O" && grid[re][ce] === "S"
        ) {
          const seq: SOSSequence = {
            cells: [[row, col], [rm, cm], [re, ce]],
            playerUid: "",
          };
          if (!sequenceExists(seq, existing)) found.push(seq);
        }
      }
    }
  }

  return found;
}

function sequenceExists(seq: SOSSequence, existing: SOSSequence[]): boolean {
  return existing.some(
    (e) =>
      e.cells.every(([r, c]) =>
        seq.cells.some(([sr, sc]) => sr === r && sc === c)
      )
  );
}
