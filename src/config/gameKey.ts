import { COLLECTABLE_ICONS, HAZARD_ICONS } from '@/config/assets'

export const GAME_COLOURS = {
  SPIKES: HAZARD_ICONS.spikePit.colour,
} as const

export const GAME_KEY = {
  COLLECT: [
    { id: 'fossil', label: 'Fossils', detail: '50 points', ...COLLECTABLE_ICONS.fossil, symbol: '' },
    { id: 'egg', label: 'Eggs', detail: 'Restore a life', ...COLLECTABLE_ICONS.egg, symbol: '' },
    { id: 'shield', label: 'Shield', detail: 'Temporary protection', ...COLLECTABLE_ICONS.shield, symbol: '' },
    { id: 'sprint', label: 'Sprint', detail: 'Speed boost', ...COLLECTABLE_ICONS.sprint, symbol: '' },
    { id: 'magnet', label: 'Magnet', detail: 'Pull in nearby fossils and eggs', ...COLLECTABLE_ICONS.magnet, symbol: '' },
    { id: 'roar', label: 'Roar', detail: 'Clear nearby hazards', ...COLLECTABLE_ICONS.roar, symbol: '' },
  ],
  AVOID: [
    { id: 'meteor', label: 'Meteors', detail: 'Falling fireballs', ...HAZARD_ICONS.meteor, symbol: '' },
    { id: 'lavaVent', label: 'Lava vents', detail: 'Erupting lava', ...HAZARD_ICONS.lavaVent, symbol: '' },
    { id: 'pterodactyl', label: 'Pterodactyls', detail: 'Diving enemies', ...HAZARD_ICONS.pterodactyl, symbol: '' },
    { id: 'spikePit', label: 'Spikes', detail: 'Sharp ground hazards', ...HAZARD_ICONS.spikePit, symbol: '' },
  ],
} as const