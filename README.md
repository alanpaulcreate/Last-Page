# Last Page — Paper Games 📓

> *The Last Page of Your School Notebook*

A real-time multiplayer paper-games platform built with Next.js, TypeScript, Tailwind CSS, and Firebase. Play classic school notebook games online with friends!

## Games

| Game | Players | Description |
|---|---|---|
| 🪢 Hangman | 2 | Guess the word before the stick figure is complete |
| 🆘 SOS | 2 | Spell S-O-S on the grid to score points |
| ⬛ Dots & Boxes | 2 | Draw lines, complete boxes, claim territory |
| 📝 Name Place Animal Thing | 2–4 | Fill in Name, Place, Animal & Thing for a random letter |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom notebook CSS
- **Backend**: Firebase Firestore (real-time) + Firebase Auth
- **Hosting**: Vercel (recommended)

## Setup

### 1. Clone & Install

```bash
cd "Last Page"
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in test mode)
3. Enable **Authentication** → Sign-in methods:
   - Anonymous
   - Google
4. Copy your Firebase config

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase config values in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → Rules, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.resource.data.players.hasAny([{ "uid": request.auth.uid }]) || 
         resource.data.players.hasAny([{ "uid": request.auth.uid }]));
    }
  }
}
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
app/
├── page.tsx                    # Homepage — game cards
├── auth/page.tsx               # Login (guest / Google)
└── games/
    ├── hangman/[roomId]/       # Hangman game
    ├── sos/[roomId]/           # SOS game
    ├── dots-and-boxes/[roomId]/ # Dots & Boxes
    └── name-place/[roomId]/    # Name Place Animal Thing
components/
├── layout/NavBar.tsx
├── ui/                         # Shared UI (cards, buttons, WinBurst)
└── games/GameLobby.tsx        # Shared lobby component
lib/
├── firebase.ts                 # Firebase init
├── auth.ts                     # Auth helpers
├── firestore.ts               # Room CRUD
└── games/                     # Game logic (pure functions)
```

---

*Built with ✏️ and nostalgia*
