import { useRef } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameOverScreen } from './components/GameOverScreen'
import { HUD } from './components/HUD'
import { PauseScreen } from './components/PauseScreen'
import { StartScreen } from './components/StartScreen'
import { useGameEngine } from './hooks/useGameEngine'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { engine, status, hud, gameOverInfo, start, pause, resume, goToMenu, jump, useItem, cycleAnimal, setColor, toggleSound } =
    useGameEngine(canvasRef)

  return (
    <div className="app-shell">
      <GameCanvas ref={canvasRef} onPress={jump} />

      {status === 'playing' && (
        <HUD
          score={hud.score}
          phaseLabel={hud.phaseLabel}
          attempts={engine.attempts}
          items={hud.items}
          progress={hud.progress}
          soundOn={engine.soundOn}
          onPause={pause}
          onToggleSound={toggleSound}
          onUseItem={useItem}
        />
      )}

      {status === 'idle' && (
        <StartScreen
          highScore={engine.highScore}
          attempts={engine.attempts}
          animalFace={engine.currentAnimal.face}
          animalName={engine.currentAnimal.name}
          colorIndex={engine.colorIndex}
          onCycleAnimal={cycleAnimal}
          onSetColor={setColor}
          onStart={start}
        />
      )}

      {status === 'paused' && (
        <PauseScreen score={hud.score} phaseLabel={hud.phaseLabel} onResume={resume} onRestart={start} onMenu={goToMenu} />
      )}

      {status === 'gameover' && gameOverInfo && (
        <GameOverScreen
          score={gameOverInfo.score}
          highScore={engine.highScore}
          attempts={engine.attempts}
          isNewRecord={gameOverInfo.isNewRecord}
          reason={gameOverInfo.reason}
          onRetry={start}
          onMenu={goToMenu}
        />
      )}
    </div>
  )
}
