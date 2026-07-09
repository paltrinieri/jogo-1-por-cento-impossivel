let audioCtx: AudioContext | null = null

export function ensureAudio() {
  if (!audioCtx) {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new Ctor()
    } catch {
      // Web Audio indisponível — o jogo continua silencioso
    }
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
}

function playTone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType, volume: number, soundOn: boolean) {
  if (!soundOn || !audioCtx) return
  const t0 = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freqStart, t0)
  osc.frequency.linearRampToValueAtTime(freqEnd, t0 + duration)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export const sfx = {
  jump: (on: boolean) => playTone(300, 650, 0.12, 'square', 0.12, on),
  point: (on: boolean) => playTone(700, 950, 0.07, 'triangle', 0.08, on),
  death: (on: boolean) => playTone(500, 70, 0.4, 'sawtooth', 0.18, on),
  collect: (on: boolean) => playTone(650, 1050, 0.1, 'triangle', 0.1, on),
  itemUse: (on: boolean) => playTone(220, 420, 0.16, 'square', 0.13, on),
}
