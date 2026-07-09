export function readNum(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key)
    const v = raw !== null ? parseInt(raw, 10) : fallback
    return Number.isFinite(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function readStr(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeVal(key: string, value: string | number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // localStorage indisponível (modo privado etc.) — ignora silenciosamente
  }
}
