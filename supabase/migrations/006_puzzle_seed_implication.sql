-- Implication & Biconditional puzzles for module L1 (Logika Boolean)
-- P → Q  ≡  ¬P ∨ Q
-- P ↔ Q  ≡  (P → Q) ∧ (Q → P)

-- ───────────────────────────────────────────────
-- Difficulty 1 – Pengenalan Implikasi dasar (P → Q)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-01',
  'L1',
  'truth_table',
  1,
  'Implikasi Dasar: P → Q',
  'Lengkapi tabel kebenaran untuk operasi implikasi P → Q. Implikasi hanya SALAH ketika premis (P) BENAR dan konklusi (Q) SALAH.',
  '{
    "expression": "P IMPLIES Q",
    "display_expression": "P → Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true,  "Q": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": true}
    ],
    "explanation": "P → Q hanya SALAH jika P=BENAR dan Q=SALAH. Ingat: ''Jika hujan maka basah'' – tidak bisa hujan tapi tidak basah."
  }'::jsonb,
  60,
  ARRAY['implication', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 1 – Negasi Anteseden (¬P → Q)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-02',
  'L1',
  'truth_table',
  1,
  'Implikasi dengan Negasi: ¬P → Q',
  'Lengkapi tabel kebenaran untuk ¬P → Q. Perhatikan bahwa anteseden adalah negasi dari P.',
  '{
    "expression": "(NOT P) IMPLIES Q",
    "display_expression": "¬P → Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true,  "Q": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": false}
    ],
    "explanation": "¬P → Q: ketika P=BENAR maka ¬P=SALAH, dan implikasi dengan anteseden SALAH selalu BENAR."
  }'::jsonb,
  60,
  ARRAY['implication', 'negation', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 2 – Kontraposisi (¬Q → ¬P)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-03',
  'L1',
  'truth_table',
  2,
  'Kontraposisi: ¬Q → ¬P',
  'Lengkapi tabel kebenaran untuk ¬Q → ¬P. Kontraposisi selalu ekivalen dengan implikasi asalnya P → Q.',
  '{
    "expression": "(NOT Q) IMPLIES (NOT P)",
    "display_expression": "¬Q → ¬P",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true,  "Q": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": true}
    ],
    "explanation": "¬Q → ¬P ekivalen dengan P → Q. Hasilnya harus sama persis – ini adalah hukum kontraposisi."
  }'::jsonb,
  75,
  ARRAY['implication', 'contrapositive', 'negation', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 2 – Implikasi dan OR (P → Q ≡ ¬P ∨ Q)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-04',
  'L1',
  'truth_table',
  2,
  'Implikasi sebagai Disjungsi: ¬P ∨ Q',
  'Tunjukkan bahwa P → Q ekivalen dengan ¬P ∨ Q. Lengkapi tabel untuk ekspresi ¬P ∨ Q.',
  '{
    "expression": "(NOT P) OR Q",
    "display_expression": "¬P ∨ Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true,  "Q": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": true}
    ],
    "explanation": "¬P ∨ Q dan P → Q menghasilkan tabel yang identik – ini adalah cara menulis ulang implikasi menggunakan OR dan NOT."
  }'::jsonb,
  75,
  ARRAY['implication', 'disjunction', 'equivalence', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 3 – Bikonditional (P ↔ Q)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-05',
  'L1',
  'truth_table',
  3,
  'Bikonditional: P ↔ Q',
  'Lengkapi tabel kebenaran untuk bikonditional P ↔ Q. Bikonditional BENAR hanya jika kedua sisi bernilai sama.',
  '{
    "expression": "P IFF Q",
    "display_expression": "P ↔ Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true,  "Q": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true},  "expected_output": false},
      {"inputs": {"P": false, "Q": false}, "expected_output": true}
    ],
    "explanation": "P ↔ Q (''P jika dan hanya jika Q'') bernilai BENAR ketika P dan Q sama-sama BENAR atau sama-sama SALAH."
  }'::jsonb,
  90,
  ARRAY['biconditional', 'implication', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 3 – Gabungan Implikasi (P → Q) ∧ R
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-06',
  'L1',
  'truth_table',
  3,
  'Implikasi dan AND: (P → Q) ∧ R',
  'Lengkapi tabel kebenaran untuk ekspresi (P → Q) ∧ R dengan tiga variabel.',
  '{
    "expression": "(P IMPLIES Q) AND R",
    "display_expression": "(P → Q) ∧ R",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true,  "Q": true,  "R": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": true,  "R": false}, "expected_output": false},
      {"inputs": {"P": true,  "Q": false, "R": true},  "expected_output": false},
      {"inputs": {"P": true,  "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true,  "R": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": true,  "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": false}
    ],
    "explanation": "Evaluasi (P → Q) terlebih dahulu, lalu AND-kan hasilnya dengan R. Seluruh ekspresi BENAR hanya jika keduanya BENAR."
  }'::jsonb,
  120,
  ARRAY['implication', 'conjunction', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 4 – Transitivitas Implikasi (P → Q) ∧ (Q → R)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-07',
  'L1',
  'truth_table',
  4,
  'Transitivitas: (P → Q) ∧ (Q → R)',
  'Evaluasi ekspresi (P → Q) ∧ (Q → R). Jika hasilnya BENAR, maka secara logis P → R juga berlaku.',
  '{
    "expression": "(P IMPLIES Q) AND (Q IMPLIES R)",
    "display_expression": "(P → Q) ∧ (Q → R)",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true,  "Q": true,  "R": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": true,  "R": false}, "expected_output": false},
      {"inputs": {"P": true,  "Q": false, "R": true},  "expected_output": false},
      {"inputs": {"P": true,  "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true,  "R": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": true,  "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true},  "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": true}
    ],
    "explanation": "Evaluasi masing-masing implikasi dulu, lalu AND hasilnya. Ini adalah bentuk silogisme hipotetis."
  }'::jsonb,
  150,
  ARRAY['implication', 'transitivity', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- Difficulty 5 – Bikonditional kompleks P ↔ (Q ∨ R)
-- ───────────────────────────────────────────────
INSERT INTO puzzles (id, module_id, type, difficulty, title, goal, content, expected_time_sec, concepts_tested)
VALUES (
  'L1-IMP-08',
  'L1',
  'truth_table',
  5,
  'Bikonditional Kompleks: P ↔ (Q ∨ R)',
  'Lengkapi tabel kebenaran untuk P ↔ (Q ∨ R). Evaluasi bagian dalam kurung terlebih dahulu.',
  '{
    "expression": "P IFF (Q OR R)",
    "display_expression": "P ↔ (Q ∨ R)",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true,  "Q": true,  "R": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": true,  "R": false}, "expected_output": true},
      {"inputs": {"P": true,  "Q": false, "R": true},  "expected_output": true},
      {"inputs": {"P": true,  "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true,  "R": true},  "expected_output": false},
      {"inputs": {"P": false, "Q": true,  "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true},  "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": true}
    ],
    "explanation": "Hitung Q ∨ R dulu. Lalu P ↔ hasil_OR: BENAR jika keduanya sama nilainya."
  }'::jsonb,
  180,
  ARRAY['biconditional', 'implication', 'disjunction', 'boolean_logic']
)
ON CONFLICT (id) DO NOTHING;
