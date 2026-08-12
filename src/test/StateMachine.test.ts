import { describe, it, expect } from 'vitest'
import { StateMachine } from '@/game/StateMachine'

describe('StateMachine', () => {
  it('starts in menu state', () => {
    const sm = new StateMachine()
    expect(sm.state).toBe('menu')
  })

  it('transitions from menu to playing', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    expect(sm.state).toBe('playing')
  })

  it('transitions from playing to paused', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('paused')
    expect(sm.state).toBe('paused')
  })

  it('transitions from paused back to playing', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('paused')
    sm.transition('playing')
    expect(sm.state).toBe('playing')
  })

  it('transitions from playing to gameOver', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('gameOver')
    expect(sm.state).toBe('gameOver')
  })

  it('transitions from playing to levelComplete', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('levelComplete')
    expect(sm.state).toBe('levelComplete')
  })

  it('rejects invalid transitions', () => {
    const sm = new StateMachine()
    sm.transition('gameOver')  // invalid from menu
    expect(sm.state).toBe('menu')
  })

  it('rejects paused → gameOver (invalid)', () => {
    const sm = new StateMachine()
    sm.transition('playing')
    sm.transition('paused')
    sm.transition('gameOver')  // not allowed from paused
    expect(sm.state).toBe('paused')
  })

  it('fires onEnter and onExit handlers', () => {
    const sm = new StateMachine()
    let entered = false
    let exited = false
    sm.on('playing', { onEnter: () => { entered = true } })
    sm.on('menu', { onExit: () => { exited = true } })
    sm.transition('playing')
    expect(entered).toBe(true)
    expect(exited).toBe(true)
  })
})
