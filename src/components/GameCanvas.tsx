import { forwardRef } from 'react'

interface GameCanvasProps {
  onPress: () => void
}

/**
 * Componente "burro": só hospeda o elemento <canvas> e captura o toque do
 * jogador. Toda a lógica de jogo vive no GameEngine (src/engine) e é
 * orquestrada pelo hook useGameEngine, que é dono do ref e do game loop —
 * isso evita estado duplicado/obsoleto entre este componente e a árvore React.
 */
export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(function GameCanvas(
  { onPress },
  ref
) {
  return (
    <canvas
      ref={ref}
      className="game-canvas"
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
    />
  )
})
