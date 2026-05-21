import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { RevealFateRequest } from '@/managers/fate/FateRequests'
import type { RevealFateResponse } from '@/managers/fate/FateResponses'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isRevealBody(body)) {
    return NextResponse.json({ error: 'fateEventId is required' }, { status: 400 })
  }

  const { fateManager } = createContainer()
  const result = (await fateManager.execute(
    new RevealFateRequest(body.fateEventId)
  )) as RevealFateResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ fateEvent: result.fateEvent })
}

function isRevealBody(value: unknown): value is { fateEventId: string } {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).fateEventId === 'string'
}
