// One-off export script: pulls all puzzles from the live Supabase DB and
// writes them into a Word (.docx) document, split into sections by module
// type (Berpikir Komputasi / Logika Matematika), including difficulty and
// the full answer key for each puzzle type.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  BorderStyle,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceKey);

const DIFFICULTY_LABEL = {
  1: "Sangat Mudah",
  2: "Mudah",
  3: "Sedang",
  4: "Sulit",
  5: "Sangat Sulit",
};

const SECTION_LABEL = {
  computational_thinking: "Berpikir Komputasi (Dekomposisi)",
  logic_math: "Logika Matematika (Boolean)",
};

const SECTION_ORDER = ["computational_thinking", "logic_math"];

const HEADER_FILL = "1F4E78";
const ALT_FILL = "F2F2F2";

function headerCell(text) {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, color: "auto", fill: HEADER_FILL },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      }),
    ],
  });
}

function bodyCell(text, { shaded = false, bold = false } = {}) {
  return new TableCell({
    shading: shaded ? { type: ShadingType.CLEAR, color: "auto", fill: ALT_FILL } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold })] })],
  });
}

function labeledParagraph(label, value) {
  if (!value) return null;
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: String(value) }),
    ],
  });
}

function renderDecompositionSort(content) {
  const catLabel = new Map(content.categories.map((c) => [c.id, c.label]));
  const children = [];

  children.push(
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [new TextRun({ text: "Kategori:", bold: true })],
    })
  );
  children.push(
    new Paragraph({
      text: content.categories.map((c) => c.label).join(", "),
      spacing: { after: 120 },
    })
  );

  const rows = [
    new TableRow({ children: [headerCell("Tugas"), headerCell("Kategori yang Benar (Kunci Jawaban)")] }),
    ...content.tasks.map((t, i) =>
      new TableRow({
        children: [
          bodyCell(t.label, { shaded: i % 2 === 1 }),
          bodyCell(catLabel.get(content.correct_mapping[t.id]) ?? content.correct_mapping[t.id], {
            shaded: i % 2 === 1,
            bold: true,
          }),
        ],
      })
    ),
  ];

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
  return children;
}

function renderDecompositionOrder(content) {
  const taskLabel = new Map(content.tasks.map((t) => [t.id, t.label]));
  const children = [];

  children.push(
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [new TextRun({ text: "Urutan yang Benar (Kunci Jawaban):", bold: true })],
    })
  );

  content.correct_order.forEach((taskId, i) => {
    children.push(
      new Paragraph({
        text: `${i + 1}. ${taskLabel.get(taskId) ?? taskId}`,
        spacing: { after: 40 },
      })
    );
  });

  if (content.parallel_groups?.length) {
    children.push(
      new Paragraph({
        spacing: { before: 80 },
        children: [
          new TextRun({ text: "Kelompok Paralel: ", bold: true }),
          new TextRun({
            text: content.parallel_groups
              .map((g) => `(${g.map((id) => taskLabel.get(id) ?? id).join(" + ")})`)
              .join(", "),
          }),
        ],
      })
    );
  }

  return children;
}

function renderTruthTable(content) {
  const children = [];

  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Ekspresi: ", bold: true }),
        new TextRun({ text: content.display_expression || content.expression }),
      ],
    })
  );

  const headers = [...content.variables, "Output (Kunci Jawaban)"];
  const rows = [
    new TableRow({ children: headers.map((h) => headerCell(h)) }),
    ...content.rows.map((row, i) =>
      new TableRow({
        children: [
          ...content.variables.map((v) =>
            bodyCell(row.inputs[v] ? "Benar" : "Salah", { shaded: i % 2 === 1 })
          ),
          bodyCell(row.expected_output ? "Benar" : "Salah", { shaded: i % 2 === 1, bold: true }),
        ],
      })
    ),
  ];

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));

  if (content.explanation) {
    children.push(
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "Penjelasan: ", bold: true, italics: true }),
          new TextRun({ text: content.explanation, italics: true }),
        ],
      })
    );
  }

  return children;
}

function renderContent(puzzle) {
  const content = puzzle.content;
  const type = content?.type || puzzle.type;
  try {
    if (type === "decomposition_sort") return renderDecompositionSort(content);
    if (type === "decomposition_order") return renderDecompositionOrder(content);
    if (type === "truth_table" || puzzle.type === "truth_table") return renderTruthTable(content);
  } catch (e) {
    return [
      new Paragraph({
        children: [new TextRun({ text: `(Gagal merender konten: ${e.message})`, italics: true })],
      }),
    ];
  }
  return [
    new Paragraph({
      children: [new TextRun({ text: JSON.stringify(content), italics: true })],
    }),
  ];
}

function renderPuzzle(puzzle, index) {
  const children = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "AAAAAA" },
      },
      children: [
        new TextRun({ text: `${index}. ${puzzle.title} ` }),
        new TextRun({ text: `[${puzzle.id}]`, italics: true, size: 20, color: "888888" }),
      ],
    })
  );

  const difficultyText = `${puzzle.difficulty}/5 - ${DIFFICULTY_LABEL[puzzle.difficulty] ?? ""}`;
  [
    labeledParagraph("Tingkat Kesulitan", difficultyText),
    labeledParagraph("Konteks", puzzle.context),
    labeledParagraph("Tujuan / Instruksi", puzzle.goal),
    labeledParagraph("Estimasi Waktu", puzzle.expected_time_sec ? `${puzzle.expected_time_sec} detik` : null),
    labeledParagraph("Konsep yang Diuji", puzzle.concepts_tested?.join(", ")),
  ]
    .filter(Boolean)
    .forEach((p) => children.push(p));

  children.push(...renderContent(puzzle));

  return children;
}

async function main() {
  const { data: modules, error: modErr } = await supabase.from("modules").select("*");
  if (modErr) throw modErr;

  const { data: puzzles, error: pzErr } = await supabase
    .from("puzzles")
    .select("*")
    .order("module_id", { ascending: true })
    .order("difficulty", { ascending: true })
    .order("id", { ascending: true });
  if (pzErr) throw pzErr;

  const moduleMap = new Map(modules.map((m) => [m.id, m]));
  const bySectionType = new Map();

  for (const p of puzzles) {
    const mod = moduleMap.get(p.module_id);
    const key = mod?.type || "lainnya";
    if (!bySectionType.has(key)) bySectionType.set(key, []);
    bySectionType.get(key).push(p);
  }

  const docChildren = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Bank Soal - Code Quest" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Diekspor dari database pada ${new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })} - Total ${puzzles.length} soal`,
          italics: true,
          color: "666666",
        }),
      ],
    }),
  ];

  const orderedKeys = [
    ...SECTION_ORDER.filter((k) => bySectionType.has(k)),
    ...[...bySectionType.keys()].filter((k) => !SECTION_ORDER.includes(k)),
  ];

  orderedKeys.forEach((key, sIdx) => {
    const items = bySectionType.get(key);
    if (sIdx > 0) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "", break: 1 })],
          pageBreakBefore: true,
        })
      );
    }
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({ text: SECTION_LABEL[key] || key }),
          new TextRun({ text: `  (${items.length} soal)`, size: 22, color: "666666" }),
        ],
      })
    );
    items.forEach((p, i) => docChildren.push(...renderPuzzle(p, i + 1)));
  });

  const doc = new Document({
    sections: [{ properties: {}, children: docChildren }],
  });

  const outDir = path.join(__dirname, "..", "exports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "Bank-Soal-CodeQuest.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);

  console.log(`OK: ${puzzles.length} soal diekspor ke ${outPath}`);
  for (const key of orderedKeys) {
    console.log(`  - ${SECTION_LABEL[key] || key}: ${bySectionType.get(key).length} soal`);
  }
}

main().catch((err) => {
  console.error("Gagal ekspor:", err);
  process.exit(1);
});
