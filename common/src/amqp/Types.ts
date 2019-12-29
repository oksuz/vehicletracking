import { Options } from 'amqplib'

export type ExchangeType = 'fanout' | 'headers' | 'topic' | 'direct'

export interface PublishOptions extends Options.Publish {
  pattern?: string
}

export interface BindingOptions {
  bindTo: string,
  pattern?: string,
  args?: object
}

export interface Exchange {
  type: ExchangeType
  name: string,
  options?: Options.AssertExchange,
  bindingOptions?: BindingOptions
}

export interface Queue {
  name: string,
  options?: Options.AssertQueue,
  bindingOptions?: BindingOptions
}

export interface Reply {
  body: Buffer | string
  headers?: object,
  reply?: ReplyFn
}

export type ReplyFn = (reply: Reply) => void
