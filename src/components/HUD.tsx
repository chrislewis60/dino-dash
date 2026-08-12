import { useGame } from '@/context/GameContext'

export function HUD() {
  const { stats, gameState, togglePause } = useGame()

  if (gameState !== 'playing') return null

  return (
    <div className="hud">
      <div className="hud-left">
        <span className="hud-score">Score: {Math.floor(stats.score)}</span>
        <span className="hud-distance">{stats.distance}m</span>
      </div>
      <div className="hud-center">
        <span className="hud-level">{stats.activeLevel?.name ?? `Level ${stats.level}`}</span>
      </div>
      <div className="hud-right">
        <span className="hud-lives">
          {'🥚'.repeat(stats.lives)}
        </span>
        <span className="hud-fossils">💎 {stats.fossils}</span>
        <button className="hud-pause-btn" onClick={togglePause} aria-label="Pause">
          ⏸
        </button>
      </div>
    </div>
  )
}
