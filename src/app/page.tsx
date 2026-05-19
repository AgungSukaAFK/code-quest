import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Brain,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Target,
  BookOpen,
  Download,
} from "lucide-react";

const MODULES = [
  {
    title: "Modul Hibah Penelitian",
    description: "Modul pembelajaran Computational Thinking untuk siswa SMK.",
    file: "/files/Modul Hibah Penelitian.pdf",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Image
            src="/images/codequest.webp"
            alt="CodeQuest"
            width={200}
            height={48}
            style={{ height: "48px", width: "auto" }}
            unoptimized
            loading="eager"
          />
          <Link href="/login">
            <Button variant="outline" size="sm">
              Masuk
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Belajar Logika dengan{" "}
            <span className="text-primary">Petualangan</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Platform pembelajaran adaptif yang menyesuaikan tingkat kesulitan
            berdasarkan kemampuanmu. Selesaikan puzzle, kuasai logika, dan naik
            level.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/world-map">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Petualangan <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>

            <Link href="/play/M1?demo=true">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Zap className="mr-2 w-4 h-4" />
                Lihat Demo
              </Button>
            </Link>
          </div>

          {/* Subtext */}
          <p className="text-sm text-muted-foreground">
            Akun demo tersedia. Tidak perlu registrasi untuk mencoba.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 pt-16 border-t border-border">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Adaptif</h3>
            <p className="text-muted-foreground text-sm">
              AI mempelajari gaya belajarmu dan menyesuaikan difficulty setiap
              saat.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Interaktif</h3>
            <p className="text-muted-foreground text-sm">
              Puzzle visual dan drag-drop yang membuat belajar jadi fun dan
              mudah diingat.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Transparan</h3>
            <p className="text-muted-foreground text-sm">
              Lihat bagaimana AI belajar. Dashboard menampilkan progress dan
              insights real-time.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cara Kerjanya
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Pilih Modul</h4>
              <p className="text-sm text-muted-foreground">
                Pilih modul di peta dunia — Dekomposisi, Logika Boolean, dan
                lainnya.
              </p>
            </div>

            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Selesaikan Puzzle</h4>
              <p className="text-sm text-muted-foreground">
                Kerjakan puzzle yang otomatis disesuaikan dengan kemampuanmu
                oleh sistem AI.
              </p>
            </div>

            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Pantau Progress</h4>
              <p className="text-sm text-muted-foreground">
                Lihat perkembangan skill kamu di setiap modul dan bandingkan
                dengan teman di leaderboard.
              </p>
            </div>

            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Tantang Sesama</h4>
              <p className="text-sm text-muted-foreground">
                Selesaikan semua quiz untuk membuka mode{" "}
                <span className="font-medium text-foreground">Multiplayer</span>{" "}
                — adu kemampuan langsung dengan pemain lain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modul Pembelajaran */}
      <section className="border-t border-border bg-primary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/15 rounded-2xl mb-5">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Modul Pembelajaran
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Materi pendukung yang bisa kamu baca atau unduh untuk memperkuat
              pemahaman.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {MODULES.map((mod) => (
              <div
                key={mod.file}
                className="w-full max-w-md border border-primary/20 rounded-2xl p-7 bg-card shadow-sm flex flex-col gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-snug mb-1">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={mod.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="lg" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Buka Modul
                    </Button>
                  </a>
                  <a href={mod.file} download className="flex-1">
                    <Button size="lg" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Unduh
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Memulai?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Coba demo tanpa registrasi atau buat akun untuk progress
            berkelanjutan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/play/M1?demo=true">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Zap className="mr-2 w-4 h-4" />
                Demo Langsung
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <Target className="mr-2 w-4 h-4" />
                Buat Akun
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-xs text-muted-foreground mb-5 uppercase tracking-wider">
            Didukung oleh
          </p>
          <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
            <Image
              src="/images/kemdikbud.webp"
              alt="Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/diktisaintek.webp"
              alt="DIKTISAINTEK"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/bima.webp"
              alt="BIMA"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/uniba.webp"
              alt="Universitas Bina Bangsa"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/unbaja.webp"
              alt="Universitas Banten Jaya"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
            <Image
              src="/images/smk.webp"
              alt="SMK PGRI 3"
              width={180}
              height={56}
              style={{ height: "56px", width: "auto" }}
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>
            CodeQuest © 2026 • Platform pembelajaran adaptif berbasis AI untuk
            SMK
          </p>
        </div>
      </footer>
    </div>
  );
}
