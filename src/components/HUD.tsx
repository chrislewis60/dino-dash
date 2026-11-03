import { useGame } from '@/context/GameContext'
import { PLAYER_HEALTH } from '@/config/gameplay'
import { clamp } from '@/utils'
import { COLLECTABLE_ICONS } from '@/config/assets'

export function HUD() {
  const { stats, gameState, togglePause } = useGame()

  if (gameState !== 'playing') return null

  const healthPercent = Math.round(clamp(stats.lives / PLAYER_HEALTH.MAX_LIVES * 100, 0, 100))
  const levelLengthMs = stats.activeLevel?.lengthMs ?? 0
  const progressPercent = levelLengthMs > 0
    ? Math.floor(clamp(stats.levelElapsedMs / levelLengthMs * 100, 0, 100))
    : 0

  return (
    <div className="hud">
      <div className="hud-summary">
      <div className="hud-left">
        <span className="hud-score">Score: {Math.floor(stats.score)}</span>
        <span className="hud-distance">{stats.distance}m</span>
      </div>
      <div className="hud-center">
        <span className="hud-level">{stats.activeLevel?.name ?? `Level ${stats.level}`}</span>
      </div>
      <div className="hud-right">
        <span className="hud-lives" aria-label={`Lives: ${stats.lives}`}>
          {Array.from({ length: stats.lives }, (_, index) => (
            <img
              key={index}
              className="collectable-icon"
              src={COLLECTABLE_ICONS.egg.source}
              alt=""
            />
          ))}
        </span>
        <span className="hud-fossils" aria-label={`Fossils: ${stats.fossils}`}>
          <img className="collectable-icon" src={COLLECTABLE_ICONS.fossil.source} alt="" />
          {' '}{stats.fossils}
        </span>
        <button className="hud-pause-btn" onClick={togglePause} aria-label="Pause">
          ⏸
        </button>
      </div>
      </div>
      <div className="hud-status">
        <div className="hud-meter hud-health">
          <label htmlFor="health-status">Health <span>{healthPercent}%</span></label>
          <progress id="health-status" value={healthPercent} max={100} />
        </div>
        <div className="hud-meter hud-progress">
          <label htmlFor="level-progress">Level Progress <span>{progressPercent}%</span></label>
          <progress id="level-progress" value={progressPercent} max={100} />
        </div>
      </div>
    </div>
  )
}
