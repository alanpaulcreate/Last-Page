import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// ─── Hand-Drawn / Sketch SVG Icon Components ─────────────────────────────────

export const ChatIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Main bubble outline - double stroked for hand-drawn feel */}
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M20.5 12a7.5 7.5 0 0 1-7.5 7.5 7.5 7.5 0 0 1-3.5-.8L4 20l1.3-4.7a7.5 7.5 0 0 1-.8-3.3A7.5 7.5 0 0 1 12 4.5h.5a7.5 7.5 0 0 1 8 7.5z" opacity="0.5" />
    {/* Sketchy dots */}
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="13" cy="12" r="1" fill="currentColor" />
    <circle cx="17" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const SendIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Paper airplane */}
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
    {/* Extra sketch folds */}
    <path d="M11 13v6l3-3" opacity="0.6" strokeDasharray="1 1" />
  </svg>
);

export const TrashIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Trash Lid */}
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    {/* Sketchy inner lines / vertical lines */}
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
    {/* Shaky offset line for drawing feel */}
    <path d="M5.5 6.5h13M6 21.5h12" opacity="0.5" />
  </svg>
);

export const PublicIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Sketchy Circle Globe */}
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="9.5" opacity="0.4" />
    {/* Grid lines */}
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

export const ShieldIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Hand-drawn shield */}
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 20.5s6.5-3.5 6.5-8.5V6l-6.5-2.5L5.5 6v6c0 5 6.5 8.5 6.5 8.5z" opacity="0.5" />
    <line x1="12" y1="6" x2="12" y2="16" strokeDasharray="1 1" />
  </svg>
);

export const PencilIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Pencil */}
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <line x1="15" y1="5" x2="19" y2="9" />
    {/* Lead tip shading */}
    <path d="M3 21l2.5-2.5M3.5 19.5l1-1" opacity="0.7" />
  </svg>
);

export const LinkIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Two link rings */}
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const KeyIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Key head and shaft */}
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L18 5" />
    <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
  </svg>
);

export const CheckIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Double-stroke checkmark */}
    <path d="M20 6L9 17l-5-5" />
    <path d="M20 7L9.5 17.5l-4-4" opacity="0.4" />
  </svg>
);

export const CloseIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Shaky X mark */}
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
    {/* Double sketchy overlay */}
    <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" opacity="0.4" />
  </svg>
);

// ─── Game Icons (Homepage / Lobby UI replacements) ──────────────────────────

export const HangmanGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* Gallows base */}
    <path d="M6 42h16M10 42V6h18v6" />
    {/* Rope */}
    <path d="M28 12v6" />
    {/* Shaky diagonal brace */}
    <path d="M10 16l6-10" opacity="0.6" strokeWidth="2" />
    {/* Stick figure head */}
    <circle cx="28" cy="22" r="4" />
    {/* Stick figure body */}
    <path d="M28 26v8M25 29h6M25 38l3-4 3 4" strokeWidth="2.5" />
  </svg>
);

export const SosGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* Grid board (sketchy) */}
    <path d="M18 6v36M30 6v36M6 18h36M6 30h36" />
    
    {/* Cursive / Sketchy S - O - S letters in cells */}
    {/* S in top-left */}
    <path d="M10 10c0-1.5 2-1.5 2 0s-2 1.5-2 3c0 1.5 2 1.5 2 0" strokeWidth="2.5" />
    {/* O in center */}
    <circle cx="24" cy="24" r="3.5" strokeWidth="2.5" />
    {/* S in bottom-right */}
    <path d="M36 34c0-1.5 2-1.5 2 0s-2 1.5-2 3c0 1.5 2 1.5 2 0" strokeWidth="2.5" />

    {/* Highlight circle around the SOS sequence */}
    <path d="M8 8l32 32" stroke="var(--red-margin)" strokeWidth="2" opacity="0.75" strokeDasharray="3 3" />
  </svg>
);

export const DotsGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* Grid of Dots (filled circles) */}
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <circle cx="36" cy="12" r="3" fill="currentColor" />
    <circle cx="12" cy="36" r="3" fill="currentColor" />
    <circle cx="36" cy="36" r="3" fill="currentColor" />
    
    {/* Shaky sketch lines connecting the dots */}
    <path d="M12 12h24M12 12v24" />
    {/* Second stroke for hand-drawn variation */}
    <path d="M12.5 11.5h23" opacity="0.5" strokeWidth="1.5" />
    
    {/* A partial line in progress */}
    <path d="M36 12v12" opacity="0.6" strokeDasharray="3 2" />

    {/* Completed box shading */}
    <path d="M15 15h18v18H15z" fill="currentColor" opacity="0.15" stroke="none" />
    <text x="21" y="27" fontSize="12" fontFamily="'Caveat', cursive" fontWeight="bold" fill="currentColor" stroke="none">A</text>
  </svg>
);

export const NamePlaceGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* Clipboard / Notebook page outline */}
    <path d="M14 6h20a2 2 0 0 1 2 2v34a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    
    {/* Clipboard clip at top */}
    <path d="M20 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    
    {/* Notebook rules (horizontal lines) */}
    <path d="M16 14h16M16 20h16M16 26h16M16 32h16M16 38h16" strokeWidth="2" opacity="0.7" />
    
    {/* Vertical red margin line */}
    <path d="M18 8v32" stroke="var(--red-margin)" strokeWidth="1.5" opacity="0.75" />
  </svg>
);

export const BingoGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* Outline 5x5 grid (outer border) */}
    <rect x="6" y="6" width="36" height="36" rx="2" />
    {/* Inner grid lines */}
    <path d="M13.2 6v36M20.4 6v36M27.6 6v36M34.8 6v36" opacity="0.6" strokeWidth="2" />
    <path d="M6 13.2h36M6 20.4h36M6 27.6h36M6 34.8h36" opacity="0.6" strokeWidth="2" />
    {/* Some random sketchy marks inside */}
    <path d="M9 16l3 3M12 16l-3 3" stroke="var(--red-margin)" strokeWidth="2" />
    <path d="M30 30l3 3M33 30l-3 3" stroke="var(--red-margin)" strokeWidth="2" />
  </svg>
);

export const TicTacToeGameIcon = ({ className = "", size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-game-icon ${className}`}
    {...props}
  >
    {/* 3x3 Grid board lines (sketchy / hash symbol) */}
    <path d="M17 6v36M31 6v36M6 17h36M6 31h36" />
    {/* X in center */}
    <path d="M20 20l8 8M28 20l-8 8" strokeWidth="2.5" />
    {/* O in top-left */}
    <circle cx="11.5" cy="11.5" r="3.5" strokeWidth="2.5" />
    {/* X in bottom-right */}
    <path d="M34 34l6 6M40 34l-6 6" strokeWidth="2.5" opacity="0.6" />
    {/* O in top-right */}
    <circle cx="36.5" cy="11.5" r="3.5" strokeWidth="2.5" opacity="0.6" />
  </svg>
);

export const NotebookIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Notebook spine/rings */}
    <path d="M4 3v18" />
    <path d="M2 5h2M2 9h2M2 13h2M2 17h2" strokeWidth="1.5" />
    {/* Page cover */}
    <path d="M4 3h15a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4" />
    <path d="M8 7h8M8 11h8M8 15h5" strokeDasharray="1 1" opacity="0.7" />
  </svg>
);

export const DiceIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Shaky square */}
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" opacity="0.4" strokeWidth="1" />
    {/* Dots for 5 dots */}
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const PenIcon = ({ className = "", size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`doodle-svg-icon ${className}`}
    {...props}
  >
    {/* Pen outline */}
    <path d="M18 2L22 6L9 19L5 19L5 15L18 2z" />
    {/* Pen cap details */}
    <path d="M16 4L20 8" />
    {/* Nib line */}
    <path d="M5 19L3 21L3 21" />
    <path d="M8 14L10 16" opacity="0.6" strokeWidth="1.5" />
  </svg>
);



