import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import DoodleBackground from "@/components/layout/DoodleBackground";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: "#0e408e",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ourlastpage.vercel.app"),
  title: "Last Page — Paper Games",
  description:
    "The Last Page of Your School Notebook — play classic paper games online with friends. Hangman, SOS, Dots & Boxes, and Name Place Animal Thing.",
  keywords: ["paper games", "hangman", "SOS", "dots and boxes", "name place animal thing", "multiplayer"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Last Page",
  },
  openGraph: {
    title: "Last Page — Paper Games",
    description: "The Last Page of Your School Notebook",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Last Page — Paper Games",
    description: "The Last Page of Your School Notebook",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="notebook-bg min-h-screen flex flex-col justify-between">
        {/* Graphite Lead Shading Overlay */}
        <div className="graphite-shading-bg" />

        {/* Notebook Spiral Binding visual decoration on the far-left margin */}
        <div className="fixed left-1.5 sm:left-4 top-0 bottom-0 pointer-events-none z-0 flex flex-col justify-around py-4 opacity-[0.18]">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              {/* Binder ring hole */}
              <div className="w-2.5 h-2.5 rounded-full bg-pencil/60 border border-pencil/30" />
              {/* Steel coil ring visual */}
              <div className="w-5 h-1 bg-gradient-to-r from-pencil/40 to-pencil/70 rounded-full -rotate-12 transform origin-left -translate-x-0.5" />
            </div>
          ))}
        </div>

        {/* Dynamic scrolling doodles spread throughout the page */}
        <DoodleBackground />

        <div>
          <NavBar />
          <main className="relative z-10">
            {children}
          </main>
        </div>
        <footer className="w-full py-6 border-t border-blue-lines bg-paper/50 relative z-10 text-xs text-pencil/95 font-hand">
          <div className="max-w-6xl mx-auto px-6 pl-6 sm:pl-24 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", fontWeight: 700 }}>
                Last Page
              </span>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem" }} className="text-pencil/95">
                — of your School Notebook
              </span>
            </div>
            <div className="flex gap-4 text-pencil/90">
              <Link href="/privacy" className="hover:text-ink transition-colors underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-ink transition-colors underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
