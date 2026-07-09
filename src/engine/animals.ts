import type { Animal } from '../types'

export const ANIMALS: Animal[] = [
  { id: 'coelho', name: 'Coelho', unlock: 0, face: '🐰' },
  { id: 'raposa', name: 'Raposa', unlock: 5, face: '🦊' },
  { id: 'urso', name: 'Urso', unlock: 15, face: '🐻' },
  { id: 'coruja', name: 'Coruja', unlock: 25, face: '🦉' },
  { id: 'tartaruga', name: 'Tartaruga', unlock: 40, face: '🐢' },
]

export function unlockedAnimals(highScore: number): Animal[] {
  return ANIMALS.filter((a) => highScore >= a.unlock)
}

export const TAUNTS = [
  'Você é oficialmente 1% pior que o 1%.',
  'Nem chegou perto. Tenta de novo.',
  'O jogo não errou. Você errou.',
  'Isso foi treino de queda livre.',
  '99% desiste aqui. Você também?',
  'Quase ninguém passa disso. Você não foi exceção.',
  'Reprovado. Próxima tentativa em 3, 2, 1...',
  'Impossível continua impossível.',
  'Isso nem foi seu recorde mais vergonhoso ainda.',
  'A floresta sente sua falta.',
]

export const KILL_LINES = ['F', 'GG fácil.', 'Previsível.', 'Nem doeu, né?', 'Isso foi rápido.', 'Só isso?', 'Trombou feio.', 'Virou petisco.']
export const HUNTER_KILL_LINES = ['O lobo te pegou.', 'Virou jantar.', 'Não foi rápido o suficiente.', 'Fugiu mal.']
export const PIT_KILL_LINES = ['Caiu que nem um patinho.', 'Buraco 1, você 0.', 'Aquele buraco tava óbvio.', 'Devia ter pulado.']
export const AIR_KILL_LINES = ['Pulou alto demais.', 'Devia ter segurado o pulo duplo.', 'Trombada aérea.', 'Olha pra cima da próxima vez.']

export function randomFrom(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}
