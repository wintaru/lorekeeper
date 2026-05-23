import { NextResponse } from 'next/server'
import { createContainer } from '@/container/DependencyContainer'
import { KickPlayerRequest } from '@/managers/character/CharacterRequests'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isKickBody(body)) {
    return NextResponse.json({ error: 'characterId is required' }, { status: 400 })
  }

  const { characterManager } = createContainer()
  const result = await characterManager.execute(new KickPlayerRequest(body.characterId))

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}

function isKickBody(value: unknown): value is { characterId: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'characterId' in value &&
    typeof (value as Record<string, unknown>).characterId === 'string'
  )
}
