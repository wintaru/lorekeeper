import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { EndCombatRequest } from '@/managers/combat/CombatRequests'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isEndBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { combatManager } = createContainer()
  const result = await combatManager.execute(new EndCombatRequest(body.campaignId))

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

function isEndBody(value: unknown): value is { campaignId: string } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.campaignId === 'string'
}
