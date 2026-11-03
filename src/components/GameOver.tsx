import { useGame } from '@/context/GameContext'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'

export function GameOver() {
  const { gameState, stats, returnToMenu } = useGame()

  if (gameState !== 'gameOver') return null

  return (
    <div className="overlay gameover-overlay">
      <div className="menu-panel">
        <h2 className="gameover-title">☄️ Extinction!</h2>
        <ScoreBreakdown stats={stats} totalLabel="Final Score" />
        <button className="btn btn-primary" onClick={returnToMenu}>
          Return to Menu
        </button>
      </div>
    </div>
  )
}
