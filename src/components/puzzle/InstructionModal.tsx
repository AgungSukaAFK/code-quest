"use client";

import { BookOpen, CheckCircle2, GripVertical, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InstructionModalProps {
  open: boolean;
  onClose: () => void;
  puzzleType: "decomposition_sort" | "truth_table";
}

const INSTRUCTIONS = {
  decomposition_sort: {
    Icon: GripVertical,
    title: "Cara Bermain: Dekomposisi Masalah",
    description:
      "Pecah sebuah masalah besar menjadi tugas-tugas kecil, lalu kelompokkan ke kategori yang paling tepat.",
    steps: [
      {
        label: "Baca semua tugas",
        detail: 'Lihat daftar tugas yang tersedia di bagian "Daftar Tugas" di atas.',
      },
      {
        label: "Pilih tugas",
        detail: "Ketuk sebuah tugas untuk memilihnya — akan muncul info tugas yang dipilih.",
      },
      {
        label: "Tempatkan ke kategori",
        detail:
          "Ketuk salah satu kotak kategori untuk menaruh tugas di sana. Bisa juga dengan cara seret (drag) langsung.",
      },
      {
        label: "Kirim jawaban",
        detail: 'Setelah semua tugas ditempatkan, tekan tombol "Kirim Jawaban".',
      },
    ],
    tip: "Gunakan tombol Petunjuk jika bingung — sistem akan memberi clue satu tugas yang salah posisi.",
    color: "blue" as const,
  },
  truth_table: {
    Icon: Table2,
    title: "Cara Bermain: Tabel Kebenaran",
    description:
      "Lengkapi tabel kebenaran berdasarkan ekspresi logika yang diberikan dengan memilih BENAR atau SALAH untuk setiap baris.",
    steps: [
      {
        label: "Perhatikan ekspresi logika",
        detail: "Ekspresi ditampilkan di bagian atas, misalnya P ∧ Q atau P → Q.",
      },
      {
        label: "Baca setiap baris",
        detail: "Tiap baris memiliki kombinasi nilai P dan Q (atau R) yang berbeda-beda.",
      },
      {
        label: "Pilih output",
        detail:
          'Klik tombol "B" jika output baris itu BENAR, atau "S" jika SALAH. Klik lagi untuk membatalkan.',
      },
      {
        label: "Kirim jawaban",
        detail: 'Setelah semua baris terisi, tekan tombol "Submit".',
      },
    ],
    tip: "Gunakan tombol Petunjuk jika bingung — penjelasan cara kerja ekspresi akan ditampilkan selama beberapa detik.",
    color: "purple" as const,
  },
};

export function InstructionModal({ open, onClose, puzzleType }: InstructionModalProps) {
  const content = INSTRUCTIONS[puzzleType];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-semibold">{content.title}</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">{content.description}</p>
        </DialogHeader>

        <ol className="space-y-3">
          {content.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-medium leading-snug">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Tips:</span> {content.tip}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mengerti, Mulai!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
