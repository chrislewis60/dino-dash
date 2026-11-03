import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HUD } from '@/components/HUD'
import { useGame } from '@/context/GameContext'
import { LEVELS } from '@/game/levels'

vi.mock('@/context/GameContext', () => ({ useGame: vi.fn() }))

describe('HUD', () => {
  it.each([
    { lives: 3, elapsed: 90_000, health: 60, progress: 50 },
    { lives: 0, elapsed: 0, health: 0, progress: 0 },
    { lives: 5, elapsed: 180_000, health: 100, progress: 100 },
    { lives: 8, elapsed: 200_000, health: 100, progress: 100 },
  ])('shows health $health% and progress $progress%', ({ lives, elapsed, health, progress }) => {
    const togglePause = vi.fn()
    vi.mocked(useGame).mockReturnValue({
      gameState: 'playing',
      stats: {
        score: 0, lives, level: 1, distance: 0, fossils: 0,
        enemiesStomped: 0, levelElapsedMs: elapsed, activeLevel: LEVELS[0],
      },
      canvasRef: { current: null },
      startGame: vi.fn(), togglePause, proceedToNextLevel: vi.fn(), returnToMenu: vi.fn(),
    })
    render(<HUD />)
    expect(screen.getByRole('progressbar', { name: `Health ${health}%` })).toHaveAttribute('value', String(health))
    expect(screen.getByRole('progressbar', { name: `Level Progress ${progress}%` })).toHaveAttribute('value', String(progress))
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(togglePause).toHaveBeenCalledOnce()
  })
})