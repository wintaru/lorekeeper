import { createServiceClient } from '@/lib/supabase/server'
import { HandlerResolverBuilder } from '@/common/resolver/HandlerResolverBuilder'

import { CampaignAccessor } from '@/accessors/campaign/CampaignAccessor'
import { StoreCampaignHandler } from '@/accessors/campaign/handlers/StoreCampaignHandler'
import { LoadCampaignByCodeHandler } from '@/accessors/campaign/handlers/LoadCampaignByCodeHandler'
import { StoreCampaignRequest } from '@/accessors/campaign/CampaignRequests'
import { LoadCampaignByCodeRequest } from '@/accessors/campaign/CampaignRequests'

import { CharacterAccessor } from '@/accessors/character/CharacterAccessor'
import { StoreCharacterHandler } from '@/accessors/character/handlers/StoreCharacterHandler'
import { LoadRosterHandler } from '@/accessors/character/handlers/LoadRosterHandler'
import { UpdateCharacterHpHandler } from '@/accessors/character/handlers/UpdateCharacterHpHandler'
import { StoreCharacterRequest, LoadRosterRequest, UpdateCharacterHpRequest } from '@/accessors/character/CharacterRequests'

import { CampaignManager } from '@/managers/campaign/CampaignManager'
import { CreateCampaignHandler } from '@/managers/campaign/handlers/CreateCampaignHandler'
import { JoinCampaignHandler } from '@/managers/campaign/handlers/JoinCampaignHandler'
import { GetRosterHandler } from '@/managers/campaign/handlers/GetRosterHandler'
import { ValidateDmPinHandler } from '@/managers/campaign/handlers/ValidateDmPinHandler'
import { CreateCampaignRequest, JoinCampaignRequest, GetRosterRequest, ValidateDmPinRequest } from '@/managers/campaign/CampaignRequests'

import type { ICampaignManager } from '@/managers/campaign/ICampaignManager'

export interface Container {
  campaignManager: ICampaignManager
}

export function createContainer(): Container {
  const db = createServiceClient()

  // Accessors
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
      .build(),
    new HandlerResolverBuilder()
      .register(LoadRosterRequest, new LoadRosterHandler(db))
      .register(UpdateCharacterHpRequest, new UpdateCharacterHpHandler(db))
      .build(),
  )

  // Managers
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

  return { campaignManager }
}
