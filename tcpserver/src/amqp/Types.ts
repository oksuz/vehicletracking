import { Options } from "amqplib";

export type ExchangeType = 'fanout' | 'header' | 'topic' | 'direct'

export interface AmqpEntity {
  name: string,
  bindTo?: Exchange
  pattern?: string
}

export interface Exchange extends AmqpEntity {
  type: ExchangeType
  options?: Options.AssertExchange
}

export interface Queue extends AmqpEntity {
  options?: Options.AssertQueue,
  bindTo?: Exchange,
}