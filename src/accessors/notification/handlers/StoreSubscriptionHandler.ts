import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreSubscriptionRequest } from '../NotificationRequests'
import { StoreSubscriptionResponse } from '../NotificationResponses'

export class StoreSubscriptionHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreSubscriptionRequest
    const { error } = await this.db
      .from('characters')
      .update({ push_subscription: req.subscription })
      .eq('id', req.characterId)

    if (error) {
      return new StoreSubscriptionResponse(req.correlationId, false, error.message)
    }
    return new StoreSubscriptionResponse(req.correlationId, true)
  }
}
