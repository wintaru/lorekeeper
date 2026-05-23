import { ResponseBase } from '@/common/ResponseBase'
import type { CombatSession, InitiativeRequest } from '@/types'

export class StoreCombatSessionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadCombatSessionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  // success = true even when session is null (no active combat is a valid state)
  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class UpdateCombatSessionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class StoreInitiativeRequestResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly request: InitiativeRequest | null

  constructor(correlationId: string, request: InitiativeRequest | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.request = request
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class UpdateInitiativeRollsResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class ResolveInitiativeRequestResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadInitiativeRequestResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly request: InitiativeRequest | null

  constructor(correlationId: string, request: InitiativeRequest | null) {
    super()
    this.correlationId = correlationId
    this.request = request
    this.success = true
    this.errorMessage = null
  }
}
