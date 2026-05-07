INSERT INTO public.puzzles (
  id,
  module_id,
  type,
  difficulty,
  variation_type,
  title,
  context,
  goal,
  content,
  expected_time_sec,
  concepts_tested
)
VALUES
(
  'M2-D1-001',
  'M2',
  'decomposition_sort',
  1,
  'A',
  'Bikin Nasi Goreng',
  'Persiapan, Memasak, dan Penyajian',
  'Susun langkah-langkah membuat nasi goreng ke kategori yang tepat',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "prep", "label": "Persiapan", "color": "blue"},
      {"id": "cook", "label": "Memasak", "color": "orange"},
      {"id": "serve", "label": "Penyajian", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Iris bawang merah"},
      {"id": "t2", "label": "Tumis bumbu hingga harum"},
      {"id": "t3", "label": "Tata di piring"},
      {"id": "t4", "label": "Cuci beras"},
      {"id": "t5", "label": "Goreng nasi dengan bumbu"}
    ],
    "correct_mapping": {
      "t1": "prep",
      "t2": "cook",
      "t3": "serve",
      "t4": "prep",
      "t5": "cook"
    }
  }'::jsonb,
  60,
  ARRAY['decomposition', 'categorization']
),
(
  'M2-D1-002',
  'M2',
  'decomposition_sort',
  1,
  'B',
  'Cuci Baju ke Laundry',
  'Persiapan, Proses, Penyelesaian',
  'Kelompokkan kegiatan cuci baju ke laundry',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "prep", "label": "Persiapan", "color": "blue"},
      {"id": "process", "label": "Proses Cuci", "color": "orange"},
      {"id": "done", "label": "Selesai", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Pisahkan baju putih dan warna"},
      {"id": "t2", "label": "Masukkan deterjen"},
      {"id": "t3", "label": "Masukkan baju ke mesin"},
      {"id": "t4", "label": "Jemur baju"},
      {"id": "t5", "label": "Setrika dan lipat"}
    ],
    "correct_mapping": {
      "t1": "prep",
      "t2": "process",
      "t3": "process",
      "t4": "done",
      "t5": "done"
    }
  }'::jsonb,
  60,
  ARRAY['decomposition', 'categorization']
),
(
  'M2-D2-001',
  'M2',
  'decomposition_sort',
  2,
  'A',
  'Buka Warnet Baru',
  'Modal awal, Operasional, Promosi',
  'Atur kegiatan untuk buka warnet baru ke kategori yang tepat',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "capital", "label": "Modal Awal", "color": "blue"},
      {"id": "ops", "label": "Operasional", "color": "orange"},
      {"id": "promo", "label": "Promosi", "color": "purple"}
    ],
    "tasks": [
      {"id": "t1", "label": "Beli komputer 10 unit"},
      {"id": "t2", "label": "Bayar listrik bulanan"},
      {"id": "t3", "label": "Buat brosur"},
      {"id": "t4", "label": "Sewa ruko"},
      {"id": "t5", "label": "Posting di Instagram"},
      {"id": "t6", "label": "Atur jadwal operator"},
      {"id": "t7", "label": "Beli software"}
    ],
    "correct_mapping": {
      "t1": "capital",
      "t2": "ops",
      "t3": "promo",
      "t4": "capital",
      "t5": "promo",
      "t6": "ops",
      "t7": "capital"
    }
  }'::jsonb,
  90,
  ARRAY['decomposition', 'categorization', 'business_context']
),
(
  'M2-D2-002',
  'M2',
  'decomposition_sort',
  2,
  'B',
  'Bikin Acara 17 Agustus di Sekolah',
  'Persiapan, Pelaksanaan, Setelah Acara',
  'Pecah kegiatan persiapan 17an ke fase yang tepat',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "prep", "label": "Persiapan", "color": "blue"},
      {"id": "exec", "label": "Pelaksanaan", "color": "orange"},
      {"id": "after", "label": "Setelah Acara", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Bentuk panitia"},
      {"id": "t2", "label": "Beli hadiah lomba"},
      {"id": "t3", "label": "Mulai lomba balap karung"},
      {"id": "t4", "label": "Bersihkan lapangan"},
      {"id": "t5", "label": "Bagikan hadiah"},
      {"id": "t6", "label": "Buat proposal kegiatan"},
      {"id": "t7", "label": "Evaluasi kegiatan"}
    ],
    "correct_mapping": {
      "t1": "prep",
      "t2": "prep",
      "t3": "exec",
      "t4": "after",
      "t5": "exec",
      "t6": "prep",
      "t7": "after"
    }
  }'::jsonb,
  90,
  ARRAY['decomposition', 'categorization']
),
(
  'M2-D3-001',
  'M2',
  'decomposition_sort',
  3,
  'A',
  'Rilis Toko Online',
  'Perencanaan, Pengembangan, Operasional',
  'Kelompokkan aktivitas rilis toko online ke tahap yang tepat',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "plan", "label": "Perencanaan", "color": "blue"},
      {"id": "build", "label": "Pengembangan", "color": "purple"},
      {"id": "ops", "label": "Operasional", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Riset produk terlaris"},
      {"id": "t2", "label": "Desain halaman checkout"},
      {"id": "t3", "label": "Integrasi payment gateway"},
      {"id": "t4", "label": "Atur stok gudang"},
      {"id": "t5", "label": "Tentukan ongkir"},
      {"id": "t6", "label": "Setup CS chat"},
      {"id": "t7", "label": "Uji alur pembelian"},
      {"id": "t8", "label": "Buat promo launching"},
      {"id": "t9", "label": "Pantau pesanan harian"}
    ],
    "correct_mapping": {
      "t1": "plan",
      "t2": "build",
      "t3": "build",
      "t4": "ops",
      "t5": "plan",
      "t6": "ops",
      "t7": "build",
      "t8": "plan",
      "t9": "ops"
    }
  }'::jsonb,
  110,
  ARRAY['decomposition', 'categorization', 'digital_business']
),
(
  'M2-D3-002',
  'M2',
  'decomposition_sort',
  3,
  'B',
  'Produksi Video Konten',
  'Pra Produksi, Produksi, Pasca Produksi',
  'Susun tahapan pembuatan video konten ke fase yang benar',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "pre", "label": "Pra Produksi", "color": "blue"},
      {"id": "prod", "label": "Produksi", "color": "orange"},
      {"id": "post", "label": "Pasca Produksi", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Buat script"},
      {"id": "t2", "label": "Siapkan lighting"},
      {"id": "t3", "label": "Rekam footage"},
      {"id": "t4", "label": "Edit video"},
      {"id": "t5", "label": "Buat thumbnail"},
      {"id": "t6", "label": "Pilih lokasi shooting"},
      {"id": "t7", "label": "Record voice over"},
      {"id": "t8", "label": "Color grading"},
      {"id": "t9", "label": "Upload ke platform"}
    ],
    "correct_mapping": {
      "t1": "pre",
      "t2": "pre",
      "t3": "prod",
      "t4": "post",
      "t5": "post",
      "t6": "pre",
      "t7": "prod",
      "t8": "post",
      "t9": "post"
    }
  }'::jsonb,
  110,
  ARRAY['decomposition', 'categorization', 'media_production']
),
(
  'M2-D4-001',
  'M2',
  'decomposition_sort',
  4,
  'A',
  'Membangun Lab Komputer Sekolah',
  'Perencanaan, Implementasi, Pemeliharaan',
  'Klasifikasikan tugas pembangunan lab komputer',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "plan", "label": "Perencanaan", "color": "blue"},
      {"id": "impl", "label": "Implementasi", "color": "purple"},
      {"id": "maint", "label": "Pemeliharaan", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Hitung kebutuhan perangkat"},
      {"id": "t2", "label": "Buat topologi jaringan"},
      {"id": "t3", "label": "Instal OS pada semua PC"},
      {"id": "t4", "label": "Konfigurasi user account"},
      {"id": "t5", "label": "Buat SOP penggunaan"},
      {"id": "t6", "label": "Jadwalkan backup data"},
      {"id": "t7", "label": "Cek suhu ruangan berkala"},
      {"id": "t8", "label": "Buat jadwal maintenance"},
      {"id": "t9", "label": "Monitoring performa jaringan"}
    ],
    "correct_mapping": {
      "t1": "plan",
      "t2": "plan",
      "t3": "impl",
      "t4": "impl",
      "t5": "impl",
      "t6": "maint",
      "t7": "maint",
      "t8": "maint",
      "t9": "maint"
    }
  }'::jsonb,
  130,
  ARRAY['decomposition', 'categorization', 'infrastructure']
),
(
  'M2-D4-002',
  'M2',
  'decomposition_sort',
  4,
  'B',
  'Pengembangan Aplikasi Sekolah',
  'Analisis, Development, Deployment',
  'Pisahkan aktivitas pengembangan aplikasi ke fase yang benar',
  '{
    "type": "decomposition_sort",
    "categories": [
      {"id": "analysis", "label": "Analisis", "color": "blue"},
      {"id": "dev", "label": "Development", "color": "orange"},
      {"id": "deploy", "label": "Deployment", "color": "green"}
    ],
    "tasks": [
      {"id": "t1", "label": "Wawancara guru dan siswa"},
      {"id": "t2", "label": "Definisikan user story"},
      {"id": "t3", "label": "Implementasi autentikasi"},
      {"id": "t4", "label": "Buat database schema"},
      {"id": "t5", "label": "UAT bersama pengguna"},
      {"id": "t6", "label": "Deploy ke server"},
      {"id": "t7", "label": "Monitoring error log"},
      {"id": "t8", "label": "Setup backup database"},
      {"id": "t9", "label": "Rilis panduan pengguna"}
    ],
    "correct_mapping": {
      "t1": "analysis",
      "t2": "analysis",
      "t3": "dev",
      "t4": "dev",
      "t5": "deploy",
      "t6": "deploy",
      "t7": "deploy",
      "t8": "deploy",
      "t9": "deploy"
    }
  }'::jsonb,
  130,
  ARRAY['decomposition', 'categorization', 'software_engineering']
)
ON CONFLICT (id) DO NOTHING;
