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
import { UpdateConditionsHandler as AccessorUpdateConditionsHandler } from '@/accessors/character/handlers/UpdateConditionsHandler'
import { UpdateDeathSavesHandler as AccessorUpdateDeathSavesHandler } from '@/accessors/character/handlers/UpdateDeathSavesHandler'
import { UpdateSpellSlotsHandler as AccessorUpdateSpellSlotsHandler } from '@/accessors/character/handlers/UpdateSpellSlotsHandler'
import {
  StoreCharacterRequest,
  LoadRosterRequest,
  UpdateCharacterHpRequest,
  UpdateCharacterConditionsRequest,
  UpdateDeathSavesRequest as AccessorUpdateDeathSavesRequest,
  UpdateSpellSlotsRequest as AccessorUpdateSpellSlotsRequest,
} from '@/accessors/character/CharacterRequests'

// Accessors — Combat
import { CombatAccessor } from '@/accessors/combat/CombatAccessor'
import { StoreCombatSessionHandler } from '@/accessors/combat/handlers/StoreCombatSessionHandler'
import { LoadCombatSessionHandler } from '@/accessors/combat/handlers/LoadCombatSessionHandler'
import { UpdateCombatSessionHandler } from '@/accessors/combat/handlers/UpdateCombatSessionHandler'
import {
  StoreCombatSessionRequest,
  LoadCombatSessionRequest,
  UpdateCombatSessionRequest,
} from '@/accessors/combat/CombatRequests'

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

// Managers — Character
import { CharacterManager } from '@/managers/character/CharacterManager'
import { UpdateHpHandler } from '@/managers/character/handlers/UpdateHpHandler'
import { UpdateConditionsHandler as ManagerUpdateConditionsHandler } from '@/managers/character/handlers/UpdateConditionsHandler'
import { UpdateDeathSavesHandler as ManagerUpdateDeathSavesHandler } from '@/managers/character/handlers/UpdateDeathSavesHandler'
import { UpdateSpellSlotsHandler as ManagerUpdateSpellSlotsHandler } from '@/managers/character/handlers/UpdateSpellSlotsHandler'
import {
  UpdateHpRequest,
  UpdateConditionsRequest,
  UpdateDeathSavesRequest,
  UpdateSpellSlotsRequest,
} from '@/managers/character/CharacterRequests'

// Managers — Combat
import { CombatManager } from '@/managers/combat/CombatManager'
import { StartCombatHandler } from '@/managers/combat/handlers/StartCombatHandler'
import { EndCombatHandler } from '@/managers/combat/handlers/EndCombatHandler'
import { NextTurnHandler } from '@/managers/combat/handlers/NextTurnHandler'
import { GetCombatSessionHandler } from '@/managers/combat/handlers/GetCombatSessionHandler'
import {
  StartCombatRequest,
  EndCombatRequest,
  NextTurnRequest,
  GetCombatSessionRequest,
} from '@/managers/combat/CombatRequests'

// Managers — Fate
import { FateManager } from '@/managers/fate/FateManager'
import { DrawFateHandler } from '@/managers/fate/handlers/DrawFateHandler'
import { RevealFateHandler } from '@/managers/fate/handlers/RevealFateHandler'
import { GetFateLogHandler, GetPendingFateHandler } from '@/managers/fate/handlers/GetFateLogHandler'
import { DrawFateRequest, RevealFateRequest, GetFateLogRequest, GetPendingFateRequest } from '@/managers/fate/FateRequests'

import type { ICampaignManager } from '@/managers/campaign/ICampaignManager'
import type { IFateManager } from '@/managers/fate/IFateManager'
import type { ICharacterManager } from '@/managers/character/ICharacterManager'
import type { ICombatManager } from '@/managers/combat/ICombatManager'

export interface Container {
  campaignManager: ICampaignManager
  fateManager: IFateManager
  characterManager: ICharacterManager
  combatManager: ICombatManager
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
      .register(UpdateCharacterConditionsRequest, new AccessorUpdateConditionsHandler(db))
      .register(AccessorUpdateDeathSavesRequest, new AccessorUpdateDeathSavesHandler(db))
      .register(AccessorUpdateSpellSlotsRequest, new AccessorUpdateSpellSlotsHandler(db))
      .build(),
    new HandlerResolverBuilder()
      .register(LoadRosterRequest, new LoadRosterHandler(db))
      .build(),
  )

  const combatAccessor = new CombatAccessor(
    new HandlerResolverBuilder()
      .register(StoreCombatSessionRequest, new StoreCombatSessionHandler(db))
      .register(UpdateCombatSessionRequest, new UpdateCombatSessionHandler(db))
      .build(),
    new HandlerResolverBuilder()
      .register(LoadCombatSessionRequest, new LoadCombatSessionHandler(db))
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

  const characterManager = new CharacterManager(
    new HandlerResolverBuilder()
      .register(UpdateHpRequest, new UpdateHpHandler(characterAccessor))
      .register(UpdateConditionsRequest, new ManagerUpdateConditionsHandler(characterAccessor))
      .register(UpdateDeathSavesRequest, new ManagerUpdateDeathSavesHandler(characterAccessor))
      .register(UpdateSpellSlotsRequest, new ManagerUpdateSpellSlotsHandler(characterAccessor))
      .build(),
  )

  const combatManager = new CombatManager(
    new HandlerResolverBuilder()
      .register(StartCombatRequest, new StartCombatHandler(combatAccessor))
      .register(EndCombatRequest, new EndCombatHandler(combatAccessor))
      .register(NextTurnRequest, new NextTurnHandler(combatAccessor))
      .build(),
    new HandlerResolverBuilder()
      .register(GetCombatSessionRequest, new GetCombatSessionHandler(combatAccessor))
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

  return { campaignManager, fateManager, characterManager, combatManager }
}
