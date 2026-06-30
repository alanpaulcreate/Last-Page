"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  ChatMessage,
  sendChatMessage,
  subscribeChatMessages,
} from "@/lib/firestore";

interface ChatBoxProps {
  roomId: string;
}

export default function ChatBox({ roomId }: ChatBoxProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user) return; // Wait for authentication to resolve
    const unsub = subscribeChatMessages(roomId, (msgs) => {
      setMessages(msgs);
      if (!open) {
        setUnread((prev) => prev + 1);
      }
    });
    return unsub;
  }, [roomId, user, open]);

  // Auto-scroll on new messages when open
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Clear unread when opened, focus input
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSend = async () => {
    if (!user || !input.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(roomId, user.uid, user.displayName, input.trim());
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="sticky-card pencil-shade flex flex-col w-80 h-[420px] overflow-hidden"
          style={{
            "--card-rot": "0deg",
            backgroundColor: "var(--card-yellow)",
          } as React.CSSProperties}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b-2"
            style={{ borderColor: "rgba(191,215,255,0.6)" }}
          >
            <span
              className="font-hand text-xl font-bold text-ink"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              ✏️ Room Chat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-pencil/80 hover:text-ink transition-colors text-lg leading-none"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p
                className="text-center text-pencil/90 mt-8"
                style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem" }}
              >
                No messages yet...<br />say hello! 👋
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.uid === user?.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {/* Name */}
                  <span
                    className="text-xs text-pencil/90 mb-0.5 px-1"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {isMe ? "You" : msg.displayName}
                  </span>
                  {/* Bubble */}
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-sm text-sm relative"
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: "1.05rem",
                      lineHeight: "1.4",
                      background: isMe
                        ? "var(--ink)"
                        : "rgba(191,215,255,0.45)",
                      color: isMe ? "var(--paper)" : "var(--ink)",
                      boxShadow: "2px 2px 0 rgba(74,74,74,0.15), 3px 4px 3px rgba(74,74,74,0.08)",
                    }}
                  >
                    {msg.text}
                    {/* Pencil underline texture */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-px opacity-20"
                      style={{ background: isMe ? "rgba(255,255,255,0.4)" : "var(--ink)" }}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-4 py-3 border-t-2 flex gap-2 items-center"
            style={{ borderColor: "rgba(191,215,255,0.6)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="write something..."
              maxLength={200}
              className="notebook-input flex-1 text-sm"
              disabled={sending}
              aria-label="Chat message input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="sketch-btn-primary sketch-btn text-sm px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              ✈
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 pencil-shadow"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          border: "3px solid var(--ink)",
          boxShadow: "4px 5px 0 rgba(74,74,74,0.25), 6px 8px 6px rgba(74,74,74,0.12)",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{
              background: "var(--red-margin)",
              color: "white",
              fontFamily: "'Caveat', cursive",
              fontSize: "0.75rem",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
