interface PauseScreenProps {
  score: number
  phaseLabel: string
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export function PauseScreen({ score, phaseLabel, onResume, onRestart, onMenu }: PauseScreenProps) {
  return (
    <div className="overlay">
      <div className="card">
        <h1 className="title title-sm">PAUSADO</h1>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{score}</div>
            <div className="stat-label">Pontos</div>
          </div>
          <div className="stat">
            <div className="stat-icon">🗺️</div>
            <div className="stat-value">{phaseLabel}</div>
            <div className="stat-label">Fase</div>
          </div>
        </div>
        <button type="button" className="primary-btn" onClick={onResume}>
          Continuar
        </button>
        <div className="button-row">
          <button type="button" className="secondary-btn" onClick={onRestart}>
            Reiniciar
          </button>
          <button type="button" className="secondary-btn" onClick={onMenu}>
            Menu inicial
          </button>
        </div>
      </div>
    </div>
  )
}
