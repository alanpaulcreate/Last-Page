import { DotsState } from "@/types";

export function initialDotsState(gridSize: number): DotsState {
  const boxes = gridSize - 1;
  return {
    gridSize,
    hLines: Array.from({ length: gridSize }, () => Array(boxes).fill(false)),
    vLines: Array.from({ length: boxes }, () => Array(gridSize).fill(false)),
    hLineOwner: Array.from({ length: gridSize }, () => Array(boxes).fill(null)),
    vLineOwner: Array.from({ length: boxes }, () => Array(gridSize).fill(null)),
    boxes: Array.from({ length: boxes }, () => Array(boxes).fill(null)),
    currentPlayerUid: "",
    scores: {},
    winner: null,
  };
}

export type LineType = "h" | "v";

export function claimLine(
  state: DotsState,
  type: LineType,
  row: number,
  col: number,
  playerUid: string,
  playerUids: string[]
): DotsState {
  // Already claimed?
  if (type === "h" && state.hLines[row][col]) return state;
  if (type === "v" && state.vLines[row][col]) return state;
  if (state.winner) return state;

  const newHLines = state.hLines.map((r) => [...r]);
  const newVLines = state.vLines.map((r) => [...r]);
  const newHOwner = state.hLineOwner.map((r) => [...r]);
  const newVOwner = state.vLineOwner.map((r) => [...r]);
  const newBoxes = state.boxes.map((r) => [...r]);

  if (type === "h") {
    newHLines[row][col] = true;
    newHOwner[row][col] = playerUid;
  } else {
    newVLines[row][col] = true;
    newVOwner[row][col] = playerUid;
  }

  // Check for completed boxes
  const boxSize = state.gridSize - 1;
  let boxesCompleted = 0;

  for (let r = 0; r < boxSize; r++) {
    for (let c = 0; c < boxSize; c++) {
      if (newBoxes[r][c]) continue; // already claimed
      const top = newHLines[r][c];
      const bottom = newHLines[r + 1][c];
      const left = newVLines[r][c];
      const right = newVLines[r][c + 1];
      if (top && bottom && left && right) {
        newBoxes[r][c] = playerUid;
        boxesCompleted++;
      }
    }
  }

  const newScores = { ...state.scores };
  if (boxesCompleted > 0) {
    newScores[playerUid] = (newScores[playerUid] || 0) + boxesCompleted;
  }

  // If boxes completed, player gets another turn
  const currentIndex = playerUids.indexOf(playerUid);
  const nextUid =
    boxesCompleted > 0
      ? playerUid
      : playerUids[(currentIndex + 1) % playerUids.length];

  // Check game over (all boxes filled)
  const allFilled = newBoxes.every((r) => r.every((b) => b !== null));
  let winner: string | null = null;
  if (allFilled) {
    const maxScore = Math.max(...Object.values(newScores));
    const winners = Object.entries(newScores).filter(([, s]) => s === maxScore);
    winner = winners.length === 1 ? winners[0][0] : "draw";
  }

  return {
    ...state,
    hLines: newHLines,
    vLines: newVLines,
    hLineOwner: newHOwner,
    vLineOwner: newVOwner,
    boxes: newBoxes,
    currentPlayerUid: nextUid,
    scores: newScores,
    winner,
  };
}
