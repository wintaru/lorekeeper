import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateMapAccessRequest } from '../WorldRequests'
import { UpdateMapAccessResponse } from '../WorldResponses'

export class UpdateMapAccessHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateMapAccessRequest
    const { error } = await this.db
      .from('campaigns')
      .update({
        map_access_granted: req.mapAccessGranted,
        shared_map_ids: req.sharedMapIds,
        map_viewport: req.mapViewport,
      })
      .eq('id', req.campaignId)

    if (error) {
      return new UpdateMapAccessResponse(req.correlationId, false, error.message)
    }

    return new UpdateMapAccessResponse(req.correlationId, true)
  }
}
