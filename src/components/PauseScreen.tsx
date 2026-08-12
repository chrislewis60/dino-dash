import { useGame } from '@/context/GameContext'

export function PauseScreen() {
  const { gameState, togglePause, returnToMenu } = useGame()

  if (gameState !== 'paused') return null

  return (
    <div className="overlay pause-overlay">
      <div className="menu-panel">
        <h2>⏸ Paused</h2>
        <div className="pause-actions">
          <button className="btn btn-primary" onClick={togglePause}>
            Resume
          </button>
          <button className="btn btn-secondary" onClick={returnToMenu}>
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
