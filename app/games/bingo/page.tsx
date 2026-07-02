import GameLobby from "@/components/games/GameLobby";

export default function BingoLobbyPage() {
  return (
    <GameLobby
      gameType="bingo"
      title="Bingo (1–25)"
      icon="🔢"
      description="Arrange numbers 1 to 25 randomly on your grid. Take turns calling numbers — complete 5 lines to get BINGO!"
      color="#E4F0FF"
    />
  );
}
