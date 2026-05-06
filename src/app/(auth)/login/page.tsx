'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, GraduationCap, Brain, Rocket } from 'lucide-react'

const demoUsers = [
  {
    label: 'Siswa Pemula',
    icon: GraduationCap,
    email: 'pemula@codequest.demo',
    password: 'demo123456',
    description: 'Profil siswa baru, belum tahu apa-apa',
  },
  {
    label: 'Siswa Reguler',
    icon: Brain,
    email: 'reguler@codequest.demo',
    password: 'demo123456',
    description: 'Siswa dengan kemampuan rata-rata',
  },
  {
    label: 'Siswa Mahir',
    icon: Rocket,
    email: 'mahir@codequest.demo',
    password: 'demo123456',
    description: 'Siswa cepat tangkap, mau tantangan',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    e?.preventDefault?.()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: customEmail ?? email,
      password: customPassword ?? password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/world-map')
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await handleSignIn(undefined, email, password)
  }

  const handleDemoLogin = async (demo: (typeof demoUsers)[0]) => {
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demo.email,
      password: demo.password,
    })

    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: demo.email,
        password: demo.password,
        options: { data: { username: demo.label } },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      await supabase.auth.signInWithPassword({ email: demo.email, password: demo.password })
    }

    router.push('/world-map')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">CodeQuest 🎮</h1>
          <p className="text-slate-400">Game Edukasi Penalaran Logis-Komputasional</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mulai Petualangan</CardTitle>
            <CardDescription>Login atau daftar untuk memulai</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
                <TabsTrigger value="demo">Demo</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="email-signin">Email</Label>
                    <Input
                      id="email-signin"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="kamu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-signin">Password</Label>
                    <Input
                      id="password-signin"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Masuk
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="username">Nama Pengguna</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nama panggilan kamu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="kamu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-signup">Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Min. 6 karakter"
                      minLength={6}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="demo">
                <div className="space-y-3 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Login cepat untuk demo. RL akan adapt berbeda untuk setiap profil.
                  </p>
                  {demoUsers.map((demo) => {
                    const Icon = demo.icon
                    return (
                      <button
                        key={demo.email}
                        onClick={() => handleDemoLogin(demo)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50"
                      >
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{demo.label}</div>
                          <div className="text-xs text-muted-foreground">{demo.description}</div>
                        </div>
                      </button>
                    )
                  })}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
