"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Loader2,
  Save,
  Shield,
  User,
  Palette,
  Network,
  Binary,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Swords,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ModuleProgress } from "@/app/(game)/profile/page";

const AVATAR_SEEDS = [
  "explorer", "wizard", "knight", "ranger",
  "mage",     "rogue",  "paladin","bard",
  "druid",    "monk",   "hacker", "coder",
  "ninja",    "captain","scholar","inventor",
];

const MODULE_ICONS: Record<string, React.ElementType> = {
  M2: Network,
  L1: Binary,
};

const profileSchema = z.object({
  display_name: z.string().min(1, "Nama tidak boleh kosong").max(50),
  username: z
    .string()
    .min(3, "Min. 3 karakter")
    .max(30, "Maks. 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, dan underscore"),
  class_name: z.string().max(50).optional(),
});

const passwordSchema = z
  .object({
    new_password: z.string().min(6, "Min. 6 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_seed: string | null;
  class_name: string | null;
  created_at: string;
}

interface ProfileClientProps {
  profile: Profile;
  moduleProgress: ModuleProgress[];
  userEmail: string;
}

function skillLabel(level: number): { text: string; color: string } {
  if (level >= 0.66) return { text: "Mahir", color: "text-emerald-500" };
  if (level >= 0.33) return { text: "Berkembang", color: "text-amber-500" };
  return { text: "Pemula", color: "text-red-400" };
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function ProfileClient({
  profile,
  moduleProgress,
  userEmail,
}: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const savedSeed = profile.avatar_seed ?? profile.id;
  const [selectedSeed, setSelectedSeed] = useState(savedSeed);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setSelectedSeed(profile.avatar_seed ?? profile.id);
  }, [profile.avatar_seed, profile.id]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile.display_name ?? "",
      username: profile.username ?? "",
      class_name: profile.class_name ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const handleSaveProfile = async (data: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          username: data.username,
          class_name: data.class_name || null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profil berhasil diperbarui.");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil.";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_seed: selectedSeed })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Avatar berhasil diperbarui.");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui avatar.";
      toast.error(msg);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (data: PasswordFormValues) => {
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.new_password,
      });
      if (error) throw error;
      toast.success("Password berhasil diubah.");
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah password.";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName =
    profile.display_name || profile.username || "Petualang";
  const totalSolved = moduleProgress.reduce((s, m) => s + m.totalCorrect, 0);
  const totalAttempts = moduleProgress.reduce(
    (s, m) => s + m.totalAttempts,
    0,
  );
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* ── Hero ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/30 shrink-0">
              <AvatarImage src={avatarUrl(selectedSeed)} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{displayName}</h1>
              <p className="text-sm text-muted-foreground truncate">
                @{profile.username ?? "—"}
              </p>
              {profile.class_name && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {profile.class_name}
                </Badge>
              )}
            </div>
            <div className="ml-auto text-right shrink-0 hidden sm:block">
              <p className="text-xs text-muted-foreground">Bergabung</p>
              <p className="text-sm font-medium">
                {format(new Date(profile.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>

          {/* Overall quick stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold">{totalSolved}</p>
              <p className="text-[11px] text-muted-foreground">Puzzle Solved</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Swords className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xl font-bold">{totalAttempts}</p>
              <p className="text-[11px] text-muted-foreground">Total Attempt</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Target className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold">{overallAccuracy}%</p>
              <p className="text-[11px] text-muted-foreground">Akurasi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Progress per Modul ── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Progress Modul
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {moduleProgress.map((mod) => {
            const Icon = MODULE_ICONS[mod.moduleId] ?? Target;
            const notStarted = mod.totalSessions === 0;
            const skill = mod.skillLevel ?? 0;
            const accuracy =
              mod.totalAttempts > 0
                ? Math.round((mod.totalCorrect / mod.totalAttempts) * 100)
                : 0;
            const { text: skillText, color: skillColor } = notStarted
              ? { text: "Belum mulai", color: "text-muted-foreground" }
              : skillLabel(skill);

            return (
              <Card key={mod.moduleId} className={cn(notStarted && "opacity-60")}>
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">
                        {mod.moduleName}
                      </p>
                      <p className={cn("text-xs font-medium", skillColor)}>
                        {skillText}
                      </p>
                    </div>
                  </div>

                  {!notStarted && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Skill level</span>
                          <span>{Math.round(skill * 100)}%</span>
                        </div>
                        <Progress value={skill * 100} className="h-1.5" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold">{mod.totalSessions}</p>
                          <p className="text-[10px] text-muted-foreground">Sesi</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{mod.totalCorrect}/{mod.totalAttempts}</p>
                          <p className="text-[10px] text-muted-foreground">Benar/Total</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{accuracy}%</p>
                          <p className="text-[10px] text-muted-foreground">Akurasi</p>
                        </div>
                      </div>

                      {mod.lastPlayedAt && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Terakhir{" "}
                          {format(new Date(mod.lastPlayedAt), "dd MMM yyyy")}
                        </p>
                      )}
                    </>
                  )}

                  {notStarted && (
                    <p className="text-xs text-muted-foreground">
                      Kamu belum pernah bermain di modul ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Settings Tabs ── */}
      <Tabs defaultValue="identity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Identitas
          </TabsTrigger>
          <TabsTrigger value="avatar" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Avatar
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Identitas ── */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Ubah nama dan informasi akun kamu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(handleSaveProfile)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="display_name">Nama Tampilan</Label>
                  <Input
                    id="display_name"
                    {...profileForm.register("display_name")}
                    placeholder="Nama lengkap kamu"
                  />
                  {profileForm.formState.errors.display_name && (
                    <p className="text-xs text-red-500">
                      {profileForm.formState.errors.display_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...profileForm.register("username")}
                    placeholder="username_kamu"
                  />
                  {profileForm.formState.errors.username && (
                    <p className="text-xs text-red-500">
                      {profileForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="class_name">Kelas</Label>
                  <Input
                    id="class_name"
                    {...profileForm.register("class_name")}
                    placeholder="cth: X RPL 1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={userEmail} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Email tidak dapat diubah.
                  </p>
                </div>

                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Avatar ── */}
        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Avatar</CardTitle>
              <CardDescription>Pilih karakter petualanganmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_SEEDS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setSelectedSeed(seed)}
                    className={cn(
                      "rounded-xl border-2 p-2 transition-all hover:scale-105 focus:outline-none",
                      selectedSeed === seed
                        ? "border-primary bg-primary/10 scale-105 shadow-sm"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mx-auto">
                      <AvatarImage src={avatarUrl(seed)} />
                      <AvatarFallback>{seed[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] text-center mt-1.5 text-muted-foreground capitalize truncate">
                      {seed}
                    </p>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSaveAvatar}
                disabled={savingAvatar || selectedSeed === savedSeed}
              >
                {savingAvatar ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Avatar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Keamanan ── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Pastikan password baru kuat dan mudah diingat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="new_password">Password Baru</Label>
                  <Input
                    id="new_password"
                    type="password"
                    {...passwordForm.register("new_password")}
                    placeholder="Min. 6 karakter"
                  />
                  {passwordForm.formState.errors.new_password && (
                    <p className="text-xs text-red-500">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm_password">Konfirmasi Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    {...passwordForm.register("confirm_password")}
                    placeholder="Ulangi password baru"
                  />
                  {passwordForm.formState.errors.confirm_password && (
                    <p className="text-xs text-red-500">
                      {passwordForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
