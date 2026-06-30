import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  DocumentReference,
  collection,
  addDoc,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { Room, GameType, Player, GameSettings } from "@/types";
import { PLAYER_COLORS } from "./auth";
import { initialHangmanState } from "./games/hangman";
import { initialSOSState } from "./games/sos";
import { initialDotsState } from "./games/dots-and-boxes";
import { initialNamePlaceState } from "./games/name-place";

// ─── Room ID generation ────────────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function gameInitialState(gameType: GameType, settings: GameSettings) {
  switch (gameType) {
    case "hangman": return initialHangmanState();
    case "sos": return initialSOSState(settings.gridSize || 4);
    case "dots-and-boxes": return initialDotsState(settings.gridSize || 4);
    case "name-place": return initialNamePlaceState(settings.totalRounds || 5, settings.timerSeconds || 60);
  }
}

// ─── Create room ──────────────────────────────────────────────────────────────

export async function createRoom(
  gameType: GameType,
  host: Player,
  settings: GameSettings = {}
): Promise<string> {
  let roomId = generateRoomCode();
  // Ensure unique code
  let exists = await getDoc(doc(getDb(), "rooms", roomId));
  while (exists.exists()) {
    roomId = generateRoomCode();
    exists = await getDoc(doc(getDb(), "rooms", roomId));
  }

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

  const playerWithColor: Player = { ...host, color: PLAYER_COLORS[0], score: 0, isReady: false };

  const room: Room = {
    roomId,
    gameType,
    status: "waiting",
    hostId: host.uid,
    players: [playerWithColor],
    createdAt: now,
    updatedAt: now,
    expiresAt,
    gameState: gameInitialState(gameType, settings),
    settings,
  };

  const roomData = {
    ...room,
    gameState: JSON.stringify(room.gameState),
  };

  await setDoc(doc(getDb(), "rooms", roomId), roomData);
  return roomId;
}

// ─── Join room ────────────────────────────────────────────────────────────────

export async function joinRoom(roomId: string, player: Player): Promise<Room | null> {
  const ref = doc(getDb(), "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();
  const room = {
    ...data,
    gameState: typeof data.gameState === "string" ? JSON.parse(data.gameState) : data.gameState,
  } as Room;

  // Already in room?
  const alreadyIn = room.players.find((p) => p.uid === player.uid);
  if (alreadyIn) return room;

  // Room full (4 max for name-place, 2 for others)
  const maxPlayers = room.gameType === "name-place" ? 4 : 2;
  if (room.players.length >= maxPlayers) return null;

  const colorIndex = room.players.length % PLAYER_COLORS.length;
  const newPlayer: Player = { ...player, color: PLAYER_COLORS[colorIndex], score: 0, isReady: false };

  await updateDoc(ref, {
    players: [...room.players, newPlayer],
    updatedAt: Timestamp.now(),
  });

  return { ...room, players: [...room.players, newPlayer] };
}

// ─── Subscribe to room ────────────────────────────────────────────────────────

export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(getDb(), "rooms", roomId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      const room = {
        ...data,
        gameState: typeof data.gameState === "string" ? JSON.parse(data.gameState) : data.gameState,
      } as Room;
      callback(room);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        console.error("Error subscribing to room:", error);
      }
    }
  );
}

// ─── Update game state ────────────────────────────────────────────────────────

export async function updateGameState(
  roomId: string,
  gameState: any
): Promise<void> {
  const ref = doc(getDb(), "rooms", roomId);
  await updateDoc(ref, {
    gameState: JSON.stringify(gameState),
    updatedAt: Timestamp.now(),
  });
}

export async function updateRoomStatus(
  roomId: string,
  status: Room["status"]
): Promise<void> {
  const ref = doc(getDb(), "rooms", roomId);
  await updateDoc(ref, { status, updatedAt: Timestamp.now() });
}

export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  const ref = doc(getDb(), "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Room;
  const newPlayers = data.players.filter((p) => p.uid !== uid);

  if (newPlayers.length === 0) {
    // Set status to finished if empty
    await updateDoc(ref, {
      players: [],
      status: "finished",
      updatedAt: Timestamp.now(),
    });
  } else {
    // If the host is leaving, promote the next player to host
    const newHostId = data.hostId === uid ? newPlayers[0].uid : data.hostId;
    await updateDoc(ref, {
      players: newPlayers,
      hostId: newHostId,
      updatedAt: Timestamp.now(),
    });
  }
}

export function roomRef(roomId: string): DocumentReference {
  return doc(getDb(), "rooms", roomId);
}

/* ─── Chat ──────────────────────────────────────────────────────────────── */
export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  timestamp: Timestamp;
}

export async function sendChatMessage(
  roomId: string,
  uid: string,
  displayName: string,
  text: string
): Promise<void> {
  const messagesRef = collection(getDb(), "rooms", roomId, "messages");
  await addDoc(messagesRef, {
    uid,
    displayName,
    text: text.trim(),
    timestamp: Timestamp.now(),
  });
}

export function subscribeChatMessages(
  roomId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = collection(getDb(), "rooms", roomId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, "id">),
      }));
      callback(msgs);
    },
    (error) => {
      console.warn("Firestore snapshot error in subscribeChatMessages:", error.message);
    }
  );
}
