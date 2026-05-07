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
  'L1-T1-001',
  'L1',
  'truth_table',
  1,
  'A',
  'AND Operator',
  NULL,
  'Lengkapi tabel kebenaran untuk operasi AND. Klik sel output untuk toggle T/F.',
  '{
    "expression": "P AND Q",
    "display_expression": "P \u2227 Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true, "Q": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true}, "expected_output": false},
      {"inputs": {"P": false, "Q": false}, "expected_output": false}
    ],
    "explanation": "AND hanya menghasilkan TRUE jika kedua input TRUE."
  }'::jsonb,
  60,
  ARRAY['boolean_logic', 'and']
),
(
  'L1-T1-002',
  'L1',
  'truth_table',
  1,
  'B',
  'OR Operator',
  NULL,
  'Lengkapi tabel kebenaran untuk operasi OR.',
  '{
    "expression": "P OR Q",
    "display_expression": "P \u2228 Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true, "Q": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": false}
    ],
    "explanation": "OR menghasilkan TRUE jika minimal satu input TRUE."
  }'::jsonb,
  60,
  ARRAY['boolean_logic', 'or']
),
(
  'L1-T2-001',
  'L1',
  'truth_table',
  2,
  'A',
  'NOT P',
  NULL,
  'Lengkapi tabel kebenaran untuk negasi.',
  '{
    "expression": "NOT P",
    "display_expression": "\u00acP",
    "variables": ["P"],
    "rows": [
      {"inputs": {"P": true}, "expected_output": false},
      {"inputs": {"P": false}, "expected_output": true}
    ],
    "explanation": "NOT membalik nilai input."
  }'::jsonb,
  45,
  ARRAY['boolean_logic', 'not']
),
(
  'L1-T2-002',
  'L1',
  'truth_table',
  2,
  'B',
  'NOT P AND Q',
  NULL,
  'Lengkapi tabel kebenaran. Ingat NOT diaplikasikan dulu ke P.',
  '{
    "expression": "(NOT P) AND Q",
    "display_expression": "\u00acP \u2227 Q",
    "variables": ["P", "Q"],
    "rows": [
      {"inputs": {"P": true, "Q": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false}, "expected_output": false}
    ],
    "explanation": "NOT P dulu, baru AND dengan Q."
  }'::jsonb,
  90,
  ARRAY['boolean_logic', 'not', 'and']
),
(
  'L1-T3-001',
  'L1',
  'truth_table',
  3,
  'A',
  'P AND (Q OR R)',
  NULL,
  'Tiga variabel dengan parentheses. Evaluasi bagian dalam terlebih dahulu.',
  '{
    "expression": "P AND (Q OR R)",
    "display_expression": "P \u2227 (Q \u2228 R)",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": false},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": false}
    ],
    "explanation": "Parentheses dievaluasi dulu, baru AND dengan P."
  }'::jsonb,
  150,
  ARRAY['boolean_logic', 'and', 'or']
),
(
  'L1-T3-002',
  'L1',
  'truth_table',
  3,
  'B',
  '(P OR Q) AND NOT R',
  NULL,
  'Kombinasi OR, AND, dan NOT. Hati-hati urutannya.',
  '{
    "expression": "(P OR Q) AND (NOT R)",
    "display_expression": "(P \u2228 Q) \u2227 \u00acR",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": false},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": false}
    ],
    "explanation": "Hasil OR di-AND dengan negasi R."
  }'::jsonb,
  180,
  ARRAY['boolean_logic', 'and', 'or', 'not']
),
(
  'L1-T4-001',
  'L1',
  'truth_table',
  4,
  'A',
  'NOT (P AND Q) OR R',
  NULL,
  'Ekspresi De Morgan style. Fokus pada NOT yang mengunci satu kelompok.',
  '{
    "expression": "(NOT (P AND Q)) OR R",
    "display_expression": "\u00ac(P \u2227 Q) \u2228 R",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": true}
    ],
    "explanation": "P AND Q dulu, lalu NOT, baru OR dengan R."
  }'::jsonb,
  210,
  ARRAY['boolean_logic', 'de_morgan']
),
(
  'L1-T4-002',
  'L1',
  'truth_table',
  4,
  'B',
  '(P AND NOT Q) OR (NOT P AND R)',
  NULL,
  'Evaluasi dua kelompok parenthesis terpisah lalu OR-kan hasilnya.',
  '{
    "expression": "(P AND (NOT Q)) OR ((NOT P) AND R)",
    "display_expression": "(P \u2227 \u00acQ) \u2228 (\u00acP \u2227 R)",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": false}
    ],
    "explanation": "Dua kondisi alternatif: P tanpa Q, atau bukan-P dengan R."
  }'::jsonb,
  240,
  ARRAY['boolean_logic', 'compound_expression']
),
(
  'L1-T5-001',
  'L1',
  'truth_table',
  5,
  'A',
  'NOT ((P OR Q) AND (NOT R OR P))',
  NULL,
  'Ekspresi 3 layer. Selesaikan level terdalam sebelum negasi luar.',
  '{
    "expression": "NOT ((P OR Q) AND ((NOT R) OR P))",
    "display_expression": "\u00ac((P \u2228 Q) \u2227 (\u00acR \u2228 P))",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": false},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": true}
    ],
    "explanation": "Ekspresi paling dalam dulu, lalu naik ke level luar."
  }'::jsonb,
  300,
  ARRAY['boolean_logic', 'advanced']
),
(
  'L1-T5-002',
  'L1',
  'truth_table',
  5,
  'B',
  '(P AND Q) OR (NOT P AND NOT Q) OR R',
  NULL,
  'Kombinasi tiga segmen OR. Cek setiap segmen secara sistematis.',
  '{
    "expression": "(P AND Q) OR ((NOT P) AND (NOT Q)) OR R",
    "display_expression": "(P \u2227 Q) \u2228 (\u00acP \u2227 \u00acQ) \u2228 R",
    "variables": ["P", "Q", "R"],
    "rows": [
      {"inputs": {"P": true, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": true, "R": false}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": true, "Q": false, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": true, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": true, "R": false}, "expected_output": false},
      {"inputs": {"P": false, "Q": false, "R": true}, "expected_output": true},
      {"inputs": {"P": false, "Q": false, "R": false}, "expected_output": true}
    ],
    "explanation": "Kasus benar jika P dan Q sama, atau jika R bernilai TRUE."
  }'::jsonb,
  300,
  ARRAY['boolean_logic', 'equivalence']
)
ON CONFLICT (id) DO NOTHING;
