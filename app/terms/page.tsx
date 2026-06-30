import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pl-6 sm:pl-24 py-12">
      <div
        className="sticky-card p-8 fade-in-up"
        style={{ "--card-rot": "-1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
      >
        <Link href="/" className="font-hand text-pencil/80 hover:text-ink transition-colors block mb-4">
          ← Back to home
        </Link>
        <h1 className="font-hand text-4xl font-bold text-ink mb-6">Terms of Service</h1>
        <div className="space-y-4 font-hand text-pencil text-lg leading-relaxed">
          <p>
            By playing games on <strong>The Last Page</strong>, you agree to these simple playground rules.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">1. Gameplay Conduct</h2>
          <p>
            Please write clean nicknames and respect other players when sharing custom room codes. Offensive, hateful, or toxic nicknames are prohibited.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">2. Fair Use</h2>
          <p>
            This website is provided free of charge for nostalgic recreation. Do not run bots, automated scripts, or attack our database resources.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">3. Disclaimer</h2>
          <p>
            Games are provided "as is". We are not responsible for any connection drop, browser crash, or lost guest scores. Have fun doodling!
          </p>
        </div>
      </div>
    </div>
  );
}
