import { useGame } from '@/context/GameContext'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'
import { LEVELS } from '@/game/levels'

export function LevelComplete() {
  const { gameState, stats, proceedToNextLevel, returnToMenu } = useGame()

  if (gameState !== 'levelComplete') return null

  const isFinalLevel = stats.level === LEVELS[LEVELS.length - 1].id

  return (
    <div className="overlay levelcomplete-overlay">
      <div className="menu-panel">
        <h2 className="level-title">
          🎉 {isFinalLevel ? 'All Levels Complete!' : `Level ${stats.level} Complete!`}
        </h2>
        <p className="level-name">{stats.activeLevel?.name ?? ''}</p>
        <ScoreBreakdown stats={stats} totalLabel="Score" />
        <div className="level-actions">
          {isFinalLevel ? null : (
            <button className="btn btn-primary" onClick={proceedToNextLevel}>
              Next Level →
            </button>
          )}
          <button className="btn btn-secondary" onClick={returnToMenu}>
            Menu
          </button>
        </div>
      </div>
    </div>
  )
}
