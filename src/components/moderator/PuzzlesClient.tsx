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
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { ManagedPuzzle, ModuleOption } from "@/app/(moderator)/moderator/puzzles/page";
import { ModeratorNav } from "./ModeratorNav";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Sangat Mudah",
  2: "Mudah",
  3: "Sedang",
  4: "Sulit",
  5: "Sangat Sulit",
};

const DIFFICULTY_COLOR: Record<number, string> = {
  1: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  2: "bg-green-500/15 text-green-600 dark:text-green-400",
  3: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  4: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  5: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const BLANK_FORM = {
  id: "",
  module_id: "",
  type: "truth_table",
  difficulty: "1",
  title: "",
  goal: "",
  expected_time_sec: "60",
  content: "",
};

interface PuzzlesClientProps {
  puzzles: ManagedPuzzle[];
  modules: ModuleOption[];
}

export function PuzzlesClient({ puzzles, modules }: PuzzlesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("__all__");
  const [diffFilter, setDiffFilter] = useState("__all__");

  const [form, setForm] = useState(BLANK_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ManagedPuzzle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = puzzles.filter((p) => {
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "__all__" || p.module_id === moduleFilter;
    const matchDiff = diffFilter === "__all__" || String(p.difficulty) === diffFilter;
    return matchSearch && matchModule && matchDiff;
  });

  const openAdd = () => {
    setForm({ ...BLANK_FORM, module_id: modules[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (p: ManagedPuzzle) => {
    setForm({
      id: p.id,
      module_id: p.module_id,
      type: p.type,
      difficulty: String(p.difficulty),
      title: p.title,
      goal: p.goal ?? "",
      expected_time_sec: String(p.expected_time_sec ?? 60),
      content: JSON.stringify(p.content, null, 2),
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/moderator/upsert-puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan.");
      }
      toast.success(form.id ? "Soal berhasil diperbarui." : "Soal berhasil ditambahkan.");
      setShowForm(false);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/moderator/delete-puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleId: deleteTarget.id }),
      });
      if (!res.ok) throw new Error("Gagal menghapus.");
      toast.success("Soal berhasil dihapus.");
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Gagal menghapus soal.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <ModeratorNav active="puzzles" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Soal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {puzzles.length} soal terdaftar
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Soal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau ID soal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="__all__">Semua Modul</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="__all__">Semua Difficulty</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={String(d)}>{d} – {DIFFICULTY_LABEL[d]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Judul</th>
                  <th className="px-4 py-3 text-left font-medium">Modul</th>
                  <th className="px-4 py-3 text-left font-medium">Tipe</th>
                  <th className="px-4 py-3 text-left font-medium">Difficulty</th>
                  <th className="px-4 py-3 text-left font-medium">Waktu</th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <p className="text-3xl mb-2">📭</p>
                      Tidak ada soal ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{p.module_id}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {p.type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[p.difficulty] ?? ""}`}>
                          {p.difficulty} – {DIFFICULTY_LABEL[p.difficulty]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {p.expected_time_sec ? `${p.expected_time_sec}s` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
              Menampilkan {filtered.length} dari {puzzles.length} soal
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) setShowForm(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Modul</Label>
                <select
                  value={form.module_id}
                  onChange={(e) => setForm((f) => ({ ...f, module_id: e.target.value }))}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipe</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="truth_table">truth_table</option>
                  <option value="decomposition_sort">decomposition_sort</option>
                  <option value="decomposition_order">decomposition_order</option>
                  <option value="circuit_eval">circuit_eval</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Difficulty (1–5)</Label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={String(d)}>{d} – {DIFFICULTY_LABEL[d]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Waktu (detik)</Label>
                <Input
                  type="number"
                  min={10}
                  value={form.expected_time_sec}
                  onChange={(e) => setForm((f) => ({ ...f, expected_time_sec: e.target.value }))}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Judul soal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tujuan / Instruksi</Label>
              <Input
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                placeholder="Instruksi untuk siswa..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Content (JSON)</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
                required
                placeholder='{"expression": "P AND Q", "variables": ["P","Q"], "rows": [...]}'
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan JSON sesuai tipe soal. Untuk truth_table: expression, display_expression, variables, rows (inputs + expected_output).
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.id ? "Simpan Perubahan" : "Tambah Soal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Soal?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Soal <span className="font-medium text-foreground">&quot;{deleteTarget?.title}&quot;</span> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
