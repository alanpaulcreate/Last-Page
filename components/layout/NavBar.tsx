"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { leaveRoom } from "@/lib/firestore";
import { PencilIcon } from "@/components/ui/Icons";

export default function NavBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Path matches: /games/[gameType]/[roomId]
  const pathParts = pathname.split("/");
  const isInMatch = pathParts[1] === "games" && pathParts[3];
  const roomId = isInMatch ? pathParts[3] : null;

  const handleLeaveMatch = async () => {
    if (user && roomId) {
      try {
        await leaveRoom(roomId, user.uid);
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
    router.push("/");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b-2 border-blue-lines bg-paper/90 backdrop-blur-sm"
      style={{ borderBottomColor: "#BFD7FF" }}
    >
      {/* Red margin line visual accent */}
      <div className="absolute left-[20px] sm:left-[72px] top-0 bottom-0 w-[2px] bg-red-margin opacity-50 pointer-events-none" />

      <nav className="max-w-6xl mx-auto px-6 pl-6 sm:pl-24 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="Last Page"
            width={120}
            height={40}
            className="object-contain group-hover:opacity-80 transition-opacity"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-8 bg-blue-lines/30 rounded animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center text-paper text-xs font-bold font-hand">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-hand text-ink text-base hidden sm:block">
                  {user.displayName}
                </span>
              </div>
              {isInMatch && (
                <button
                  onClick={handleLeaveMatch}
                  className="sketch-btn text-sm py-2 px-4"
                >
                  Leave Match
                </button>
              )}
            </div>
          ) : (
            <Link href={`/auth?redirect=${encodeURIComponent(pathname)}`} className="sketch-btn-primary sketch-btn text-sm py-2 px-5 flex items-center gap-1.5 justify-center">
              <PencilIcon size={16} /> Play
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
