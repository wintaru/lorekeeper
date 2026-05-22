import { createServiceClient } from '@/lib/supabase/server'
import { HandlerResolverBuilder } from '@/common/resolver/HandlerResolverBuilder'
import { NotificationAccessor } from '@/accessors/notification/NotificationAccessor'
import { SendPushHandler } from '@/accessors/notification/handlers/SendPushHandler'
import { StoreSubscriptionHandler } from '@/accessors/notification/handlers/StoreSubscriptionHandler'
import { StoreWhisperHandler } from '@/accessors/notification/handlers/StoreWhisperHandler'
import { LoadWhispersHandler } from '@/accessors/notification/handlers/LoadWhispersHandler'
import { SendPushRequest, StoreSubscriptionRequest, StoreWhisperRequest, LoadWhispersRequest } from '@/accessors/notification/NotificationRequests'

export default function createNotificationAccessor() {
  const db = createServiceClient()
  return new NotificationAccessor(
    new HandlerResolverBuilder().register(SendPushRequest, new SendPushHandler()).build(),
    new HandlerResolverBuilder()
      .register(StoreSubscriptionRequest, new StoreSubscriptionHandler(db))
      .register(StoreWhisperRequest, new StoreWhisperHandler(db))
      .build(),
    new HandlerResolverBuilder().register(LoadWhispersRequest, new LoadWhispersHandler(db)).build(),
  )
}
