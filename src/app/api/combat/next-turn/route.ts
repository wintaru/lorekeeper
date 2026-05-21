import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { NextTurnRequest } from '@/managers/combat/CombatRequests'
import type { NextTurnResponse } from '@/managers/combat/CombatResponses'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isNextTurnBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { combatManager } = createContainer()
  const result = (await combatManager.execute(
    new NextTurnRequest(
      body.sessionId,
      body.currentTurnIndex,
      body.initiativeOrderLength,
      body.roundNumber,
    )
  )) as NextTurnResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ session: result.session }, { status: 200 })
}

function isNextTurnBody(value: unknown): value is {
  sessionId: string
  currentTurnIndex: number
  initiativeOrderLength: number
  roundNumber: number
} {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.sessionId === 'string' &&
    typeof v.currentTurnIndex === 'number' &&
    typeof v.initiativeOrderLength === 'number' &&
    typeof v.roundNumber === 'number'
  )
}
