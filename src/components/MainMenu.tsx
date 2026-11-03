import { useGame } from '@/context/GameContext'
import { GAME_KEY } from '@/config/gameKey'
import { BACKGROUND_IMAGES, DINOSAUR_ARTWORK } from '@/config/assets'

export function MainMenu() {
  const { gameState, startGame } = useGame()

  function handleStartGame() {
    startGame()
  }

  function handleStartLevelTwo() {
    startGame(2)
  }

  function handleStartLevelThree() {
    startGame(3)
  }

  if (gameState !== 'menu') return null

  return (
    <div className="overlay menu-overlay">
      <img
        className="menu-background"
        src={BACKGROUND_IMAGES.JURASSIC_JUNGLE}
        alt=""
        aria-hidden="true"
      />
      <div className="menu-panel main-menu-panel">
        <h1 className="menu-title">
          {DINOSAUR_ARTWORK.GLYPH} Dino Dash
        </h1>
        <p className="menu-subtitle">Extinction Run</p>
        <div className="menu-start-actions">
          <button className="btn btn-primary" onClick={handleStartGame}>
            Start Game
          </button>
          <button className="btn btn-primary" onClick={handleStartLevelTwo}>
            Level 2
          </button>
          <button className="btn btn-primary" onClick={handleStartLevelThree}>
            Level 3
          </button>
        </div>
        <section className="game-key" aria-labelledby="game-key-heading">
          <h2 id="game-key-heading">Game Details</h2>
          <div className="game-key-groups">
            <GameKeyGroup title="Collect" items={GAME_KEY.COLLECT} />
            <GameKeyGroup title="Avoid" items={GAME_KEY.AVOID} />
            <div className="controls-info">
              <h3>Controls</h3>
              <ul aria-label="Controls">
                <li><kbd>Space</kbd> / <kbd>↑</kbd><br />Jump / double-jump</li>
                <li><kbd>←</kbd> / <kbd>→</kbd><br />Move left / right</li>
                <li><kbd>↓</kbd><br />Slide</li>
                <li><kbd>Esc</kbd> / <kbd>P</kbd><br />Pause</li>
              </ul>
            </div>
          </div>
        </section>
        <p className="icon-credits">
          Icons by <a href="https://game-icons.net/">Lorc &amp; Delapouite / Game-icons.net</a>
          {' '}under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>
          {' '}(recoloured).
        </p>
      </div>
    </div>
  )
}

interface GameKeyGroupProps {
  readonly title: string
  readonly items: ReadonlyArray<{
    id: string
    label: string
    detail: string
    colour: string
    source: string
  }>
}

function GameKeyGroup({ title, items }: GameKeyGroupProps) {
  return (
    <div className="game-key-group">
      <h3>{title}</h3>
      <ul aria-label={title}>
        {items.map((item) => (
          <li key={item.id}>
            <span className="game-key-swatch" aria-hidden="true">
              <img className="collectable-icon game-key-collectable" src={item.source} alt="" />
            </span>
            <span className="game-key-label">
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
