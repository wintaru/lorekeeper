import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { SubmitInitiativeRollRequest } from '@/managers/combat/CombatRequests'
import type { SubmitInitiativeRollResponse } from '@/managers/combat/CombatResponses'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isSubmitBody(body)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { combatManager } = createContainer()
  const result = (await combatManager.execute(
    new SubmitInitiativeRollRequest(body.campaignId, body.characterId, body.roll)
  )) as SubmitInitiativeRollResponse

  if (!result.success) return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  return NextResponse.json({ ok: true })
}

function isSubmitBody(value: unknown): value is { campaignId: string; characterId: string; roll: number } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.campaignId === 'string' && typeof v.characterId === 'string' && typeof v.roll === 'number'
}
