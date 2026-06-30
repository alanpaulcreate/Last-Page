import { HangmanState } from "@/types";

export const HANGMAN_WORDS: Record<string, string[]> = {
  Animals: [
    "ELEPHANT", "GIRAFFE", "PENGUIN", "DOLPHIN", "CHEETAH",
    "KANGAROO", "FLAMINGO", "CROCODILE", "BUTTERFLY", "PORCUPINE",
    "HIPPOPOTAMUS", "PLATYPUS", "CHAMELEON", "CHIMPANZEE", "WOLVERINE",
    "HEDGEHOG", "OCTOPUS", "JELLYFISH", "ALLIGATOR", "RHINOCEROS",
    "SQUIRREL", "LEOPARD", "GORILLA", "ALBATROSS", "KANGAROO"
  ],
  Countries: [
    "BRAZIL", "GERMANY", "AUSTRALIA", "MOROCCO", "VIETNAM",
    "ARGENTINA", "PORTUGAL", "NIGERIA", "THAILAND", "COLOMBIA",
    "SWITZERLAND", "NEWZEALAND", "MADAGASCAR", "SINGAPORE", "INDONESIA",
    "EGYPT", "GREECE", "MEXICO", "CANADA", "ICELAND", "NETHERLANDS"
  ],
  "School Subjects": [
    "MATHEMATICS", "GEOGRAPHY", "CHEMISTRY", "LITERATURE", "PHILOSOPHY",
    "ECONOMICS", "BIOLOGY", "PHYSICS", "HISTORY", "PSYCHOLOGY",
    "SOCIOLOGY", "ANTHROPOLOGY", "ASTRONOMY", "LINGUISTICS", "ARCHAEOLOGY",
    "ALGEBRA", "GEOMETRY", "CALCULUS"
  ],
  Sports: [
    "BASKETBALL", "VOLLEYBALL", "BADMINTON", "SWIMMING", "GYMNASTICS",
    "ATHLETICS", "WRESTLING", "ARCHERY", "CRICKET", "FOOTBALL",
    "TENNIS", "BASEBALL", "HOCKEY", "CYCLING", "ROWING", "SKATING",
    "FENCING", "MARATHON", "TRIATHLON", "SNOWBOARDING", "SKATEBOARDING"
  ],
  "Fruits & Veggies": [
    "STRAWBERRY", "PINEAPPLE", "WATERMELON", "POMEGRANATE", "BLUEBERRY",
    "AVOCADO", "CUCUMBER", "CAULIFLOWER", "ASPARAGUS", "BROCCOLI",
    "RASPBERRY", "GRAPEFRUIT", "CANTALOUPE", "BLACKBERRY", "PUMPKIN",
    "ZUCCHINI", "EGGPLANT", "POTATO", "BANANA", "ORANGE", "CHERRY"
  ],
  "Jobs & Careers": [
    "ASTRONAUT", "FIREFIGHTER", "ARCHITECT", "DETECTIVE", "JOURNALIST",
    "SCIENTIST", "DENTIST", "ELECTRICIAN", "PROGRAMMER", "MECHANIC",
    "SURGEON", "LIBRARIAN", "ENGINEER", "CARPENTER", "PILOT",
    "TEACHER", "PHARMACIST", "VETERINARIAN", "ACCOUNTANT", "ATTORNEY"
  ],
  "Space & Science": [
    "ASTRONOMY", "NEBULA", "GALAXY", "SUPERNOVA", "CONSTELLATION",
    "ASTEROID", "METEORITE", "BLACKHOLE", "GRAVITY", "TELESCOPE",
    "SATELLITE", "QUANTUM", "PHOTOSYNTHESIS", "MOLECULE", "EVOLUTION",
    "BIOSPHERE", "DNA", "GENETICS", "GEOLOGY"
  ],
  "Household Objects": [
    "REFRIGERATOR", "MICROWAVE", "WARDROBE", "TELEPHONE", "BLENDER",
    "TOASTER", "MATTRESS", "BOOKCASE", "CURTAIN", "DISHWASHER",
    "TELEVISION", "THERMOMETER", "CALCULATOR", "FIREPLACE", "MIRROR",
    "BEDSHEET", "PILLOWCASE"
  ],
  "Nature & Weather": [
    "HURRICANE", "TORNADO", "BLIZZARD", "THUNDERSTORM", "RAINBOW",
    "WATERFALL", "VOLCANO", "GLACIER", "AVALANCHE", "EARTHQUAKE",
    "WILDERNESS", "RAINFOREST", "LIGHTNING", "TEMPEST", "ECLIPSE",
    "MONSOON", "TSUNAMI", "METEOR"
  ]
};

export const MAX_WRONG_GUESSES = 6;

export function initialHangmanState(): HangmanState {
  const categories = Object.keys(HANGMAN_WORDS);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const word = pickWord(category);
  return {
    word,
    maskedWord: word.split("").map(() => "_"),
    guessedLetters: [],
    wrongGuesses: 0,
    category,
    winner: null,
    loser: null,
  };
}

export function pickWord(category: string): string {
  const words = HANGMAN_WORDS[category] || HANGMAN_WORDS["Animals"];
  return words[Math.floor(Math.random() * words.length)];
}

export function guessLetter(
  state: HangmanState,
  letter: string
): HangmanState {
  if (state.guessedLetters.includes(letter)) return state;
  if (state.winner || state.loser) return state;

  const newGuessed = [...state.guessedLetters, letter];
  const isCorrect = state.word.includes(letter);

  const newMasked = state.word.split("").map((l, i) =>
    newGuessed.includes(l) ? l : "_"
  );

  const newWrong = isCorrect ? state.wrongGuesses : state.wrongGuesses + 1;
  const isWon = newMasked.every((c) => c !== "_");
  const isLost = newWrong >= MAX_WRONG_GUESSES;

  return {
    ...state,
    guessedLetters: newGuessed,
    maskedWord: newMasked,
    wrongGuesses: newWrong,
    winner: isWon ? "player" : null,
    loser: isLost ? "player" : null,
  };
}

export function hangmanIsOver(state: HangmanState): boolean {
  return state.winner !== null || state.loser !== null;
}

// SVG path data for each body part (indexed 1-6)
export const HANGMAN_SVG_PARTS = [
  // 1: Head
  `<circle cx="150" cy="70" r="20" stroke="#1F4E79" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  // 2: Body
  `<line x1="150" y1="90" x2="150" y2="160" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`,
  // 3: Left arm
  `<line x1="150" y1="110" x2="120" y2="140" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`,
  // 4: Right arm
  `<line x1="150" y1="110" x2="180" y2="140" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`,
  // 5: Left leg
  `<line x1="150" y1="160" x2="120" y2="195" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`,
  // 6: Right leg
  `<line x1="150" y1="160" x2="180" y2="195" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`,
];
