import { NextResponse } from 'next/server'
import createNotificationAccessor from '@/lib/createNotificationAccessor'
import { LoadWhispersRequest } from '@/accessors/notification/NotificationRequests'
import type { LoadWhispersResponse } from '@/accessors/notification/NotificationResponses'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get('characterId')
  if (!characterId) {
    return NextResponse.json({ error: 'characterId required' }, { status: 400 })
  }

  const notificationAccessor = createNotificationAccessor()
  const result = (await notificationAccessor.load(
    new LoadWhispersRequest(characterId)
  )) as LoadWhispersResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 500 })
  }

  return NextResponse.json({ whispers: result.whispers })
}
