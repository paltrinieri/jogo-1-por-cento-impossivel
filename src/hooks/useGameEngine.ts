import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { GameEngine } from '../engine/GameEngine'
import { renderFrame } from '../engine/render'
import type { DeathReason, GameStatus } from '../types'

export interface HudState {
  score: number
  level: number
  phaseLabel: string
  items: number
  progress: number
}

export interface GameOverInfo {
  reason: DeathReason
  score: number
  isNewRecord: boolean
}

/**
 * Cria o motor do jogo, conecta ao <canvas> via requestAnimationFrame e
 * republica os eventos relevantes como estado React (sem re-renderizar a
 * cada frame — o Canvas é atualizado diretamente, fora do ciclo do React).
 */
export function useGameEngine(canvasRef: RefObject<HTMLCanvasElement>) {
  const engineRef = useRef<GameEngine | null>(null)
  const [status, setStatus] = useState<GameStatus>('idle')
  const [hud, setHud] = useState<HudState>({ score: 0, level: 1, phaseLabel: '1-1', items: 0, progress: 0 })
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null)
  const [, bump] = useState(0)
  const forceUpdate = useCallback(() => bump((x) => x + 1), [])

  if (!engineRef.current) {
    engineRef.current = new GameEngine({
      onStatusChange: setStatus,
      onScoreChange: (score) => setHud((h) => ({ ...h, score })),
      onLevelUp: (level, _name, phaseLabel) => setHud((h) => ({ ...h, level, phaseLabel })),
      onItemsChange: (items) => setHud((h) => ({ ...h, items })),
      onProgressChange: (progress) => setHud((h) => ({ ...h, progress })),
      onGameOver: (reason, score, isNewRecord) => setGameOverInfo({ reason, score, isNewRecord }),
    })
  }
  const engine = engineRef.current

  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const canvasCurrent = canvasRef.current
    if (!canvasCurrent) return
    const canvas: HTMLCanvasElement = canvasCurrent

    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) return
    const ctx: CanvasRenderingContext2D = canvasContext

    let logicalWidth = canvas.clientWidth
    let logicalHeight = canvas.clientHeight

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      logicalWidth = parent.clientWidth
      logicalHeight = parent.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(logicalWidth * dpr)
      canvas.height = Math.round(logicalHeight * dpr)
      canvas.style.width = logicalWidth + 'px'
      canvas.style.height = logicalHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      engine.setViewport(logicalWidth)
    }

    resize()
    window.addEventListener('resize', resize)

    function loop(time: number) {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      engine.update(dt)
      engine.tickPostDeath(dt)
      renderFrame(ctx, engine, logicalWidth, logicalHeight)

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, engine])

  const start = useCallback(() => {
    setGameOverInfo(null)
    engine.start()
  }, [engine])

  const pause = useCallback(() => engine.pause(), [engine])
  const resume = useCallback(() => engine.resume(), [engine])

  const goToMenu = useCallback(() => {
    engine.goToMenu()
    forceUpdate()
  }, [engine, forceUpdate])

  const jump = useCallback(() => engine.jump(), [engine])
  const useItem = useCallback(() => engine.useItem(), [engine])

  const cycleAnimal = useCallback(
    (dir: number) => {
      engine.cycleAnimal(dir)
      forceUpdate()
    },
    [engine, forceUpdate]
  )

  const setColor = useCallback(
    (index: number) => {
      engine.setColor(index)
      forceUpdate()
    },
    [engine, forceUpdate]
  )

  const toggleSound = useCallback(() => {
    engine.toggleSound()
    forceUpdate()
  }, [engine, forceUpdate])

  return { engine, status, hud, gameOverInfo, start, pause, resume, goToMenu, jump, useItem, cycleAnimal, setColor, toggleSound }
}
