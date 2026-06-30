"use client";
import { useState } from "react";

interface RoomCodeDisplayProps {
  code: string;
}

export default function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center">
      <p className="font-hand text-pencil/95 text-sm mb-2">Room Code</p>
      <div className="room-code cursor-pointer select-all" onClick={copy}>
        {code.split("").map((c, i) => (
          <span key={i} style={{ display: "inline-block", minWidth: "1.1ch" }}>{c}</span>
        ))}
      </div>
      <button
        onClick={copy}
        className="mt-2 text-xs text-pencil/90 hover:text-ink transition-colors font-hand block mx-auto"
      >
        {copied ? "✓ Copied!" : "click to copy"}
      </button>
    </div>
  );
}
