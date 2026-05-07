export interface MapNode {
  id: string
  name: string
  type: 'computational_thinking' | 'logic_math' | 'locked'
  position: { x: number; y: number }
  iconName: 'Network' | 'Binary' | 'Lock'
  description: string
}

export interface MapPath {
  from: string
  to: string
}

export const MAP_NODES: MapNode[] = [
  {
    id: 'M2',
    name: 'Lembah Dekomposisi',
    type: 'computational_thinking',
    position: { x: 25, y: 70 },
    iconName: 'Network',
    description: 'Belajar memecah masalah kompleks menjadi sub-masalah',
  },
  {
    id: 'L1',
    name: 'Menara Logika Boolean',
    type: 'logic_math',
    position: { x: 65, y: 40 },
    iconName: 'Binary',
    description: 'Pelajari operasi AND, OR, NOT untuk algoritma',
  },
  {
    id: 'LOCKED_1',
    name: 'Region Misterius',
    type: 'locked',
    position: { x: 50, y: 15 },
    iconName: 'Lock',
    description: 'Akan terbuka di update berikutnya',
  },
]

export const MAP_PATHS: MapPath[] = [
  { from: 'M2', to: 'L1' },
  { from: 'L1', to: 'LOCKED_1' },
]