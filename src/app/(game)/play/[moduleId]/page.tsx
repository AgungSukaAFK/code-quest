interface PlayPageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { moduleId } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Play: {moduleId}</h1>
      <p className="text-muted-foreground">Puzzle view — Hari 2</p>
    </main>
  );
}
