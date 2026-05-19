"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nisn, setNisn] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, fullName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Login gagal.");
      }

      toast.success("Login berhasil.");
      router.push("/world-map");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login gagal.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      toast.error(signInError.message);
      setLoading(false);
      return;
    }

    toast.success("Login berhasil.");
    router.push("/world-map");
    router.refresh();
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Image
              src="/images/codequest.webp"
              alt="CodeQuest"
              width={280}
              height={80}
              style={{ height: "80px", width: "auto" }}
              unoptimized
              loading="eager"
            />
          </div>
          <p className="text-slate-600">
            Game Edukasi Penalaran Logis-Komputasional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mulai Petualangan</CardTitle>
            <CardDescription>
              Pilih metode login sesuai akun kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Siswa</TabsTrigger>
                <TabsTrigger value="staff">Moderator/Guru</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="nisn">NISN</Label>
                    <Input
                      id="nisn"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      required
                      placeholder="Contoh: 0099887766"
                    />
                  </div>

                  <div>
                    <Label htmlFor="full-name">Nama Lengkap</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Nama sesuai data moderator"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Nama tidak membedakan huruf besar-kecil.
                  </p>
                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Masuk sebagai Siswa
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="staff">
                <form onSubmit={handleStaffLogin} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="staff-email">Email</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@sekolah.sch.id"
                    />
                  </div>

                  <div>
                    <Label htmlFor="staff-password">Password</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Masukkan password"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Masuk sebagai Moderator/Guru
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="rounded-xl bg-white/80 border border-slate-200 px-3 py-4 shadow-xs backdrop-blur-sm">
          <p className="text-center text-xs text-slate-500 mb-4 uppercase tracking-wider">
            Didukung oleh
          </p>
          <div className="flex items-center justify-center gap-3 flex-nowrap">
            <Image
              src="/images/kemdikbud.webp"
              alt="Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/diktisaintek.webp"
              alt="DIKTISAINTEK"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/bima.webp"
              alt="BIMA"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/uniba.webp"
              alt="Universitas Bina Bangsa"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/unbaja.webp"
              alt="Universitas Banten Jaya"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/smk.webp"
              alt="SMK PGRI 3"
              width={120}
              height={44}
              style={{ height: "36px", width: "auto" }}
              unoptimized
            />
          </div>
        </div>
      </div>
    </main>
  );
}
