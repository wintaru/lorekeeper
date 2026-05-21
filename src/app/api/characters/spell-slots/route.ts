import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateSpellSlotsRequest } from '@/managers/character/CharacterRequests'
import type { SpellSlot } from '@/types'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateSpellSlotsBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { characterManager } = createContainer()
  const result = await characterManager.execute(
    new UpdateSpellSlotsRequest(body.characterId, body.spellSlots)
  )

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

function isUpdateSpellSlotsBody(value: unknown): value is { characterId: string; spellSlots: SpellSlot[] } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.characterId === 'string' && Array.isArray(v.spellSlots)
}
