import type { Theme } from '../types'

export const THEMES: Theme[] = [
  {
    name: 'Floresta',
    bgTop: '#274b2e', bgBottom: '#4c7a3f', groundA: '#6b4423', groundB: '#3a2612', accent: '#8fd694',
    obstacleVariants: [
      { type: 'wall', shape: 'rock', color: '#5c3a21', minH: 22, maxH: 40, minW: 20, maxW: 32, weight: 3 },
      { type: 'pit', color: '#000000', minW: 40, maxW: 68, weight: 1 },
    ],
    decorVariants: [{ kind: 'tree', color: '#1d3b22', min: 28, max: 58, weight: 1 }],
    air: { face: '🐦', bandMin: 130, bandMax: 195, width: 22 },
  },
  {
    name: 'Cidade',
    bgTop: '#1b2230', bgBottom: '#3a4560', groundA: '#5a5f68', groundB: '#26292f', accent: '#ffd23f',
    obstacleVariants: [
      { type: 'car', minH: 26, maxH: 32, minW: 40, maxW: 52, colors: ['#e63946', '#f4a300', '#457b9d', '#2a9d8f'], weight: 3 },
      { type: 'pit', color: '#000000', minW: 34, maxW: 54, weight: 1 },
    ],
    decorVariants: [{ kind: 'building', color: '#242c3d', minW: 26, maxW: 46, minH: 70, maxH: 150, weight: 1 }],
    air: { face: '✈️', bandMin: 140, bandMax: 205, width: 30 },
  },
  {
    name: 'Deserto',
    bgTop: '#7a4a1e', bgBottom: '#e0a94a', groundA: '#e0c07a', groundB: '#7a4a1e', accent: '#ffdd8a',
    obstacleVariants: [
      { type: 'wall', shape: 'rock', color: '#4a7c3f', minH: 20, maxH: 38, minW: 16, maxW: 22, weight: 3 },
      { type: 'pit', color: '#000000', minW: 44, maxW: 66, weight: 1 },
    ],
    decorVariants: [{ kind: 'rock', color: '#3f6b34', min: 22, max: 44, weight: 1 }],
    air: { face: '🦅', bandMin: 130, bandMax: 195, width: 24 },
  },
  {
    name: 'Ártico',
    bgTop: '#b9d9e8', bgBottom: '#e8f4fa', groundA: '#ffffff', groundB: '#cfe8f5', accent: '#3a86b8',
    obstacleVariants: [
      { type: 'wall', shape: 'crystal', color: '#7ec8e3', minH: 24, maxH: 42, minW: 22, maxW: 32, weight: 3 },
      { type: 'pit', color: '#000000', minW: 40, maxW: 60, weight: 1 },
    ],
    decorVariants: [
      { kind: 'crystal', color: '#cfeeff', min: 24, max: 46, weight: 2 },
      { kind: 'emoji', face: '🐧', min: 20, max: 26, weight: 1 },
    ],
    air: { face: '🛩️', bandMin: 135, bandMax: 200, width: 28 },
  },
  {
    name: 'Pântano',
    bgTop: '#0e1f14', bgBottom: '#2a3d1e', groundA: '#4a5a2a', groundB: '#1a230f', accent: '#a6d15a',
    obstacleVariants: [
      { type: 'wall', shape: 'rock', color: '#3a4a1e', minH: 22, maxH: 38, minW: 24, maxW: 36, weight: 3 },
      { type: 'pit', color: '#000000', minW: 44, maxW: 68, weight: 1 },
    ],
    decorVariants: [{ kind: 'tree', color: '#16240f', min: 26, max: 52, weight: 1 }],
    air: { face: '🦟', bandMin: 130, bandMax: 190, width: 18 },
  },
  {
    name: 'Vulcão',
    bgTop: '#1a0603', bgBottom: '#5c1a0a', groundA: '#7a2a10', groundB: '#2a0d05', accent: '#ff7a3d',
    obstacleVariants: [
      { type: 'wall', shape: 'spike', color: '#ff5722', minH: 22, maxH: 40, minW: 20, maxW: 30, weight: 3 },
      { type: 'pit', color: '#000000', minW: 40, maxW: 60, weight: 1 },
    ],
    decorVariants: [{ kind: 'rock', color: '#3a1a10', min: 24, max: 48, weight: 1 }],
    air: { face: '🦅', bandMin: 130, bandMax: 195, width: 24 },
  },
]
