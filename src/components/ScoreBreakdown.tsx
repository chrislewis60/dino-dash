import { COLLECTABLE_ICONS } from '@/config/assets'
import type { GameStats } from '@/types'

interface ScoreBreakdownProps {
  stats: Pick<GameStats, 'distance' | 'fossils' | 'score' | 'scoreBreakdown'>
  totalLabel: 'Final Score' | 'Score'
}

const categories = [
  ['distance', 'Distance points'],
  ['fossils', 'Fossil points'],
  ['stomps', 'Stomp bonus'],
  ['roar', 'Roar bonus'],
] as const

export function ScoreBreakdown({ stats, totalLabel }: ScoreBreakdownProps) {
  let cumulativePoints = 0
  let allocatedPoints = 0
  const rows = categories.map(([category, label]) => {
    // Allocate fractional carry in display order, using cumulative earned points
    // rather than recalculating from counts or the current level's multiplier.
    cumulativePoints += stats.scoreBreakdown[category]
    const roundedCumulativePoints = Math.floor(cumulativePoints)
    const points = roundedCumulativePoints - allocatedPoints
    allocatedPoints = roundedCumulativePoints
    return { category, label, points }
  })

  return (
    <section className="score-summary" aria-label="Score breakdown">
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
      {rows.map(({ category, label, points }) => (
        <div className="score-row" key={category}>
          <span>{label}</span>
          <span>{points}</span>
        </div>
      ))}
      <div className="score-row total">
        <span>{totalLabel}</span>
        <span>{Math.floor(stats.score)}</span>
      </div>
    </section>
  )
}
