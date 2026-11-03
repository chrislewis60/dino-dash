import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GameOver } from '@/components/GameOver'
import { LevelComplete } from '@/components/LevelComplete'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'
import { useGame } from '@/context/GameContext'
import type { GameStats, GameState } from '@/types'

vi.mock('@/context/GameContext', () => ({ useGame: vi.fn() }))

const stats: GameStats = {
  scoreBreakdown: { distance: 125, fossils: 700, stomps: 150, roar: 225 },
  score: 1200,
  lives: 0,
  level: 3,
  distance: 100,
  fossils: 7,
  enemiesStomped: 2,
  levelElapsedMs: 0,
  activeLevel: null,
}

function rowValue(label: string): HTMLElement {
  const row = screen.getByText(label).parentElement!
  return within(row).getAllByText(/.+/)[1]
}

const resultStates = [
  { gameState: 'gameOver', Component: GameOver, totalLabel: 'Final Score' },
  { gameState: 'levelComplete', Component: LevelComplete, totalLabel: 'Score' },
] satisfies { gameState: GameState; Component: typeof GameOver; totalLabel: string }[]

function mockGame(gameState: GameState, resultStats = stats) {
  const context = {
    gameState,
    stats: resultStats,
    canvasRef: { current: null },
    startGame: vi.fn(),
    togglePause: vi.fn(),
    proceedToNextLevel: vi.fn(),
    returnToMenu: vi.fn(),
  }
  vi.mocked(useGame).mockReturnValue(context)
  return context
}

describe('result score breakdown', () => {
  it.each(resultStates)('shows cumulative earned categories once on $gameState', ({ gameState, Component, totalLabel }) => {
    const context = mockGame(gameState)
    render(<Component />)

    expect(screen.getAllByRole('region', { name: 'Score breakdown' })).toHaveLength(1)
    expect(rowValue('Distance')).toHaveTextContent('100m')
    expect(rowValue('Fossils')).toHaveTextContent('7')
    for (const [label, points] of [
      ['Distance points', '125'], ['Fossil points', '700'],
      ['Stomp bonus', '150'], ['Roar bonus', '225'], [totalLabel, '1200'],
    ]) {
      expect(screen.getAllByText(label)).toHaveLength(1)
      expect(rowValue(label).textContent).toBe(points)
    }
    expect(screen.queryByText('Enemies Stomped')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: gameState === 'gameOver' ? 'Return to Menu' : 'Menu' }))
    expect(context.returnToMenu).toHaveBeenCalledOnce()
    if (gameState === 'levelComplete') {
      fireEvent.click(screen.getByRole('button', { name: /Next Level/ }))
      expect(context.proceedToNextLevel).toHaveBeenCalledOnce()
    }
  })

  it.each(resultStates)('allocates fractional carry to match the total on $gameState', ({ gameState, Component, totalLabel }) => {
    mockGame(gameState, {
      ...stats,
      scoreBreakdown: { distance: 10.75, fossils: 20.75, stomps: 30.75, roar: 40.75 },
      score: 103,
    })
    render(<Component />)
    const values = ['Distance points', 'Fossil points', 'Stomp bonus', 'Roar bonus']
      .map(label => Number(rowValue(label).textContent))
    expect(values).toEqual([10, 21, 31, 41])
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(Number(rowValue(totalLabel).textContent))
  })

  it.each([
    { breakdown: { distance: 0, fossils: 0, stomps: 0, roar: 0 }, expected: [0, 0, 0, 0] },
    { breakdown: { distance: 0.4, fossils: 0.4, stomps: 0.4, roar: 0.4 }, expected: [0, 0, 1, 0] },
    { breakdown: { distance: 12.9, fossils: 200, stomps: 50, roar: 75 }, expected: [12, 200, 50, 75] },
  ])('floors cumulative points for $breakdown', ({ breakdown, expected }) => {
    const score = breakdown.distance + breakdown.fossils + breakdown.stomps + breakdown.roar
    render(<ScoreBreakdown stats={{ ...stats, scoreBreakdown: breakdown, score }} totalLabel="Score" />)
    const values = ['Distance points', 'Fossil points', 'Stomp bonus', 'Roar bonus']
      .map(label => Number(rowValue(label).textContent))
    expect(values).toEqual(expected)
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(Math.floor(score))
    expect(rowValue('Score').textContent).toBe(String(Math.floor(score)))
  })

  it.each(resultStates)('does not render $gameState results while playing', ({ Component }) => {
    mockGame('playing')
    const { container } = render(<Component />)
    expect(container).toBeEmptyDOMElement()
  })
})
