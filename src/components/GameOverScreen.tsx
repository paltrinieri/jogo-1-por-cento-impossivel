import { useMemo } from 'react'
import { AIR_KILL_LINES, HUNTER_KILL_LINES, PIT_KILL_LINES, TAUNTS, randomFrom } from '../engine/animals'
import type { DeathReason } from '../types'
import { ShareButton } from './ShareButton'

interface GameOverScreenProps {
  score: number
  highScore: number
  attempts: number
  isNewRecord: boolean
  reason: DeathReason
  onRetry: () => void
  onMenu: () => void
}

const STAMP_TEXT: Record<DeathReason, string> = {
  obstacle: 'REJEITADO',
  pit: 'CAIU NO BURACO',
  air: 'ABATIDO',
  hunter: 'CAÇADO',
}

function pickTaunt(reason: DeathReason): string {
  if (reason === 'hunter') return 'O lobo foi mais rápido que você.'
  if (reason === 'pit') return randomFrom(PIT_KILL_LINES)
  if (reason === 'air') return randomFrom(AIR_KILL_LINES)
  if (Math.random() < 0.4) return randomFrom(HUNTER_KILL_LINES)
  return randomFrom(TAUNTS)
}

export function GameOverScreen({ score, highScore, attempts, isNewRecord, reason, onRetry, onMenu }: GameOverScreenProps) {
  const taunt = useMemo(() => (isNewRecord ? randomFrom(TAUNTS) : pickTaunt(reason)), [isNewRecord, reason])
  const stamp = isNewRecord ? 'NOVO RECORDE' : STAMP_TEXT[reason]

  return (
    <div className="overlay">
      <div className="card gameover-card">
        <div className={`stamp${isNewRecord ? ' stamp-good' : ''}`}>{stamp}</div>
        <p className="taunt">{taunt}</p>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{score}</div>
            <div className="stat-label">Pontos</div>
          </div>
          <div className="stat">
            <div className="stat-icon">🏆</div>
            <div className={`stat-value${isNewRecord ? ' is-new' : ''}`}>{highScore}</div>
            <div className="stat-label">Recorde</div>
          </div>
          <div className="stat">
            <div className="stat-icon">🔁</div>
            <div className="stat-value">{attempts}</div>
            <div className="stat-label">Tentativas</div>
          </div>
        </div>

        <button type="button" className="primary-btn" onClick={onRetry}>
          Tentar de novo
        </button>

        <div className="button-row">
          <ShareButton score={score} highScore={highScore} />
          <button type="button" className="secondary-btn" onClick={onMenu}>
            Trocar bicho
          </button>
        </div>
      </div>
    </div>
  )
}
