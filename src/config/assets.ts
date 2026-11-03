export const BACKGROUND_IMAGES = {
  JURASSIC_JUNGLE:
    '/chrislewis60_create_a_background_for_a_platform_game_involving__e457c491-6959-4161-9888-58ac73e45a91.png',
} as const

export const COLLECTABLE_ICONS = {
  fossil: { source: '/icons/fossil.svg', colour: '#f5ce73' },
  egg: { source: '/icons/egg.svg', colour: '#fff0b5' },
  shield: { source: '/icons/shield.svg', colour: '#67e5ff' },
  sprint: { source: '/icons/sprint.svg', colour: '#ffdb57' },
  magnet: { source: '/icons/magnet.svg', colour: '#e5a0ff' },
  roar: { source: '/icons/roar.svg', colour: '#ffab65' },
} as const

export const HAZARD_ICONS = {
  meteor: { source: '/icons/meteor.svg', colour: '#ffab65' },
  lavaVent: { source: '/icons/lavaVent.svg', colour: '#ff7957' },
  pterodactyl: { source: '/icons/pterodactyl.svg', colour: '#dba0f5' },
  spikePit: { source: '/icons/spikePit.svg', colour: '#d5d7dc' },
} as const

export const GAME_ICONS = { ...COLLECTABLE_ICONS, ...HAZARD_ICONS } as const

export const GAME_ICON_LAYOUT = {
  SCALE: 1.5,
  GROUND_ANCHORED_TYPES: ['lavaVent', 'spikePit'],
} as const
