export const GAME_COLOURS = {
  SPIKES: '#d5d7dc',
} as const

export const GAME_KEY = {
  COLLECT: [
    { id: 'fossil', label: 'Fossils', detail: '50 points', colour: '#d4a843', symbol: '' },
    { id: 'egg', label: 'Eggs', detail: 'Restore a life', colour: '#e8d44d', symbol: '' },
    { id: 'shield', label: 'Shield', detail: 'Temporary protection', colour: '#00ccff', symbol: '\u{1F6E1}' },
    { id: 'sprint', label: 'Sprint', detail: 'Speed boost', colour: '#ffcc00', symbol: '\u26A1' },
    { id: 'magnet', label: 'Magnet', detail: 'Pull in nearby fossils and eggs', colour: '#cc66ff', symbol: '\u{1F9F2}' },
    { id: 'roar', label: 'Roar', detail: 'Clear nearby hazards', colour: '#ff6600', symbol: '\u{1F996}' },
  ],
  AVOID: [
    { id: 'meteor', label: 'Meteors', detail: 'Falling fireballs', colour: '#cc3300', symbol: '' },
    { id: 'lavaVent', label: 'Lava vents', detail: 'Erupting lava', colour: '#cc3300', symbol: '' },
    { id: 'pterodactyl', label: 'Pterodactyls', detail: 'Diving enemies', colour: '#664422', symbol: '' },
    { id: 'spikePit', label: 'Spikes', detail: 'Sharp ground hazards', colour: GAME_COLOURS.SPIKES, symbol: '' },
  ],
} as const