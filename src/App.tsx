import { GameProvider } from '@/context/GameContext'
import { useGame } from '@/context/GameContext'
import { HUD, MainMenu, GameOver, LevelComplete, PauseScreen } from '@/components'
import './App.css'

function GameCanvas() {
  const { canvasRef } = useGame()
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="game-canvas"
    />
  )
}

function GameUI() {
  return (
    <div className="game-container">
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
