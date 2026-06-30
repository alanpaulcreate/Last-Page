import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pl-6 sm:pl-24 py-12">
      <div
        className="sticky-card p-8 fade-in-up"
        style={{ "--card-rot": "1deg", backgroundColor: "var(--card-yellow)" } as React.CSSProperties}
      >
        <Link href="/" className="font-hand text-pencil/80 hover:text-ink transition-colors block mb-4">
          ← Back to home
        </Link>
        <h1 className="font-hand text-4xl font-bold text-ink mb-6">Privacy Policy</h1>
        <div className="space-y-4 font-hand text-pencil text-lg leading-relaxed">
          <p>
            Welcome to <strong>The Last Page</strong>! We respect your privacy and want to make sure your casual gameplay experience is as transparent as possible.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">1. Data We Collect</h2>
          <p>
            Because this application uses Firebase Authentication anonymous guest logins, we do not require your email address, phone number, or password. We only collect the custom visual nickname you provide and save it alongside a randomized ID to identify you in a room.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">2. Cookies and Storage</h2>
          <p>
            We use browser local storage and Firebase session cookies to keep you signed in as a guest or Google user. These are strictly functional elements needed to maintain connection with active games.
          </p>
          <h2 className="text-2xl font-bold text-ink mt-6">3. Room Expiry</h2>
          <p>
            All room documents and active scores in Firestore expire automatically after 24 hours to keep the database clean and prevent data hoarding.
          </p>
        </div>
      </div>
    </div>
  );
}
