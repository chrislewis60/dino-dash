import { useGame } from '@/context/GameContext'

export function MainMenu() {
  const { gameState, startGame } = useGame()

  if (gameState !== 'menu') return null

  return (
    <div className="overlay menu-overlay">
      <div className="menu-panel">
        <h1 className="menu-title">
          🦖 Dino Dash
        </h1>
        <p className="menu-subtitle">Extinction Run</p>
        <p className="menu-description">
          Run, jump, and dash your way through prehistoric peril!
          Dodge meteors, lava eruptions, and pterodactyls as extinction
          closes in.
        </p>
        <button className="btn btn-primary" onClick={startGame}>
          Start Game
        </button>
        <div className="controls-info">
          <h3>Controls</h3>
          <ul>
            <li><kbd>Space</kbd> / <kbd>↑</kbd> — Jump (press twice for double-jump)</li>
            <li><kbd>↓</kbd> — Slide</li>
            <li><kbd>Esc</kbd> / <kbd>P</kbd> — Pause</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
