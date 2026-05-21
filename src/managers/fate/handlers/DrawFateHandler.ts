import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IFateEngine } from '@/engines/fate/IFateEngine'
import type { IFateAccessor } from '@/accessors/fate/IFateAccessor'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import type { INotificationAccessor } from '@/accessors/notification/INotificationAccessor'
import { SelectTargetRequest } from '@/engines/fate/FateEngineRequests'
import { SelectTargetResponse } from '@/engines/fate/FateEngineResponses'
import { StoreFateEventRequest } from '@/accessors/fate/FateRequests'
import { StoreFateEventResponse } from '@/accessors/fate/FateResponses'
import { LoadRosterRequest } from '@/accessors/character/CharacterRequests'
import { LoadRosterResponse } from '@/accessors/character/CharacterResponses'
import { SendPushRequest } from '@/accessors/notification/NotificationRequests'
import { DrawFateRequest } from '../FateRequests'
import { DrawFateResponse } from '../FateResponses'
import type { FatePoolEntry } from '@/types'

const EVENT_LABELS: Record<string, string> = {
  attack:   'An attack is coming',
  curse:    'A curse has been cast',
  windfall: 'Fortune smiles on someone',
  betrayal: 'Trust is about to be broken',
  mystery:  'The fates have chosen you',
}

export class DrawFateHandler implements IHandler {
  constructor(
    private readonly fateEngine: IFateEngine,
    private readonly fateAccessor: IFateAccessor,
    private readonly characterAccessor: ICharacterAccessor,
    private readonly notificationAccessor: INotificationAccessor,
  ) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DrawFateRequest

    // Load active roster
    const rosterResult = (await this.characterAccessor.load(
      new LoadRosterRequest(req.campaignId)
    )) as LoadRosterResponse

    if (!rosterResult.success || rosterResult.characters.length === 0) {
      return new DrawFateResponse(req.correlationId, null, false, 'No active characters in campaign')
    }

    // Build weighted pool, excluding opted-out characters
    const pool: FatePoolEntry[] = rosterResult.characters
      .filter(c => !req.excludedCharacterIds.includes(c.id))
      .map(c => ({
        characterId: c.id,
        weight: req.dangerWeighted
          ? Math.max(0.1, 1 - (c.currentHp / c.maxHp))  // lower HP = higher weight
          : 1,
      }))

    if (pool.length === 0) {
      return new DrawFateResponse(req.correlationId, null, false, 'All characters excluded from fate pool')
    }

    // Engine selects target — pure logic, no I/O
    const selectResult = (await this.fateEngine.evaluate(
      new SelectTargetRequest(pool)
    )) as SelectTargetResponse

    if (!selectResult.success || !selectResult.targetCharacterId) {
      return new DrawFateResponse(req.correlationId, null, false, selectResult.errorMessage ?? 'Selection failed')
    }

    // Persist the fate event (hidden until reveal)
    const storeResult = (await this.fateAccessor.store(
      new StoreFateEventRequest(req.campaignId, req.eventType, selectResult.targetCharacterId)
    )) as StoreFateEventResponse

    if (!storeResult.success || !storeResult.fateEvent) {
      return new DrawFateResponse(req.correlationId, null, false, storeResult.errorMessage ?? 'Failed to store fate event')
    }

    // Send push to the targeted player — they know before the DM
    const target = rosterResult.characters.find(c => c.id === selectResult.targetCharacterId)
    let pushSent = false

    if (target?.pushSubscription) {
      const pushResult = await this.notificationAccessor.send(
        new SendPushRequest(
          target.pushSubscription,
          'The fates have chosen...',
          EVENT_LABELS[req.eventType] ?? 'The fates have chosen you',
          { fateEventId: storeResult.fateEvent.id, campaignId: req.campaignId },
        )
      )
      pushSent = pushResult.success
    }

    return new DrawFateResponse(req.correlationId, storeResult.fateEvent, pushSent)
  }
}
