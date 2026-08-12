import type { GameState } from '@/types'

type StateHandler = {
  onEnter?: () => void
  onExit?: () => void
}

/**
 * StateMachine — manages GameState transitions.
 * Validates allowed transitions so invalid state jumps are caught early.
 */
export class StateMachine {
  private _state: GameState = 'menu'
  private handlers = new Map<GameState, StateHandler>()

  // Valid transitions: from → allowed destinations
  private static readonly TRANSITIONS: Record<GameState, GameState[]> = {
    menu: ['playing'],
    playing: ['paused', 'levelComplete', 'gameOver'],
    paused: ['playing', 'menu'],
    levelComplete: ['playing', 'menu'],
    gameOver: ['menu'],
  }

  get state(): GameState {
    return this._state
  }

  /** Register optional enter/exit callbacks for a state */
  on(state: GameState, handler: StateHandler): this {
    this.handlers.set(state, handler)
    return this
  }

  transition(next: GameState): void {
    const allowed = StateMachine.TRANSITIONS[this._state]
    if (!allowed.includes(next)) {
      console.warn(`[StateMachine] Invalid transition: ${this._state} → ${next}`)
      return
    }
    this.handlers.get(this._state)?.onExit?.()
    this._state = next
    this.handlers.get(next)?.onEnter?.()
  }

  is(state: GameState): boolean {
    return this._state === state
  }
}
