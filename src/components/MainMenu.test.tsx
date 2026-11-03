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
        scoreBreakdown: { distance: 0, fossils: 0, stomps: 0, roar: 0 },
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
    const icons = collect.querySelectorAll('img')
    expect(icons).toHaveLength(GAME_KEY.COLLECT.length)
    GAME_KEY.COLLECT.forEach((item, index) => {
      expect(icons[index]).toHaveAttribute('src', item.source)
      expect(icons[index]).toHaveAttribute('alt', '')
    })
    const hazardIcons = avoid.querySelectorAll('img')
    expect(hazardIcons).toHaveLength(GAME_KEY.AVOID.length)
    GAME_KEY.AVOID.forEach((item, index) => {
      expect(hazardIcons[index]).toHaveAttribute('src', item.source)
      expect(hazardIcons[index]).toHaveAttribute('alt', '')
    })
    expect(screen.getByRole('link', { name: 'Lorc & Delapouite / Game-icons.net' })).toHaveAttribute(
      'href', 'https://game-icons.net/'
    )
    expect(screen.getByRole('link', { name: 'CC BY 3.0' })).toHaveAttribute(
      'href', 'https://creativecommons.org/licenses/by/3.0/'
    )
    for (const item of [...GAME_KEY.COLLECT, ...GAME_KEY.AVOID]) {
      expect(within(key).getByText(item.label)).toBeInTheDocument()
      expect(within(key).getByText(item.detail)).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(startGame).toHaveBeenCalledOnce()
    expect(startGame).toHaveBeenLastCalledWith()

    fireEvent.click(screen.getByRole('button', { name: 'Level 2' }))
    expect(startGame).toHaveBeenCalledTimes(2)
    expect(startGame).toHaveBeenLastCalledWith(2)
  })
})