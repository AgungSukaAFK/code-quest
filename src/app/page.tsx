import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">CodeQuest 🎮</h1>
      <p className="text-muted-foreground mb-8">
        Game Edukasi Adaptif Penalaran Logis-Komputasional
      </p>
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="font-semibold mb-2">Connection Status</h2>
        <p className="text-sm text-muted-foreground">
          {error
            ? `❌ Error: ${error.message}`
            : "✅ Supabase connected successfully"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Session: {data.session ? "Active" : "No session yet"}
        </p>
      </div>
    </main>
  );
}
