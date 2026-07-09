interface HUDProps {
  score: number
  phaseLabel: string
  attempts: number
  items: number
  progress: number
  soundOn: boolean
  onPause: () => void
  onToggleSound: () => void
  onUseItem: () => void
}

export function HUD({ score, phaseLabel, attempts, items, progress, soundOn, onPause, onToggleSound, onUseItem }: HUDProps) {
  return (
    <>
      <div className="hud">
        <div className="hud-scrim" aria-hidden="true" />
        <div className="hud-left">
          <div className="hud-label">Pontos</div>
          <div className="hud-score">{score}</div>
          <div className="hud-phase-row">
            <span className="hud-phase">Fase {phaseLabel}</span>
            <div className="phase-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="phase-bar-fill" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
            </div>
          </div>
        </div>
        <div className="hud-right">
          <div className="hud-icon-row">
            <button type="button" className="icon-btn" onClick={onPause} aria-label="Pausar">
              ⏸
            </button>
            <button type="button" className="icon-btn" onClick={onToggleSound} aria-label="Som">
              {soundOn ? '🔊' : '🔇'}
            </button>
          </div>
          <div className="hud-attempts">
            <div className="hud-label">Tentativa</div>
            <strong>#{attempts}</strong>
          </div>
        </div>
      </div>

      {items > 0 && (
        <button type="button" className="item-btn" onClick={onUseItem}>
          <span className="item-btn-icon">🪤</span> <span>{items}</span>
        </button>
      )}
    </>
  )
}
