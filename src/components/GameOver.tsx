import { useGame } from '@/context/GameContext'
import { COLLECTABLE_ICONS } from '@/config/assets'

export function GameOver() {
  const { gameState, stats, returnToMenu } = useGame()

  if (gameState !== 'gameOver') return null

  return (
    <div className="overlay gameover-overlay">
      <div className="menu-panel">
        <h2 className="gameover-title">☄️ Extinction!</h2>
        <div className="score-summary">
          <div className="score-row">
            <span>Distance</span>
            <span>{stats.distance}m</span>
          </div>
          <div className="score-row">
            <span>Fossils</span>
            <span>
              <img className="collectable-icon" src={COLLECTABLE_ICONS.fossil.source} alt="" />
              {' '}{stats.fossils}
            </span>
          </div>
          <div className="score-row">
            <span>Enemies Stomped</span>
            <span>🦶 {stats.enemiesStomped}</span>
          </div>
          <div className="score-row total">
            <span>Final Score</span>
            <span>{Math.floor(stats.score)}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={returnToMenu}>
          Return to Menu
        </button>
      </div>
    </div>
  )
}
