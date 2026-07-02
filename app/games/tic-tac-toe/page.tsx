import GameLobby from "@/components/games/GameLobby";

export default function TicTacToeLobbyPage() {
  return (
    <GameLobby
      gameType="tic-tac-toe"
      title="Tic-tac-toe"
      icon="❌"
      description="Place X or O on the 3x3 grid. The first player to get 3 in a row wins!"
      color="#FFF3B0"
    />
  );
}
