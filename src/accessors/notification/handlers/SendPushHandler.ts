import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import webpush from 'web-push'
import { SendPushRequest } from '../NotificationRequests'
import { SendPushResponse } from '../NotificationResponses'

webpush.setVapidDetails(
  process.env.VAPID_CONTACT_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export class SendPushHandler implements IHandler {
  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as SendPushRequest

    try {
      await webpush.sendNotification(
        req.subscription as webpush.PushSubscription,
        JSON.stringify({
          title: req.title,
          body: req.body,
          data: req.data ?? {},
        }),
      )
      return new SendPushResponse(req.correlationId, true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Push failed'
      console.error('[SendPushHandler] push failed:', message, err)
      return new SendPushResponse(req.correlationId, false, message)
    }
  }
}
