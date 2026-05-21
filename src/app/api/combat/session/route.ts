import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { GetCombatSessionRequest } from '@/managers/combat/CombatRequests'
import type { GetCombatSessionResponse } from '@/managers/combat/CombatResponses'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
  }

  const { combatManager } = createContainer()
  const result = (await combatManager.query(
    new GetCombatSessionRequest(campaignId)
  )) as GetCombatSessionResponse

  return NextResponse.json({ session: result.session }, { status: 200 })
}
