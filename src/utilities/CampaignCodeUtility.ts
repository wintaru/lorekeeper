const ADJECTIVES = [
  'WOLF', 'IRON', 'DARK', 'GOLD', 'BONE', 'MIST', 'STORM', 'FROST',
  'EMBER', 'STONE', 'BLADE', 'CROW', 'ASH', 'VEIL', 'DUSK', 'TIDE',
]

const NOUNS = [
  'KEEP', 'PACT', 'GATE', 'RUNE', 'MARK', 'SEAL', 'WARD', 'OATH',
  'TOMB', 'VALE', 'PEAK', 'RIFT', 'MAZE', 'DEEP', 'LAIR', 'HOLD',
]

export class CampaignCodeUtility {
  static generate(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const number = Math.floor(Math.random() * 90) + 10  // 10–99
    return `${adjective}-${noun}-${number}`
  }
}
