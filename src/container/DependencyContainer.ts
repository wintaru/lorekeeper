import { createServiceClient } from '@/lib/supabase/server'
import { HandlerResolverBuilder } from '@/common/resolver/HandlerResolverBuilder'

// Accessors — Campaign
import { CampaignAccessor } from '@/accessors/campaign/CampaignAccessor'
import { StoreCampaignHandler } from '@/accessors/campaign/handlers/StoreCampaignHandler'
import { LoadCampaignByCodeHandler } from '@/accessors/campaign/handlers/LoadCampaignByCodeHandler'
import { StoreCampaignRequest, LoadCampaignByCodeRequest } from '@/accessors/campaign/CampaignRequests'

// Accessors — Character
import { CharacterAccessor } from '@/accessors/character/CharacterAccessor'
import { StoreCharacterHandler } from '@/accessors/character/handlers/StoreCharacterHandler'
import { LoadRosterHandler } from '@/accessors/character/handlers/LoadRosterHandler'
import { UpdateCharacterHpHandler } from '@/accessors/character/handlers/UpdateCharacterHpHandler'
import { StoreCharacterRequest, LoadRosterRequest, UpdateCharacterHpRequest } from '@/accessors/character/CharacterRequests'

// Accessors — Fate
import { FateAccessor } from '@/accessors/fate/FateAccessor'
import { StoreFateEventHandler } from '@/accessors/fate/handlers/StoreFateEventHandler'
import { MarkFateRevealedHandler } from '@/accessors/fate/handlers/MarkFateRevealedHandler'
import { LoadFateLogHandler, LoadPendingFateHandler } from '@/accessors/fate/handlers/LoadFateLogHandler'
import { StoreFateEventRequest, MarkFateRevealedRequest, LoadFateLogRequest, LoadPendingFateRequest } from '@/accessors/fate/FateRequests'

// Accessors — Notification
import { NotificationAccessor } from '@/accessors/notification/NotificationAccessor'
import { SendPushHandler } from '@/accessors/notification/handlers/SendPushHandler'
import { StoreSubscriptionHandler } from '@/accessors/notification/handlers/StoreSubscriptionHandler'
import { SendPushRequest, StoreSubscriptionRequest } from '@/accessors/notification/NotificationRequests'

// Engines — Fate
import { FateEngine } from '@/engines/fate/FateEngine'
import { SelectTargetHandler } from '@/engines/fate/handlers/SelectTargetHandler'
import { SelectTargetRequest } from '@/engines/fate/FateEngineRequests'

// Managers — Campaign
import { CampaignManager } from '@/managers/campaign/CampaignManager'
import { CreateCampaignHandler } from '@/managers/campaign/handlers/CreateCampaignHandler'
import { JoinCampaignHandler } from '@/managers/campaign/handlers/JoinCampaignHandler'
import { GetRosterHandler } from '@/managers/campaign/handlers/GetRosterHandler'
import { ValidateDmPinHandler } from '@/managers/campaign/handlers/ValidateDmPinHandler'
import { CreateCampaignRequest, JoinCampaignRequest, GetRosterRequest, ValidateDmPinRequest } from '@/managers/campaign/CampaignRequests'

// Managers — Fate
import { FateManager } from '@/managers/fate/FateManager'
import { DrawFateHandler } from '@/managers/fate/handlers/DrawFateHandler'
import { RevealFateHandler } from '@/managers/fate/handlers/RevealFateHandler'
import { GetFateLogHandler, GetPendingFateHandler } from '@/managers/fate/handlers/GetFateLogHandler'
import { DrawFateRequest, RevealFateRequest, GetFateLogRequest, GetPendingFateRequest } from '@/managers/fate/FateRequests'

import type { ICampaignManager } from '@/managers/campaign/ICampaignManager'
import type { IFateManager } from '@/managers/fate/IFateManager'

export interface Container {
  campaignManager: ICampaignManager
  fateManager: IFateManager
}

export function createContainer(): Container {
  const db = createServiceClient()

  // ── Accessors ──────────────────────────────────────────────────────────────

  const campaignAccessor = new CampaignAccessor(
    new HandlerResolverBuilder()
      .register(StoreCampaignRequest, new StoreCampaignHandler(db))
      .build(),
    new HandlerResolverBuilder()
      .register(LoadCampaignByCodeRequest, new LoadCampaignByCodeHandler(db))
      .build(),
  )

  const characterAccessor = new CharacterAccessor(
    new HandlerResolverBuilder()
      .register(StoreCharacterRequest, new StoreCharacterHandler(db))
      .register(UpdateCharacterHpRequest, new UpdateCharacterHpHandler(db))
      .build(),
    new HandlerResolverBuilder()
      .register(LoadRosterRequest, new LoadRosterHandler(db))
      .build(),
  )

  const fateAccessor = new FateAccessor(
    new HandlerResolverBuilder()
      .register(StoreFateEventRequest, new StoreFateEventHandler(db))
      .register(MarkFateRevealedRequest, new MarkFateRevealedHandler(db))
      .build(),
    new HandlerResolverBuilder()
      .register(LoadFateLogRequest, new LoadFateLogHandler(db))
      .register(LoadPendingFateRequest, new LoadPendingFateHandler(db))
      .build(),
  )

  const notificationAccessor = new NotificationAccessor(
    new HandlerResolverBuilder()
      .register(SendPushRequest, new SendPushHandler())
      .build(),
    new HandlerResolverBuilder()
      .register(StoreSubscriptionRequest, new StoreSubscriptionHandler(db))
      .build(),
  )

  // ── Engines ────────────────────────────────────────────────────────────────

  const fateEngine = new FateEngine(
    new HandlerResolverBuilder()
      .register(SelectTargetRequest, new SelectTargetHandler())
      .build(),
  )

  // ── Managers ───────────────────────────────────────────────────────────────

  const campaignManager = new CampaignManager(
    new HandlerResolverBuilder()
      .register(CreateCampaignRequest, new CreateCampaignHandler(campaignAccessor))
      .register(JoinCampaignRequest, new JoinCampaignHandler(campaignAccessor, characterAccessor))
      .build(),
    new HandlerResolverBuilder()
      .register(GetRosterRequest, new GetRosterHandler(characterAccessor))
      .register(ValidateDmPinRequest, new ValidateDmPinHandler(campaignAccessor))
      .build(),
  )

  const fateManager = new FateManager(
    new HandlerResolverBuilder()
      .register(DrawFateRequest, new DrawFateHandler(fateEngine, fateAccessor, characterAccessor, notificationAccessor))
      .register(RevealFateRequest, new RevealFateHandler(fateAccessor))
      .build(),
    new HandlerResolverBuilder()
      .register(GetFateLogRequest, new GetFateLogHandler(fateAccessor))
      .register(GetPendingFateRequest, new GetPendingFateHandler(fateAccessor))
      .build(),
  )

  return { campaignManager, fateManager }
}
