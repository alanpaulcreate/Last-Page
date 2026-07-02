import { TicTacToeState } from "@/types";

export function initialTicTacToeState(): TicTacToeState {
  return {
    grid: Array(9).fill(null),
    currentPlayerUid: "",
    xPlayerUid: "",
    oPlayerUid: "",
    winner: null,
    toss: { status: "idle" },
  };
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function checkWin(grid: (string | null)[]): string | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }
  return null;
}

export function makeMove(
  state: TicTacToeState,
  index: number,
  playerUids: string[]
): TicTacToeState {
  if (state.grid[index] !== null || state.winner) return state;

  const isX = state.currentPlayerUid === state.xPlayerUid;
  const mark = isX ? "X" : "O";

  const newGrid = [...state.grid];
  newGrid[index] = mark;

  const markWinner = checkWin(newGrid);
  let winner: string | null = null;
  if (markWinner === "X") {
    winner = state.xPlayerUid;
  } else if (markWinner === "O") {
    winner = state.oPlayerUid;
  } else if (newGrid.every((cell) => cell !== null)) {
    winner = "draw";
  }

  const nextPlayerUid = state.currentPlayerUid === state.xPlayerUid
    ? state.oPlayerUid
    : state.xPlayerUid;

  return {
    ...state,
    grid: newGrid,
    winner,
    currentPlayerUid: winner ? "" : nextPlayerUid,
  };
}
