import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateMapAccessRequest } from '@/managers/world/WorldRequests'
import type { DeleteResponse } from '@/managers/world/WorldResponses'
import type { MapViewport } from '@/types'

export async function PUT(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateMapAccessBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(
    new UpdateMapAccessRequest(
      body.campaignId,
      body.mapAccessGranted,
      body.sharedMapIds,
      body.mapViewport ?? null,
    )
  )) as DeleteResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

function isUpdateMapAccessBody(value: unknown): value is {
  campaignId: string
  mapAccessGranted: boolean
  sharedMapIds: string[]
  mapViewport?: MapViewport | null
} {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.campaignId === 'string' &&
    typeof v.mapAccessGranted === 'boolean' &&
    Array.isArray(v.sharedMapIds)
  )
}
