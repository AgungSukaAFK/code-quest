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
  Check,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  School,
  Search,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import type {
  ManagedClass,
  ManagedUser,
} from "@/app/(moderator)/moderator/users/page";
import { ModeratorNav } from "./ModeratorNav";

interface UsersClientProps {
  users: ManagedUser[];
  classes: ManagedClass[];
  currentUserId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersClient({ users, classes, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const classNames = classes.map((c) => c.name);

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

  // Kelola kelas state
  const [showClasses, setShowClasses] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [classSaving, setClassSaving] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState("");
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string | null>(
    null,
  );

  // CSV import state
  const [showImport, setShowImport] = useState(false);
  const [importClass, setImportClass] = useState("");
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  type ImportResult = { nisn: string; name: string; status: "ok" | "skip" | "error"; message?: string };
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);

  function parseCsv(text: string): { nisn: string; full_name: string }[] {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Auto-detect delimiter: semicolon or comma
    const delimiter = lines[0].includes(";") ? ";" : ",";

    const rows: { nisn: string; full_name: string }[] = [];
    for (const line of lines) {
      const cols = line.split(delimiter).map((c) => c.trim());

      let nisn: string;
      let full_name: string;

      if (cols.length >= 3) {
        // Format: NO;NIS;NAMA or NO,NIS,NAMA — col[0] is row number
        nisn = cols[1] ?? "";
        full_name = cols[2] ?? "";
      } else {
        // Format: NIS;NAMA or NIS,NAMA
        nisn = cols[0] ?? "";
        full_name = cols[1] ?? "";
      }

      // Skip header rows (any column that looks like a label, not a number)
      if (/^(no\.?|nisn|nis|nomor|nama)/i.test(nisn) || /^(no\.?|nisn|nis|nomor|nama)/i.test(cols[0])) continue;

      if (nisn || full_name) rows.push({ nisn, full_name });
    }
    return rows;
  }

  const csvPreview = parseCsv(csvText);

  async function handleImport() {
    if (!importClass || csvPreview.length === 0) return;
    setImporting(true);
    setImportResults(null);
    try {
      const res = await fetch("/api/moderator/import-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: csvPreview, class_name: importClass }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal import"); return; }
      setImportResults(data.results);
      const ok = data.results.filter((r: ImportResult) => r.status === "ok").length;
      if (ok > 0) {
        toast.success(`${ok} siswa berhasil diimport.`);
        startTransition(() => router.refresh());
      }
    } catch {
      toast.error("Terjadi kesalahan saat import.");
    } finally {
      setImporting(false);
    }
  }

  // Delete user state
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/moderator/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menghapus"); return; }
      toast.success(`Akun ${deleteTarget.display_name ?? deleteTarget.email} berhasil dihapus.`);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setDeleting(false);
    }
  }

  function handleCloseImport() {
    setShowImport(false);
    setImportClass("");
    setCsvText("");
    setImportResults(null);
  }

  const siswaList = users.filter((u) => u.role === "siswa");
  const classStats = classNames.map((c) => ({
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

  const handleCreateModerator = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleCreateStudent = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleCreateClass = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newClassName.trim();
    if (!name) return;
    setClassSaving(true);
    try {
      const res = await fetch("/api/moderator/create-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menambah kelas.");
        return;
      }
      toast.success(`Kelas "${name}" ditambahkan.`);
      setNewClassName("");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setClassSaving(false);
    }
  };

  const handleRenameClass = async (id: string) => {
    const name = editingClassName.trim();
    if (!name) return;
    setClassSaving(true);
    try {
      const res = await fetch("/api/moderator/update-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengubah kelas.");
        return;
      }
      toast.success("Nama kelas diperbarui.");
      setEditingClassId(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setClassSaving(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    setClassSaving(true);
    try {
      const res = await fetch("/api/moderator/delete-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus kelas.");
        return;
      }
      toast.success("Kelas dihapus. Siswa terkait menjadi tanpa kelas.");
      setConfirmDeleteClassId(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setClassSaving(false);
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
          <Button variant="outline" onClick={() => setShowClasses(true)}>
            <School className="mr-2 h-4 w-4" />
            Kelola Kelas
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
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
          {classNames.map((c) => (
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
                        <div className="flex items-center gap-1">
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
                          {u.id !== currentUserId && u.role !== "moderator" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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
                {classNames.map((c) => (
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

      {/* Delete user dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Akun Siswa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Akun{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.display_name ?? deleteTarget?.email}
              </span>{" "}
              {deleteTarget?.nisn && <span>(NISN: {deleteTarget.nisn}) </span>}
              akan dihapus permanen beserta seluruh data latihannya. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Permanen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV dialog */}
      <Dialog open={showImport} onOpenChange={(o) => { if (!o) handleCloseImport(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Siswa dari CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">

            {/* Class selector */}
            <div className="space-y-1.5">
              <Label htmlFor="import-class">Kelas Tujuan</Label>
              <select
                id="import-class"
                value={importClass}
                onChange={(e) => setImportClass(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— Pilih Kelas —</option>
                {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* CSV input */}
            <div className="space-y-1.5">
              <Label htmlFor="csv-text">
                Tempel isi CSV{" "}
                <span className="text-muted-foreground font-normal">(format: nisn,nama lengkap)</span>
              </Label>
              <textarea
                id="csv-text"
                value={csvText}
                onChange={(e) => { setCsvText(e.target.value); setImportResults(null); }}
                placeholder={"0099887766,Ahmad Rizki\n0011223344,Siti Nurhaliza"}
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-xs placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Baris pertama bisa berupa header (nisn,nama) — akan dilewati otomatis.
              </p>
            </div>

            {/* Preview table */}
            {csvPreview.length > 0 && !importResults && (
              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                  Preview — {csvPreview.length} siswa
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <tbody>
                      {csvPreview.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-1.5 font-mono text-muted-foreground w-32">{row.nisn || <span className="text-destructive">kosong</span>}</td>
                          <td className="px-3 py-1.5">{row.full_name || <span className="text-destructive">kosong</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 50 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">...dan {csvPreview.length - 50} baris lainnya</p>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {importResults && (
              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 text-xs font-medium border-b flex gap-3">
                  <span className="text-emerald-600">✓ {importResults.filter((r) => r.status === "ok").length} berhasil</span>
                  <span className="text-amber-600">↷ {importResults.filter((r) => r.status === "skip").length} dilewati</span>
                  <span className="text-destructive">✗ {importResults.filter((r) => r.status === "error").length} gagal</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <tbody>
                      {importResults.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-1.5 w-6 text-center">
                            {r.status === "ok" ? "✓" : r.status === "skip" ? "↷" : "✗"}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-muted-foreground w-32">{r.nisn}</td>
                          <td className="px-3 py-1.5">{r.name}</td>
                          <td className={`px-3 py-1.5 ${r.status === "error" ? "text-destructive" : r.status === "skip" ? "text-amber-600" : "text-emerald-600"}`}>
                            {r.message ?? (r.status === "ok" ? "OK" : "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseImport}>
                {importResults ? "Tutup" : "Batal"}
              </Button>
              {!importResults && (
                <Button
                  onClick={handleImport}
                  disabled={importing || !importClass || csvPreview.length === 0}
                >
                  {importing
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimport...</>
                    : <><Upload className="mr-2 h-4 w-4" />Import {csvPreview.length > 0 ? `${csvPreview.length} Siswa` : ""}</>
                  }
                </Button>
              )}
            </div>
          </div>
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
                {classNames.map((c) => (
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
      {/* Kelola kelas dialog */}
      <Dialog
        open={showClasses}
        onOpenChange={(o) => {
          if (!o) {
            setShowClasses(false);
            setEditingClassId(null);
            setConfirmDeleteClassId(null);
            setNewClassName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kelola Kelas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <form onSubmit={handleCreateClass} className="flex gap-2">
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Nama kelas baru (mis. X TJKT 3)"
              />
              <Button
                type="submit"
                disabled={classSaving || !newClassName.trim()}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah
              </Button>
            </form>

            <div className="max-h-72 divide-y overflow-y-auto rounded-md border">
              {classes.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Belum ada kelas. Tambahkan lewat form di atas.
                </p>
              ) : (
                classes.map((c) => {
                  const count = siswaList.filter(
                    (u) => u.class_name === c.name,
                  ).length;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      {editingClassId === c.id ? (
                        <>
                          <Input
                            value={editingClassName}
                            onChange={(e) => setEditingClassName(e.target.value)}
                            className="h-8 flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleRenameClass(c.id)}
                            disabled={classSaving || !editingClassName.trim()}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingClassId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : confirmDeleteClassId === c.id ? (
                        <>
                          <span className="flex-1 text-sm">
                            Hapus <b>{c.name}</b>? {count} siswa jadi tanpa kelas.
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClass(c.id)}
                            disabled={classSaving}
                          >
                            Hapus
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteClassId(null)}
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {c.name}
                          </span>
                          <Badge variant="secondary">{count} siswa</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingClassId(c.id);
                              setEditingClassName(c.name);
                              setConfirmDeleteClassId(null);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              setConfirmDeleteClassId(c.id);
                              setEditingClassId(null);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
