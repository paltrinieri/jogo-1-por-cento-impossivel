import type { CSSProperties } from 'react'
import { ACCENT_COLORS } from '../engine/constants'

interface StartScreenProps {
  highScore: number
  attempts: number
  animalFace: string
  animalName: string
  colorIndex: number
  onCycleAnimal: (dir: number) => void
  onSetColor: (index: number) => void
  onStart: () => void
}

export function StartScreen({
  highScore, attempts, animalFace, animalName, colorIndex, onCycleAnimal, onSetColor, onStart,
}: StartScreenProps) {
  const accentStyle = { '--accent-color': ACCENT_COLORS[colorIndex] } as CSSProperties

  return (
    <div className="overlay">
      <div className="card start-card" style={accentStyle}>
        <h1 className="title">
          1<span className="pct">%</span> IMPOSSÍVEL
        </h1>
        <p className="subtitle">Só 1% consegue passar.</p>
        <p className="subtitle subtitle-sm">Fuja pela floresta — o lobo está logo atrás. Toque para pular.</p>

        <div className="picker-label">Seu bicho</div>
        <div className="picker-row">
          <button type="button" className="round-btn" onClick={() => onCycleAnimal(-1)} aria-label="Bicho anterior">
            ‹
          </button>
          <div className="picker-preview">
            <div className="picker-face">{animalFace}</div>
            <div className="picker-name">{animalName}</div>
          </div>
          <button type="button" className="round-btn" onClick={() => onCycleAnimal(1)} aria-label="Próximo bicho">
            ›
          </button>
        </div>

        <div className="picker-label">Sua cor</div>
        <div className="color-row">
          {ACCENT_COLORS.map((c, i) => (
            <button
              key={c}
              type="button"
              className={`color-swatch${i === colorIndex ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => onSetColor(i)}
              aria-label={`Cor ${i + 1}`}
            />
          ))}
        </div>

        <p className="hint">A cada fase o mapa muda e o lobo fica mais rápido.</p>
        <p className="hint">A partir da fase 2, cuidado com o que vem do céu.</p>

        {attempts > 0 && (
          <div className="stat-row">
            <div className="stat">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{highScore}</div>
              <div className="stat-label">Recorde</div>
            </div>
            <div className="stat">
              <div className="stat-icon">🔁</div>
              <div className="stat-value">{attempts}</div>
              <div className="stat-label">Tentativas</div>
            </div>
          </div>
        )}

        <button type="button" className="primary-btn" onClick={onStart}>
          Jogar
        </button>
      </div>
    </div>
  )
}
