import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HUD } from '@/components/HUD'
import { MainMenu } from '@/components/MainMenu'
import { PauseScreen } from '@/components/PauseScreen'
import { GameProvider, useGame } from '@/context/GameContext'

vi.mock('@/canvas/CanvasRenderer', () => ({
  CanvasRenderer: class {
    render = vi.fn()
  },
}))

function GameShell() {
  const { canvasRef } = useGame()
  return (
    <>
      <canvas ref={canvasRef} />
      <HUD />
      <MainMenu />
      <PauseScreen />
    </>
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('starting levels', () => {
  it('immediately shows level 2 with full health and resets to level 1 on normal start', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    render(<GameProvider><GameShell /></GameProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Level 2' }))
    expect(screen.getByText('Volcanic Badlands')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Health 100%' })).toHaveValue(100)
    expect(screen.getByRole('progressbar', { name: 'Level Progress 0%' })).toHaveValue(0)

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quit to Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(screen.getByText('Jurassic Jungle')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Health 100%' })).toHaveValue(100)
  })
})
