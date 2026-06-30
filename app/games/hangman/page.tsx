import GameLobby from "@/components/games/GameLobby";

export default function HangmanLobbyPage() {
  return (
    <GameLobby
      gameType="hangman"
      title="Hangman"
      icon="🪢"
      description="Guess letters to reveal the hidden word before the stick figure is complete!"
      color="#FFF3B0"
    />
  );
}
