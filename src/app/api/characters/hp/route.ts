import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { UpdateHpRequest } from '@/managers/character/CharacterRequests'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isUpdateHpBody(body)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { characterManager } = createContainer()
  const result = await characterManager.execute(
    new UpdateHpRequest(body.characterId, body.newHp)
  )

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

function isUpdateHpBody(value: unknown): value is { characterId: string; newHp: number } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.characterId === 'string' && typeof v.newHp === 'number'
}
