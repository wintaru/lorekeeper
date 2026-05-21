export abstract class RequestBase {
  readonly correlationId: string = crypto.randomUUID()
  readonly timestamp: Date = new Date()
}
