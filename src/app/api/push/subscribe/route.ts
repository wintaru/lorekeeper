import { NextResponse } from 'next/server'
import { StoreSubscriptionRequest } from '@/accessors/notification/NotificationRequests'
import type { StoreSubscriptionResponse } from '@/accessors/notification/NotificationResponses'

export async function POST(request: Request) {
  const body: unknown = await request.json()
  if (!isSubscribeBody(body)) {
    return NextResponse.json({ error: 'characterId and subscription are required' }, { status: 400 })
  }

  const { default: createNotificationAccessor } = await import('@/lib/createNotificationAccessor')
  const notificationAccessor = createNotificationAccessor()

  const result = (await notificationAccessor.store(
    new StoreSubscriptionRequest(body.characterId, body.subscription)
  )) as StoreSubscriptionResponse

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function isSubscribeBody(value: unknown): value is { characterId: string; subscription: PushSubscriptionJSON } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.characterId === 'string' && typeof v.subscription === 'object' && v.subscription !== null
}
