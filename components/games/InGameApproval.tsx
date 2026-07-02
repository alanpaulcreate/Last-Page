"use client";
import React from "react";
import { Player } from "@/types";
import { approveJoinRequest, declineJoinRequest } from "@/lib/firestore";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";

interface InGameApprovalProps {
  roomId: string;
  joinRequests: Player[];
  isHost: boolean;
}

export default function InGameApproval({ roomId, joinRequests, isHost }: InGameApprovalProps) {
  // Only the host should see and handle join requests
  if (!isHost || !joinRequests || joinRequests.length === 0) {
    return null;
  }

  const handleApprove = async (player: Player) => {
    try {
      await approveJoinRequest(roomId, player);
    } catch (err) {
      console.error("Error approving player:", err);
    }
  };

  const handleDecline = async (playerUid: string) => {
    try {
      await declineJoinRequest(roomId, playerUid);
    } catch (err) {
      console.error("Error declining player:", err);
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-[260px] w-full animate-bounce-slow">
      {joinRequests.map((req) => (
        <div
          key={req.uid}
          className="sticky-card pencil-shade p-3 flex flex-col relative"
          style={{
            "--card-rot": "1deg",
            backgroundColor: "var(--card-yellow)",
            boxShadow: "2px 2px 0 rgba(74,74,74,0.12), 3px 4px 5px rgba(74,74,74,0.08)"
          } as React.CSSProperties}
        >
          {/* Tape */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-4 rounded-sm opacity-70"
            style={{
              background: "rgba(191,215,255,0.8)",
              border: "1px solid rgba(191,215,255,0.5)"
            }}
          />

          <div className="text-center mb-2 mt-0.5">
            <p className="font-hand font-bold text-ink text-sm">
              Join Request
            </p>
            <p className="text-xs text-pencil/95 leading-snug font-hand mt-0.5 px-1 truncate">
              <span className="font-semibold text-ink">{req.displayName}</span> wants to join.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(req)}
              className="sketch-btn flex-1 py-1 px-2 text-xs bg-ink text-paper hover:bg-ink/90 flex items-center justify-center gap-1 cursor-pointer font-hand"
            >
              <CheckIcon size={12} /> Accept
            </button>
            <button
              onClick={() => handleDecline(req.uid)}
              className="sketch-btn flex-1 py-1 px-2 text-xs text-red-margin hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer font-hand"
            >
              <CloseIcon size={12} /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
