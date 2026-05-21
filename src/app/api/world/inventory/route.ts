import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { GetInventoryRequest, UpdateInventoryRequest } from '@/managers/world/WorldRequests'
import type { GetInventoryResponse, DeleteResponse } from '@/managers/world/WorldResponses'
import type { InventoryItem } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')
  if (!campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })

  const { worldManager } = createContainer()
  const result = (await worldManager.query(new GetInventoryRequest(campaignId))) as GetInventoryResponse

  return NextResponse.json({ gold: result.gold, sharedItems: result.sharedItems })
}

export async function PUT(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateInventoryBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(
    new UpdateInventoryRequest(body.campaignId, body.gold, body.sharedItems)
  )) as DeleteResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

function isUpdateInventoryBody(value: unknown): value is {
  campaignId: string
  gold: number
  sharedItems: InventoryItem[]
} {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.campaignId === 'string' && typeof v.gold === 'number' && Array.isArray(v.sharedItems)
}
