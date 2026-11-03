import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MainMenu } from '@/components/MainMenu'
import { GAME_KEY } from '@/config/gameKey'
import { useGame } from '@/context/GameContext'

vi.mock('@/context/GameContext', () => ({
  useGame: vi.fn(),
}))

describe('MainMenu', () => {
  it('shows what to collect and avoid and still starts the game', () => {
    const startGame = vi.fn()
    vi.mocked(useGame).mockReturnValue({
      gameState: 'menu',
      startGame,
      stats: {
        score: 0,
        lives: 3,
        level: 1,
        distance: 0,
        fossils: 0,
        enemiesStomped: 0,
        levelElapsedMs: 0,
        activeLevel: null,
      },
      canvasRef: { current: null },
      togglePause: vi.fn(),
      proceedToNextLevel: vi.fn(),
      returnToMenu: vi.fn(),
    })
    render(<MainMenu />)

    const key = screen.getByRole('region', { name: 'Game Details' })
    const collect = within(key).getByRole('list', { name: 'Collect' })
    const avoid = within(key).getByRole('list', { name: 'Avoid' })
    const controls = within(key).getByRole('list', { name: 'Controls' })
    expect(within(controls).getAllByRole('listitem')).toHaveLength(4)
    expect(within(controls).getByText(/Jump \/ double-jump/)).toBeInTheDocument()
    expect(within(collect).getAllByRole('listitem')).toHaveLength(GAME_KEY.COLLECT.length)
    expect(within(avoid).getAllByRole('listitem')).toHaveLength(GAME_KEY.AVOID.length)
    for (const item of [...GAME_KEY.COLLECT, ...GAME_KEY.AVOID]) {
      expect(within(key).getByText(item.label)).toBeInTheDocument()
      expect(within(key).getByText(item.detail)).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(startGame).toHaveBeenCalledOnce()
  })
})