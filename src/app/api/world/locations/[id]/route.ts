import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateLocationRequest, DeleteLocationRequest } from '@/managers/world/WorldRequests'
import type { LocationResponse, DeleteResponse } from '@/managers/world/WorldResponses'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: unknown = await request.json()
  if (!isUpdateLocationBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(
    new UpdateLocationRequest(id, body.visited, body.notes ?? null)
  )) as LocationResponse

  if (!result.success || !result.location) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ location: result.location })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(new DeleteLocationRequest(id))) as DeleteResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return new Response(null, { status: 204 })
}

function isUpdateLocationBody(value: unknown): value is { visited: boolean; notes?: string | null } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.visited === 'boolean'
}
