import { BingoState } from "@/types";

export function initialBingoState(): BingoState {
  return {
    boards: {},
    marked: [],
    currentPlayerUid: "",
    readyPlayers: [],
    winner: null,
    toss: { status: "idle" },
  };
}

export function countCompletedLines(grid: number[][], marked: number[]): number {
  if (!grid || grid.length !== 5) return 0;
  let count = 0;

  // Rows
  for (let r = 0; r < 5; r++) {
    if (grid[r].every((num) => marked.includes(num))) {
      count++;
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    let colComplete = true;
    for (let r = 0; r < 5; r++) {
      if (!marked.includes(grid[r][c])) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) count++;
  }

  // Diagonals
  let diag1Complete = true;
  let diag2Complete = true;
  for (let i = 0; i < 5; i++) {
    if (!marked.includes(grid[i][i])) diag1Complete = false;
    if (!marked.includes(grid[i][4 - i])) diag2Complete = false;
  }
  if (diag1Complete) count++;
  if (diag2Complete) count++;

  return count;
}

export function setupBoard(
  state: BingoState,
  uid: string,
  board: number[][]
): BingoState {
  const newBoards = { ...state.boards, [uid]: board };
  const newReady = state.readyPlayers.includes(uid)
    ? state.readyPlayers
    : [...state.readyPlayers, uid];

  return {
    ...state,
    boards: newBoards,
    readyPlayers: newReady,
  };
}

export function callNumber(
  state: BingoState,
  num: number,
  playerUids: string[]
): BingoState {
  if (state.marked.includes(num) || state.winner) return state;

  const newMarked = [...state.marked, num];

  // Calculate completed lines for each player
  const playerLineCounts: Record<string, number> = {};
  playerUids.forEach((uid) => {
    const board = state.boards[uid];
    playerLineCounts[uid] = board ? countCompletedLines(board, newMarked) : 0;
  });

  // Check if any player has completed 5 or more lines
  const winners = playerUids.filter((uid) => playerLineCounts[uid] >= 5);

  let winner: string | null = null;
  if (winners.length === 1) {
    winner = winners[0];
  } else if (winners.length > 1) {
    // Determine winner by line count
    let maxLines = -1;
    let maxUids: string[] = [];
    winners.forEach((uid) => {
      const count = playerLineCounts[uid];
      if (count > maxLines) {
        maxLines = count;
        maxUids = [uid];
      } else if (count === maxLines) {
        maxUids.push(uid);
      }
    });

    if (maxUids.length === 1) {
      winner = maxUids[0];
    } else {
      winner = "draw";
    }
  }

  // Toggle current turn player
  const currentIdx = playerUids.indexOf(state.currentPlayerUid);
  const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % playerUids.length;
  const nextPlayerUid = playerUids[nextIdx];

  return {
    ...state,
    marked: newMarked,
    winner,
    currentPlayerUid: winner ? "" : nextPlayerUid,
  };
}
