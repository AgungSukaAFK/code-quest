import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Network, Binary, Lock, Sparkles } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = { Network, Binary }

export default async function WorldMapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .order('display_order')

  return (
    <div className="min-h-screen bg-background">
      <Header user={{
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_seed: profile?.avatar_seed,
      }} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Peta Dunia Logikalia 🗺️</h1>
          <p className="text-muted-foreground">
            Pilih region untuk memulai petualangan logika-komputasionalmu
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {modules?.map((module) => {
            const Icon = iconMap[module.icon_name] ?? Sparkles
            const typeLabel = module.type === 'computational_thinking'
              ? '🧠 Berpikir Komputasional'
              : '⚡ Logika Matematika'

            return (
              <Card key={module.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabel}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{module.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/play/${module.id}`} className={buttonVariants({ variant: 'default' }) + ' w-full justify-center'}>
                    Mulai Petualangan
                  </Link>
                </CardContent>
              </Card>
            )
          })}

          <Card className="opacity-50 border-dashed">
            <CardHeader>
              <div className="p-3 rounded-lg bg-muted w-fit mb-2">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-muted-foreground">Region Terkunci</CardTitle>
              <CardDescription>Akan terbuka di update berikutnya</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
