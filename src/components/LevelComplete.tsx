import { useGame } from '@/context/GameContext'

export function LevelComplete() {
  const { gameState, stats, proceedToNextLevel, returnToMenu } = useGame()

  if (gameState !== 'levelComplete') return null

  return (
    <div className="overlay levelcomplete-overlay">
      <div className="menu-panel">
        <h2 className="level-title">🎉 Level {stats.level} Complete!</h2>
        <p className="level-name">{stats.activeLevel?.name ?? ''}</p>
        <div className="score-summary">
          <div className="score-row">
            <span>Distance</span>
            <span>{stats.distance}m</span>
          </div>
          <div className="score-row">
            <span>Fossils</span>
            <span>💎 {stats.fossils}</span>
          </div>
          <div className="score-row">
            <span>Enemies Stomped</span>
            <span>🦶 {stats.enemiesStomped}</span>
          </div>
          <div className="score-row total">
            <span>Score</span>
            <span>{Math.floor(stats.score)}</span>
          </div>
        </div>
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
