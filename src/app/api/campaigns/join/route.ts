import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { JoinCampaignRequest } from '@/managers/campaign/CampaignRequests'
import type { JoinCampaignResponse } from '@/managers/campaign/CampaignResponses'
import type { AbilityScores } from '@/types'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isJoinBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { campaignManager } = createContainer()
  const result = (await campaignManager.execute(
    new JoinCampaignRequest(
      body.campaignCode,
      body.playerName,
      body.characterName,
      body.characterClass,
      body.level,
      body.maxHp,
      body.armorClass,
      body.spellSlots ?? [],
      {
        race: body.race,
        background: body.background,
        abilityScores: body.abilityScores,
        speed: body.speed,
        passivePerception: body.passivePerception,
        personalityTraits: body.personalityTraits,
        ideals: body.ideals,
        bonds: body.bonds,
        flaws: body.flaws,
        backstory: body.backstory,
      },
    )
  )) as JoinCampaignResponse

  if (!result.success || !result.character || !result.campaign) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ character: result.character, campaign: result.campaign }, { status: 201 })
}

function isJoinBody(value: unknown): value is {
  campaignCode: string
  playerName: string
  characterName: string
  characterClass: string
  level: number
  maxHp: number
  armorClass: number
  spellSlots?: []
  race?: string
  background?: string
  abilityScores?: AbilityScores
  speed?: number
  passivePerception?: number
  personalityTraits?: string
  ideals?: string
  bonds?: string
  flaws?: string
  backstory?: string
} {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.campaignCode === 'string' &&
    typeof v.playerName === 'string' &&
    typeof v.characterName === 'string' &&
    typeof v.characterClass === 'string' &&
    typeof v.level === 'number' &&
    typeof v.maxHp === 'number' &&
    typeof v.armorClass === 'number'
  )
}
