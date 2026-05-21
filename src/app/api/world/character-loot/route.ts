import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateCharacterLootRequest } from '@/managers/world/WorldRequests'
import type { DeleteResponse } from '@/managers/world/WorldResponses'
import type { LootItem } from '@/types'

export async function PUT(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateLootBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { worldManager } = createContainer()
  const result = (await worldManager.execute(
    new UpdateCharacterLootRequest(body.characterId, body.loot)
  )) as DeleteResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

function isUpdateLootBody(value: unknown): value is { characterId: string; loot: LootItem[] } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.characterId === 'string' && Array.isArray(v.loot)
}
