"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface WinBurstProps {
  show: boolean;
  message?: string;
  onClose?: () => void;
  onCloseLabel?: string;
}

const STARS = ["✦", "★", "✶", "✸", "⭐", "🌟", "✨"];

export default function WinBurst({ show, message, onClose, onCloseLabel }: WinBurstProps) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; star: string; rot: string }[]
  >([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const p = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * 360;
      const distance = 80 + Math.random() * 80;
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        star: STARS[Math.floor(Math.random() * STARS.length)],
        rot: `${Math.random() * 360}deg`,
      };
    });
    setParticles(p);
  }, [show]);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!show) return;

    // Focus the first button inside the card after a short timeout to let render settle
    const focusTimeout = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll('button, [href], [tabindex="0"]');
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const elements = modalRef.current.querySelectorAll('button, [href], [tabindex="0"]');
        if (elements.length === 0) return;
        const first = elements[0] as HTMLElement;
        const last = elements[elements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-paper/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-message"
    >
      <div className="relative text-center">
        {/* Particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="win-star absolute text-2xl"
            style={{
              "--tx": `${p.x}px`,
              "--ty": `${p.y}px`,
              "--rot": p.rot,
              animationDelay: `${Math.random() * 0.2}s`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            } as React.CSSProperties}
          >
            {p.star}
          </span>
        ))}

        {/* Message card */}
        <div
          ref={modalRef}
          className="sticky-card px-10 py-8 relative z-10"
          style={{ "--card-rot": "0deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
        >
          <div className="text-6xl mb-3">🎉</div>
          <h2 id="win-message" className="font-hand text-4xl font-bold text-ink mb-2">
            {message || "You Win!"}
          </h2>
          <p className="font-hand text-pencil/95 text-base mb-6">
            ✦ ✦ ✦
          </p>
          {onClose ? (
            <button onClick={onClose} className="sketch-btn-primary sketch-btn px-6 py-2">
              {onCloseLabel || "Play Again"}
            </button>
          ) : (
            <Link href="/" className="sketch-btn-primary sketch-btn inline-block px-6 py-2">
              Back to Lobby
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
