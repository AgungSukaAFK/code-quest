export interface MapNode {
  id: string;
  name: string;
  type: "computational_thinking" | "logic_math" | "multiplayer" | "locked";
  position: { x: number; y: number };
  iconName: "Network" | "Binary" | "Swords" | "Lock";
  description: string;
}

export interface MapPath {
  from: string;
  to: string;
}

export const MAP_NODES: MapNode[] = [
  {
    id: "M2",
    name: "Lembah Dekomposisi",
    type: "computational_thinking",
    position: { x: 36, y: 78 },
    iconName: "Network",
    description: "Belajar memecah masalah kompleks menjadi sub-masalah",
  },
  {
    id: "L1",
    name: "Menara Logika Boolean",
    type: "logic_math",
    position: { x: 58, y: 50 },
    iconName: "Binary",
    description: "Pelajari operasi AND, OR, NOT untuk algoritma",
  },
  {
    id: "ARENA",
    name: "Arena Pertempuran",
    type: "multiplayer",
    position: { x: 48, y: 22 },
    iconName: "Swords",
    description: "Tantang temanmu dalam kuis 10 soal! Dekomposisi + Boolean. Siapa tercepat menang?",
  },
];

export const MAP_PATHS: MapPath[] = [
  { from: "M2", to: "L1" },
  { from: "L1", to: "ARENA" },
];
