import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveMapRequest } from '../WorldRequests'
import { RemoveMapResponse } from '../WorldResponses'

export class RemoveMapHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveMapRequest

    // Remove storage file first; don't block on storage error
    await this.db.storage.from('campaign-maps').remove([req.storagePath])

    const { error } = await this.db
      .from('campaign_maps')
      .delete()
      .eq('id', req.mapId)

    if (error) {
      return new RemoveMapResponse(req.correlationId, false, error.message)
    }

    return new RemoveMapResponse(req.correlationId, true)
  }
}
