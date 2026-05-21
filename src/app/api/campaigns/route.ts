import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { CreateCampaignRequest } from '@/managers/campaign/CampaignRequests'
import type { CreateCampaignResponse } from '@/managers/campaign/CampaignResponses'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isCreateBody(body)) {
    return NextResponse.json({ error: 'dmPin is required' }, { status: 400 })
  }

  const { campaignManager } = createContainer()
  const result = (await campaignManager.execute(
    new CreateCampaignRequest(body.dmPin)
  )) as CreateCampaignResponse

  if (!result.success || !result.campaign) {
    return NextResponse.json({ error: result.errorMessage }, { status: 500 })
  }

  return NextResponse.json({ campaign: result.campaign }, { status: 201 })
}

function isCreateBody(value: unknown): value is { dmPin: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dmPin' in value &&
    typeof (value as Record<string, unknown>).dmPin === 'string'
  )
}
