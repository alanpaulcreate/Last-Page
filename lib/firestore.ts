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
  deleteDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { Room, GameType, Player, GameSettings } from "@/types";
import { PLAYER_COLORS } from "./auth";
import { initialHangmanState } from "./games/hangman";
import { initialSOSState } from "./games/sos";
import { initialDotsState } from "./games/dots-and-boxes";
import { initialNamePlaceState } from "./games/name-place";
import { initialBingoState } from "./games/bingo";
import { initialTicTacToeState } from "./games/tic-tac-toe";

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
    case "bingo": return initialBingoState();
    case "tic-tac-toe": return initialTicTacToeState();
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
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 2 * 60 * 60 * 1000);

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

  // Block direct join if host approval is required and caller is not host
  if (room.settings?.requireApproval && room.hostId !== player.uid) {
    return room;
  }

  // Room full (4 max for name-place and bingo, 2 for others)
  const maxPlayers = (room.gameType === "name-place" || room.gameType === "bingo") ? 4 : 2;
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

/* ─── Room Settings, Approvals, & Chat Moderation ─────────────────────── */

export async function fetchPublicRooms(gameType: GameType): Promise<Room[]> {
  const q = query(
    collection(getDb(), "rooms"),
    where("gameType", "==", gameType),
    where("status", "==", "waiting"),
    limit(50)
  );
  const snap = await getDocs(q);
  const rooms = snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      gameState: typeof data.gameState === "string" ? JSON.parse(data.gameState) : data.gameState,
    } as Room;
  });
  return rooms.filter((r) => r.settings?.isPublic === true);
}

export async function requestToJoinRoom(roomId: string, player: Player): Promise<boolean> {
  const ref = doc(getDb(), "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;

  const data = snap.data();
  const room = {
    ...data,
    gameState: typeof data.gameState === "string" ? JSON.parse(data.gameState) : data.gameState,
  } as Room;

  const maxPlayers = (room.gameType === "name-place" || room.gameType === "bingo") ? 4 : 2;
  if (room.players.length >= maxPlayers) return false;

  if (room.players.some((p) => p.uid === player.uid)) return true;

  const requests = data.joinRequests || [];
  if (requests.some((r: any) => r.uid === player.uid)) return true;

  const colorIndex = (room.players.length + requests.length) % PLAYER_COLORS.length;
  const newPlayer: Player = { ...player, color: PLAYER_COLORS[colorIndex], score: 0, isReady: false };

  await updateDoc(ref, {
    joinRequests: [...requests, newPlayer],
    updatedAt: Timestamp.now(),
  });
  return true;
}

export async function approveJoinRequest(roomId: string, player: Player): Promise<void> {
  const ref = doc(getDb(), "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Room;
  const requests = data.joinRequests || [];
  const updatedRequests = requests.filter((r) => r.uid !== player.uid);

  if (data.players.some((p) => p.uid === player.uid)) {
    await updateDoc(ref, { joinRequests: updatedRequests });
    return;
  }

  await updateDoc(ref, {
    players: [...data.players, player],
    joinRequests: updatedRequests,
    updatedAt: Timestamp.now(),
  });
}

export async function declineJoinRequest(roomId: string, playerUid: string): Promise<void> {
  const ref = doc(getDb(), "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Room;
  const requests = data.joinRequests || [];
  const updatedRequests = requests.filter((r) => r.uid !== playerUid);

  await updateDoc(ref, {
    joinRequests: updatedRequests,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteChatMessage(roomId: string, messageId: string): Promise<void> {
  const messageRef = doc(getDb(), "rooms", roomId, "messages", messageId);
  await deleteDoc(messageRef);
}

export async function clearChatMessages(roomId: string): Promise<void> {
  const messagesRef = collection(getDb(), "rooms", roomId, "messages");
  const snap = await getDocs(messagesRef);
  for (const docSnap of snap.docs) {
    await deleteDoc(docSnap.ref);
  }
}
