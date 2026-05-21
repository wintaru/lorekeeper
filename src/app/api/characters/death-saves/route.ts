import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateDeathSavesRequest } from '@/managers/character/CharacterRequests'
import type { DeathSaves } from '@/types'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateDeathSavesBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { characterManager } = createContainer()
  const result = await characterManager.execute(
    new UpdateDeathSavesRequest(body.characterId, body.deathSaves)
  )

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

function isUpdateDeathSavesBody(value: unknown): value is { characterId: string; deathSaves: DeathSaves } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.characterId !== 'string') return false
  if (typeof v.deathSaves !== 'object' || v.deathSaves === null) return false
  const ds = v.deathSaves as Record<string, unknown>
  return typeof ds.successes === 'number' && typeof ds.failures === 'number'
}
