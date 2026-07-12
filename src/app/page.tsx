"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Brain,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Download,
  Network,
  Binary,
  Swords,
  Sparkles,
  LogIn,
} from "lucide-react";
import { BG, CHAR } from "@/lib/assets";

const MODULES = [
  {
    title: "Modul Hibah Penelitian",
    description: "Modul pembelajaran Computational Thinking untuk siswa SMK.",
    file: "/files/Modul Hibah Penelitian.pdf",
  },
];

const WORLDS = [
  {
    icon: Network,
    name: "Lembah Dekomposisi",
    tag: "Level 1",
    desc: "Pecah masalah besar jadi langkah-langkah kecil, lalu kelompokkan ke tahap yang tepat.",
    img: BG.lembah,
    accent: "from-indigo-500 to-purple-600",
  },
  {
    icon: Binary,
    name: "Menara Logika Boolean",
    tag: "Level 2",
    desc: "Kuasai aturan AND, OR, NOT lewat tabel kebenaran — Benar (B) & Salah (S).",
    img: BG.menara,
    accent: "from-teal-500 to-cyan-600",
  },
  {
    icon: Swords,
    name: "Arena Pertempuran",
    tag: "Level 3",
    desc: "Adu cepat & tepat lawan teman dalam kuis multiplayer 10 soal. Siapa tercepat, menang!",
    img: BG.arena,
    accent: "from-rose-500 to-pink-600",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Adaptif (RL)",
    desc: "Agen Reinforcement Learning mempelajari kemampuanmu dan mengatur tingkat kesulitan soal secara otomatis — tidak terlalu mudah, tidak terlalu sulit.",
  },
  {
    icon: Lightbulb,
    title: "Interaktif",
    desc: "Puzzle visual, drag-and-drop, dan alur cerita bersama Sang Kompil yang bikin belajar terasa seperti bermain game.",
  },
  {
    icon: TrendingUp,
    title: "Transparan",
    desc: "Lihat bagaimana AI belajar. Dashboard menampilkan progress skill dan insight secara real-time.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Pilih Modul",
    desc: "Buka peta dunia Logikalia dan pilih babak petualanganmu.",
  },
  {
    n: 2,
    title: "Selesaikan Puzzle",
    desc: "Kerjakan soal yang otomatis menyesuaikan kemampuanmu berkat AI adaptif.",
  },
  {
    n: 3,
    title: "Pantau Progress",
    desc: "Lihat perkembangan skill di tiap modul dan naik peringkat di leaderboard.",
  },
  {
    n: 4,
    title: "Tantang Sesama",
    desc: "Tuntaskan latihan untuk membuka Arena Multiplayer dan adu kemampuan langsung.",
  },
];

const SPONSORS = [
  {
    src: "/images/kemdikbud.webp",
    alt: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
  },
  { src: "/images/diktisaintek.webp", alt: "DIKTISAINTEK" },
  { src: "/images/bima.webp", alt: "BIMA" },
  { src: "/images/uniba.webp", alt: "Universitas Bina Bangsa" },
  { src: "/images/unbaja.webp", alt: "Universitas Banten Jaya" },
  { src: "/images/smk.webp", alt: "SMK PGRI 3" },
];

const NAV_ITEMS = [
  { id: "home", label: "Beranda", href: "#home" },
  { id: "worlds", label: "Petualangan", href: "#worlds" },
  { id: "features", label: "Fitur", href: "#features" },
  { id: "steps", label: "Cara Main", href: "#steps" },
  { id: "module", label: "Modul", href: "#module" },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [showNav, setShowNav] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setShowNav(offset > 24);

      const sections = [
        "home",
        "worlds",
        "features",
        "steps",
        "module",
        "cta",
      ] as const;
      const current = sections.find((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 180 && rect.bottom > 180;
      });

      setActiveSection(current ?? "home");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    const targetId = href.replace("#", "");
    const target = document.getElementById(targetId);
    if (!target) return;

    const offset = 96;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
    setActiveSection(targetId);
    window.history.pushState(null, "", href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <motion.header
        initial={false}
        animate={showNav ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-slate-950/95 shadow-lg shadow-slate-950/20 backdrop-blur-md ${
          showNav ? "pointer-events-auto shadow-xl" : "pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link href="#home" className="flex items-center">
            <Image
              src="/images/codequest.webp"
              alt="CodeQuest"
              width={180}
              height={44}
              style={{ height: "44px", width: "auto" }}
              unoptimized
              loading="eager"
            />
          </Link>

          <div
            className={`flex items-center gap-3 text-sm font-medium transition-opacity duration-200 md:gap-6 ${
              showNav ? "opacity-100" : "opacity-0"
            }`}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`transition-colors text-[11px] sm:text-sm ${
                  activeSection === item.id
                    ? "text-amber-300"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Masuk
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section
        id="home"
        className="relative isolate min-h-screen overflow-hidden scroll-mt-24"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${BG.hero}')` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/65 to-background" />

        <div className="relative flex min-h-screen max-w-6xl mx-auto items-center px-4 sm:px-6 lg:px-8 pt-20 pb-10 sm:pb-16 lg:py-32">
          <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 md:items-center md:gap-8">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.span
                variants={reveal}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Petualangan belajar berbasis AI
              </motion.span>

              <motion.h1
                variants={reveal}
                className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg"
              >
                Selamatkan <span className="text-amber-300">Logikalia</span>{" "}
                dengan Kekuatan Logika
              </motion.h1>

              <motion.p
                variants={reveal}
                className="mt-5 text-lg text-white/85 leading-relaxed max-w-lg"
              >
                Dunia Logikalia diserang{" "}
                <strong className="text-rose-300">The Glitch</strong>. Pecahkan
                puzzle, kuasai logika, dan pulihkan setiap wilayah — dengan
                tingkat kesulitan yang menyesuaikan kemampuanmu.
              </motion.p>

              <motion.div
                variants={reveal}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/world-map">
                  <Button size="lg" className="w-full sm:w-auto">
                    Mulai Petualangan <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Zap className="mr-2 w-4 h-4" />
                    Masuk Akun
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Karakter */}
            <div className="relative order-first mt-2 flex min-h-[15rem] items-center justify-center gap-3 sm:gap-6 md:order-none md:mt-0 md:block md:h-80">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative md:absolute md:bottom-0 md:right-6"
              >
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={CHAR.kompil}
                    alt="Sang Kompil"
                    width={360}
                    height={460}
                    unoptimized
                    className="h-[14rem] w-auto drop-shadow-2xl sm:h-[18rem] md:h-[28rem]"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative md:absolute md:bottom-4 md:left-0"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={CHAR.glitch}
                    alt="The Glitch"
                    width={260}
                    height={320}
                    unoptimized
                    className="h-[10rem] w-auto drop-shadow-2xl sm:h-[12rem] md:h-[20rem]"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Dunia Petualangan */}
      <section
        id="worlds"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full scroll-mt-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Tiga Babak Petualangan
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Setiap wilayah Logikalia mengajarkan satu konsep berpikir
            komputasional. Pulihkan satu per satu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {WORLDS.map((w, i) => {
            const Icon = w.icon;
            return (
              <motion.div
                key={w.name}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${w.img}')` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 rounded-full bg-linear-to-r ${w.accent} px-2.5 py-0.5 text-xs font-semibold text-white shadow`}
                  >
                    {w.tag}
                  </span>
                  <div
                    className={`absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${w.accent} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="bg-card p-5">
                  <h3 className="text-lg font-bold">{w.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {w.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Fitur */}
      <section
        id="features"
        className="relative border-y border-border bg-muted/30 overflow-hidden scroll-mt-24"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06]"
          style={{ backgroundImage: `url('${BG.pattern}')` }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="mb-5 flex justify-center">
              <Image
                src="/images/codequest.webp"
                alt="CodeQuest"
                width={220}
                height={56}
                unoptimized
                className="h-12 w-auto sm:h-14 md:h-16"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Kenapa Code Quest?
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={reveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  className="flex flex-col items-center text-center rounded-2xl border bg-card/60 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section
        id="steps"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full scroll-mt-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          Cara Bermain
        </h2>
        <div className="grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg">
                {s.n}
              </div>
              <h4 className="font-semibold mb-2">{s.title}</h4>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Glitch — story hook */}
      <section className="border-y border-border bg-slate-950 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={CHAR.glitch}
                  alt="The Glitch"
                  width={200}
                  height={240}
                  unoptimized
                  className="drop-shadow-2xl"
                  style={{ height: "13rem", width: "auto" }}
                />
              </motion.div>
            </motion.div>
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300">
                Musuh Utama
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold">
                Hadapi <span className="text-rose-400">The Glitch</span>
              </h2>
              <p className="mt-4 text-white/75 leading-relaxed max-w-2xl">
                Entitas kekacauan yang membuat proses jadi berantakan dan aturan
                benar-salah jadi kabur. Setiap puzzle yang kamu pecahkan
                memulihkan sedikit demi sedikit dunia Logikalia — sampai kalian
                menghadapinya bersama di Arena.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modul Pembelajaran */}
      <section
        id="module"
        className="border-b border-border bg-primary/5 scroll-mt-24"
      >
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
              <motion.div
                key={mod.file}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — gambar tampil penuh (aspek asli, tanpa crop) untuk efek dramatis */}
      <section id="cta" className="relative isolate scroll-mt-24">
        <Image
          src={BG.cta}
          alt=""
          width={1376}
          height={768}
          unoptimized
          className="h-auto w-full"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/45 to-slate-950/25" />
        <div className="absolute inset-0 flex items-end justify-center p-4 pb-8 sm:items-center sm:pb-4">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-center"
          >
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/codequest.webp"
                alt="CodeQuest"
                width={280}
                height={72}
                unoptimized
                className="h-12 w-auto sm:h-14 md:h-20"
              />
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-6xl lg:text-7xl">
              Siap Memulai Petualangan?
            </h2>
            <p className="mt-2 text-sm text-white/85 drop-shadow sm:mt-4 sm:text-lg">
              Masuk dan mulai memulihkan Logikalia hari ini.
            </p>
            <div className="mt-4 flex flex-row flex-wrap justify-center gap-3 sm:mt-8">
              <Link href="/world-map">
                <Button size="lg">
                  Mulai Petualangan <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <LogIn className="mr-2 w-4 h-4" />
                  Masuk
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-wider">
            Didukung oleh
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
            {SPONSORS.map((s) => (
              <Image
                key={s.src}
                src={s.src}
                alt={s.alt}
                width={160}
                height={52}
                style={{ height: "52px", width: "auto" }}
                unoptimized
                className="opacity-80 transition-opacity hover:opacity-100"
              />
            ))}
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
