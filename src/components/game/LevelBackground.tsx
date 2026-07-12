// Lapisan background level: gambar full-screen + overlay tipis adaptif tema
// supaya kartu/teks di atasnya tetap terbaca. Konten harus dibungkus wrapper
// ber-`relative z-10` agar tampil di atas lapisan ini.

export function LevelBackground({ src }: { src: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${src}')` }}
      />
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}
