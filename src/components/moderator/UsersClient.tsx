"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import type { ManagedUser } from "@/app/(moderator)/moderator/users/page";
import { ModeratorNav } from "./ModeratorNav";

const CLASSES = ["Kelas A", "Kelas B", "Kelas C"];

interface UsersClientProps {
  users: ManagedUser[];
  currentUserId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersClient({ users, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "siswa" | "moderator">(
    "all",
  );
  const [classFilter, setClassFilter] = useState<string>("__all__");

  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [editClass, setEditClass] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [creating, setCreating] = useState(false);

  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [newStudentNisn, setNewStudentNisn] = useState("");
  const [newStudentFullName, setNewStudentFullName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);

  const siswaList = users.filter((u) => u.role === "siswa");
  const classStats = CLASSES.map((c) => ({
    name: c,
    count: siswaList.filter((u) => u.class_name === c).length,
  }));

  const filtered = users.filter((u) => {
    const matchSearch =
      search === "" ||
      (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.nisn ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchClass =
      classFilter === "__all__" ||
      (classFilter === "__none__"
        ? !u.class_name
        : u.class_name === classFilter);
    return matchSearch && matchRole && matchClass;
  });

  const handleOpenEdit = (u: ManagedUser) => {
    setEditUser(u);
    setEditClass(u.class_name ?? "");
  };

  const handleSaveClass = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/moderator/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          class_name: editClass || null,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
      toast.success("Kelas berhasil diperbarui.");
      setEditUser(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/moderator/create-moderator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          username: newUsername,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal membuat akun.");
      }
      toast.success("Akun moderator berhasil dibuat.");
      setShowCreate(false);
      setNewEmail("");
      setNewPassword("");
      setNewUsername("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStudent(true);
    try {
      const res = await fetch("/api/moderator/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nisn: newStudentNisn,
          full_name: newStudentFullName,
          class_name: newStudentClass || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal membuat akun siswa.");
      }

      toast.success("Akun siswa berhasil dibuat.");
      setShowCreateStudent(false);
      setNewStudentNisn("");
      setNewStudentFullName("");
      setNewStudentClass("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal membuat akun siswa.",
      );
    } finally {
      setCreatingStudent(false);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <ModeratorNav active="users" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Sistem</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} pengguna terdaftar · {siswaList.length} siswa ·{" "}
            {users.filter((u) => u.role === "moderator").length} moderator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateStudent(true)}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Tambah Siswa
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Moderator
          </Button>
        </div>
      </div>

      {/* Stats per kelas */}
      <div className="grid grid-cols-3 gap-3">
        {classStats.map((c) => (
          <Card
            key={c.name}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() =>
              setClassFilter((prev) => (prev === c.name ? "__all__" : c.name))
            }
          >
            <CardContent className="py-4 px-5">
              <p className="text-2xl font-bold">{c.count}</p>
              <p className="text-sm text-muted-foreground">{c.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NISN, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "siswa", "moderator"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                roleFilter === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {r === "all"
                ? "Semua Role"
                : r === "siswa"
                  ? "Siswa"
                  : "Moderator"}
            </button>
          ))}
          <span className="border-l border-border mx-1" />
          <button
            type="button"
            onClick={() => setClassFilter("__all__")}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              classFilter === "__all__"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            Semua Kelas
          </button>
          {CLASSES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setClassFilter((prev) => (prev === c ? "__all__" : c))
              }
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                classFilter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setClassFilter("__none__")}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              classFilter === "__none__"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            Belum Ada Kelas
          </button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Pengguna</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Kelas</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Tanggal Daftar
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      <p className="text-3xl mb-2">🔍</p>
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium flex items-center gap-1.5">
                          {u.display_name || u.username || "—"}
                          {u.id === currentUserId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-primary/50 text-primary"
                            >
                              Kamu
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.role === "siswa" && u.nisn
                            ? `NISN: ${u.nisn} · `
                            : ""}
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            u.role === "moderator" ? "default" : "secondary"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.class_name ? (
                          <span>{u.class_name}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "siswa" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit Kelas
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <p className="px-4 py-3 text-xs text-muted-foreground border-t">
              Menampilkan {filtered.length} dari {users.length} pengguna
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit class dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kelas Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Siswa:{" "}
              <span className="font-medium text-foreground">
                {editUser?.display_name ||
                  editUser?.username ||
                  editUser?.email}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="edit-class">Kelas</Label>
              <select
                id="edit-class"
                value={editClass}
                onChange={(e) => setEditClass(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— Tanpa Kelas —</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditUser(null)}>
                Batal
              </Button>
              <Button onClick={handleSaveClass} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create moderator dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Moderator Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateModerator} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-username">Nama Pengguna</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nama moderator"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                minLength={6}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Buat Akun
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create student dialog */}
      <Dialog open={showCreateStudent} onOpenChange={setShowCreateStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Siswa Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="student-nisn">NISN</Label>
              <Input
                id="student-nisn"
                value={newStudentNisn}
                onChange={(e) => setNewStudentNisn(e.target.value)}
                placeholder="Contoh: 0099887766"
                required
              />
              <p className="text-xs text-muted-foreground">
                NISN harus unik dan tidak boleh sama antar siswa.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-full-name">Nama Lengkap</Label>
              <Input
                id="student-full-name"
                value={newStudentFullName}
                onChange={(e) => setNewStudentFullName(e.target.value)}
                placeholder="Nama lengkap siswa"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-class">Kelas</Label>
              <select
                id="student-class"
                value={newStudentClass}
                onChange={(e) => setNewStudentClass(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— Tanpa Kelas —</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateStudent(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={creatingStudent}>
                {creatingStudent ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GraduationCap className="mr-2 h-4 w-4" />
                )}
                Buat Akun Siswa
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
