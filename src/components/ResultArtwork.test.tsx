import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GameOver } from '@/components/GameOver'
import { LevelComplete } from '@/components/LevelComplete'
import { COLLECTABLE_ICONS } from '@/config/assets'
import { useGame } from '@/context/GameContext'
import type { GameState } from '@/types'

vi.mock('@/context/GameContext', () => ({ useGame: vi.fn() }))

describe('result artwork', () => {
  it.each([
    { gameState: 'gameOver', Component: GameOver },
    { gameState: 'levelComplete', Component: LevelComplete },
  ] satisfies { gameState: GameState; Component: typeof GameOver }[])(
    'shows the matching fossil icon and count on $gameState',
    ({ gameState, Component }) => {
      vi.mocked(useGame).mockReturnValue({
        gameState,
        stats: {
          scoreBreakdown: { distance: 100, fossils: 400, stomps: 0, roar: 0 },
          score: 500, lives: 3, level: 1, distance: 100, fossils: 7,
          enemiesStomped: 0, levelElapsedMs: 0, activeLevel: null,
        },
        canvasRef: { current: null },
        startGame: vi.fn(),
        togglePause: vi.fn(),
        proceedToNextLevel: vi.fn(),
        returnToMenu: vi.fn(),
      })
      render(<Component />)
      const count = screen.getByText('7')
      expect(count.querySelector('img')).toHaveAttribute('src', COLLECTABLE_ICONS.fossil.source)
      expect(count.querySelector('img')).toHaveAttribute('alt', '')
    }
  )
})
