import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { DeleteSessionNoteRequest } from '@/managers/world/WorldRequests'
import type { DeleteResponse } from '@/managers/world/WorldResponses'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(new DeleteSessionNoteRequest(id))) as DeleteResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return new Response(null, { status: 204 })
}
