"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  ChatMessage,
  sendChatMessage,
  subscribeChatMessages,
  deleteChatMessage,
  clearChatMessages
} from "@/lib/firestore";
import {
  ChatIcon,
  SendIcon,
  TrashIcon,
  CloseIcon
} from "@/components/ui/Icons";

interface ChatBoxProps {
  roomId: string;
  isHost?: boolean;
}

export default function ChatBox({ roomId, isHost = false }: ChatBoxProps) {
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
    if (!user) return;
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
              className="font-hand text-xl font-bold text-ink flex items-center gap-1.5"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <ChatIcon size={18} /> Room Chat
            </span>
            <div className="flex items-center gap-2">
              {isHost && messages.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all chat messages?")) {
                      clearChatMessages(roomId);
                    }
                  }}
                  className="text-red-margin hover:text-red-600 text-xs font-hand underline cursor-pointer"
                  title="Clear all messages"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-pencil/80 hover:text-ink transition-colors leading-none cursor-pointer flex items-center justify-center"
                aria-label="Close chat"
              >
                <CloseIcon size={18} />
              </button>
            </div>
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
                  {/* Bubble & Delete row */}
                  <div className={`flex items-center gap-1.5 max-w-[90%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className="px-3 py-2 rounded-sm text-sm relative"
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
                    {isHost && (
                      <button
                        onClick={() => deleteChatMessage(roomId, msg.id)}
                        className="text-red-margin hover:text-red-600 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        title="Delete message"
                        aria-label="Delete message"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
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
              className="sketch-btn-primary sketch-btn text-sm px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send message"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 pencil-shadow cursor-pointer"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          border: "3px solid var(--ink)",
          boxShadow: "4px 5px 0 rgba(74,74,74,0.25), 6px 8px 6px rgba(74,74,74,0.12)",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon size={24} /> : <ChatIcon size={24} />}
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center animate-bounce"
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
