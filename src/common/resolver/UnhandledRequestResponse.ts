import { ResponseBase } from '../ResponseBase'

export class UnhandledRequestResponse extends ResponseBase {
  readonly correlationId: string
  readonly success = false
  readonly errorMessage: string

  constructor(correlationId: string, requestType: string) {
    super()
    this.correlationId = correlationId
    this.errorMessage = `No handler registered for request type: ${requestType}`
  }
}
