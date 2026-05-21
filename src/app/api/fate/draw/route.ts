import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { DrawFateRequest } from '@/managers/fate/FateRequests'
import type { DrawFateResponse } from '@/managers/fate/FateResponses'
import type { FateEventType } from '@/types'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isDrawBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { fateManager } = createContainer()
  const result = (await fateManager.execute(
    new DrawFateRequest(body.campaignId, body.eventType, body.excludedCharacterIds ?? [], body.dangerWeighted ?? false)
  )) as DrawFateResponse

  if (!result.success || !result.fateEvent) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ fateEvent: result.fateEvent, pushSent: result.pushSent }, { status: 201 })
}

function isDrawBody(value: unknown): value is {
  campaignId: string
  eventType: FateEventType
  excludedCharacterIds?: string[]
  dangerWeighted?: boolean
} {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.campaignId === 'string' && typeof v.eventType === 'string'
}
