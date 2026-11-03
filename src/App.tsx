import { GameProvider } from '@/context/GameContext'
import { useGame } from '@/context/GameContext'
import { HUD, MainMenu, GameOver, LevelComplete, PauseScreen } from '@/components'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/systems'
import './App.css'

function GameCanvas() {
  const { canvasRef } = useGame()
  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="game-canvas"
    />
  )
}

function GameUI() {
  return (
    <div
      className="game-container"
      style={{ maxWidth: CANVAS_WIDTH, aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      <GameCanvas />
      <HUD />
      <MainMenu />
      <GameOver />
      <LevelComplete />
      <PauseScreen />
    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  )
}

export default App
