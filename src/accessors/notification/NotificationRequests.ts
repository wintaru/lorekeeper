import { RequestBase } from '@/common/RequestBase'

export class SendPushRequest extends RequestBase {
  constructor(
    public readonly subscription: PushSubscriptionJSON,
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, unknown>,
  ) { super() }
}

export class StoreSubscriptionRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly subscription: PushSubscriptionJSON,
  ) { super() }
}

export class StoreWhisperRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly message: string,
  ) { super() }
}

export class LoadWhispersRequest extends RequestBase {
  constructor(public readonly characterId: string) { super() }
}
