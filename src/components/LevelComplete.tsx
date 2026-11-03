import { useGame } from '@/context/GameContext'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'

export function LevelComplete() {
  const { gameState, stats, proceedToNextLevel, returnToMenu } = useGame()

  if (gameState !== 'levelComplete') return null

  return (
    <div className="overlay levelcomplete-overlay">
      <div className="menu-panel">
        <h2 className="level-title">🎉 Level {stats.level} Complete!</h2>
        <p className="level-name">{stats.activeLevel?.name ?? ''}</p>
        <ScoreBreakdown stats={stats} totalLabel="Score" />
        <div className="level-actions">
          <button className="btn btn-primary" onClick={proceedToNextLevel}>
            Next Level →
          </button>
          <button className="btn btn-secondary" onClick={returnToMenu}>
            Menu
          </button>
        </div>
      </div>
    </div>
  )
}
