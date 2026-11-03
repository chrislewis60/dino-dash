const MAX_LIVES = 5

export const PLAYER_HEALTH = {
  MAX_LIVES,
  INITIAL_LIVES: MAX_LIVES,
} as const

export const SCORING = {
  DISTANCE_PER_PIXEL: 0.05,
  FOSSIL: 50,
  STOMP: 200,
  ROAR_PER_HAZARD: 150,
} as const

export const STOMP = {
  BOUNCE_VELOCITY: -400,
} as const