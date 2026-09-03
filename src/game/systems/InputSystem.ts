import type { InputState } from '@/types'

const DEFAULT_STATE: InputState = {
  jump: false,
  jumpPressed: false,
  slide: false,
  slidePressed: false,
  moveLeft: false,
  moveRight: false,
  pause: false,
  pausePressed: false,
}

/**
 * InputSystem — tracks keyboard state and exposes a clean InputState snapshot.
 * Attach to the window once; call update() at the start of each game tick
 * to compute edge-triggered (pressed) flags.
 */
export class InputSystem {
  private keys = new Set<string>()
  private prevKeys = new Set<string>()

  private readonly JUMP_KEYS = ['ArrowUp', 'Space', 'KeyW', ' ']
  private readonly SLIDE_KEYS = ['ArrowDown', 'KeyS']
  private readonly MOVE_LEFT_KEYS = ['ArrowLeft', 'KeyA']
  private readonly MOVE_RIGHT_KEYS = ['ArrowRight', 'KeyD']
  private readonly PAUSE_KEYS = ['Escape', 'KeyP']

  constructor() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code)
    this.keys.add(e.key)
    // Prevent default for game keys to stop page scrolling
    const gameKeys = [
      ...this.JUMP_KEYS,
      ...this.SLIDE_KEYS,
      ...this.MOVE_LEFT_KEYS,
      ...this.MOVE_RIGHT_KEYS,
    ]
    if (gameKeys.includes(e.code) || gameKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code)
    this.keys.delete(e.key)
  }

  /** Must be called once per tick BEFORE reading getState(). Advances edge detection. */
  update(): void {
    this.prevKeys = new Set(this.keys)
  }

  /** Commit post-tick — records current state as previous for next frame */
  commitFrame(): void {
    this.prevKeys = new Set(this.keys)
  }

  private isDown(keys: string[]): boolean {
    return keys.some(k => this.keys.has(k))
  }

  private wasDown(keys: string[]): boolean {
    return keys.some(k => this.prevKeys.has(k))
  }

  /** Returns a fresh snapshot of the current input state */
  getState(): InputState {
    const jump = this.isDown(this.JUMP_KEYS)
    const slide = this.isDown(this.SLIDE_KEYS)
    const moveLeft = this.isDown(this.MOVE_LEFT_KEYS)
    const moveRight = this.isDown(this.MOVE_RIGHT_KEYS)
    const pause = this.isDown(this.PAUSE_KEYS)
    return {
      jump,
      jumpPressed: jump && !this.wasDown(this.JUMP_KEYS),
      slide,
      slidePressed: slide && !this.wasDown(this.SLIDE_KEYS),
      moveLeft,
      moveRight,
      pause,
      pausePressed: pause && !this.wasDown(this.PAUSE_KEYS),
    }
  }

  /** Add touch support: swipe-up = jump, swipe-down = slide */
  attachTouchListeners(canvas: HTMLCanvasElement): void {
    let touchStartY = 0
    canvas.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0]?.clientY ?? 0
      e.preventDefault()
    }, { passive: false })
    canvas.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0]?.clientY ?? 0
      const delta = touchStartY - endY
      if (delta > 30) this.keys.add('ArrowUp')
      else if (delta < -30) this.keys.add('ArrowDown')
      // Auto-clear after one frame
      setTimeout(() => {
        this.keys.delete('ArrowUp')
        this.keys.delete('ArrowDown')
      }, 50)
      e.preventDefault()
    }, { passive: false })
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  /** Return a safe default state (useful in menu/paused screens) */
  static defaultState(): InputState {
    return { ...DEFAULT_STATE }
  }
}
