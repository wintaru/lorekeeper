import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { GetPendingFateRequest } from '@/managers/fate/FateRequests'
import type { GetFateLogResponse } from '@/managers/fate/FateResponses'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')
  if (!campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })

  const { fateManager } = createContainer()
  const result = (await fateManager.query(new GetPendingFateRequest(campaignId))) as GetFateLogResponse

  return NextResponse.json({ event: result.events[0] ?? null })
}
