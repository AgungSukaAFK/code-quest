import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayPageProps {
  params: Promise<{ moduleId: string }>
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { moduleId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single()

  if (!module) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Header user={{
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_seed: profile?.avatar_seed,
      }} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/world-map" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-4')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Peta
          </Link>

        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-2">{module.name}</h1>
            <p className="text-muted-foreground mb-6">{module.description}</p>

            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <p className="text-muted-foreground">🚧 Puzzle area placeholder</p>
              <p className="text-xs text-muted-foreground mt-2">
                Akan diisi di Hari 4-5 (M2) atau Hari 7 (L1)
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
