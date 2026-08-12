import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import type { GameStats, GameState } from '@/types'
import { GameEngine } from '@/game/GameEngine'

interface GameContextValue {
  stats: GameStats
  gameState: GameState
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  startGame: () => void
  togglePause: () => void
  proceedToNextLevel: () => void
  returnToMenu: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

const INITIAL_STATS: GameStats = {
  score: 0,
  lives: 3,
  level: 1,
  distance: 0,
  fossils: 0,
  enemiesStomped: 0,
  activeLevel: null,
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS)
  const [gameState, setGameState] = useState<GameState>('menu')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)

  // Keep gameState in sync with engine's state machine
  const handleStatsChange = useCallback((updated: GameStats) => {
    setStats(updated)
  }, [])

  // Sync state machine state to React state
  const syncState = useCallback(() => {
    if (engineRef.current) {
      setGameState(engineRef.current.stateMachine.state)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new GameEngine(canvas, (updated) => {
      handleStatsChange(updated)
      // Sync state machine after each stats update
      setGameState(engine.stateMachine.state)
    })
    engineRef.current = engine

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [handleStatsChange])

  const startGame = useCallback(() => {
    engineRef.current?.startGame()
    syncState()
    setStats(INITIAL_STATS)
    setGameState('playing')
  }, [syncState])

  const togglePause = useCallback(() => {
    engineRef.current?.togglePause()
    syncState()
  }, [syncState])

  const proceedToNextLevel = useCallback(() => {
    engineRef.current?.proceedToNextLevel()
    syncState()
  }, [syncState])

  const returnToMenu = useCallback(() => {
    engineRef.current?.returnToMenu()
    setGameState('menu')
    setStats(INITIAL_STATS)
  }, [])

  return (
    <GameContext.Provider value={{
      stats,
      gameState,
      canvasRef,
      startGame,
      togglePause,
      proceedToNextLevel,
      returnToMenu,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
