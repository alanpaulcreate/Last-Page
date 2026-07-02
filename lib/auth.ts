import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { AppUser } from "@/types";

const provider = new GoogleAuthProvider();

// School-themed random guest nicknames
const GUEST_ADJECTIVES = [
  "Pencil", "Ruler", "Eraser", "Chalk", "Marker", "Crayon",
  "Notebook", "Compass", "Protractor", "Stapler", "Binder",
];
const GUEST_NOUNS = [
  "Pete", "Nancy", "Sam", "Alex", "Jordan", "Casey",
  "Riley", "Morgan", "Quinn", "Blake", "Drew",
];

export function randomGuestName(): string {
  const adj = GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  return `${adj} ${noun}`;
}

export async function loginAsGuest(customName?: string): Promise<AppUser> {
  const cred = await signInAnonymously(getFirebaseAuth());
  // Sanitize the guest display name: strip HTML tags and limit length to prevent XSS (from check.txt security audit)
  let displayName = customName ? customName.replace(/<[^>]*>/g, "").trim() : randomGuestName();
  if (displayName.length === 0) {
    displayName = randomGuestName();
  } else {
    displayName = displayName.substring(0, 16); // enforce max length of 16
  }
  await updateProfile(cred.user, { displayName });
  return userToAppUser(cred.user, true);
}

export async function loginWithGoogle(): Promise<AppUser> {
  const cred = await signInWithPopup(getFirebaseAuth(), provider);
  return userToAppUser(cred.user, false);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function userToAppUser(user: User, isGuest: boolean): AppUser {
  return {
    uid: user.uid,
    displayName: user.displayName || randomGuestName(),
    isGuest,
    photoURL: user.photoURL || undefined,
  };
}

export function onAuthChange(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    if (!user) {
      callback(null);
      return;
    }
    // Anonymous users are guests
    callback(userToAppUser(user, user.isAnonymous));
  });
}

// Player accent colors
export const PLAYER_COLORS = ["#1F4E79", "#FF6B6B", "#4ECDC4", "#95E06C"];
