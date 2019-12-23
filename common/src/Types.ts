import { Options } from "amqplib";

export type ExchangeType = 'fanout' | 'headers' | 'topic' | 'direct'
export type Direction = 'in' | 'out';

export interface AmqpEntity {
  name: string,
  bindTo?: Exchange
  pattern?: string
}

export namespace ExchangeOptions {
  export interface Publish {
    routingKey?: string
  }
}

export interface Exchange extends AmqpEntity {
  type: ExchangeType
  options?: Options.AssertExchange
  publisingOptions?: ExchangeOptions.Publish & Options.Publish
}

export interface Queue extends AmqpEntity {
  options?: Options.AssertQueue,
  bindTo?: Exchange,
  args?: any
}

export interface Protocol {
  name: string,
  port: number
}

export interface TcpInOutExchanges {
  in: Exchange,
  out: Exchange
}


export interface IndexedList<V> {
  [key: string]: V
}

export interface IMessage {
  protocol: string,
  serial: string,
  datetime: Date | null,
  type: number,
  attributes: any
}

export interface LocationMessage extends IMessage {
  latitue: number,
  longitude: number,
  direction: number,
  speed: number
}

export interface ReplyHeaders {
  protocol?: string,
  ip: string
}

export interface ParseResult {
  reply: Buffer,
  headers: ReplyHeaders
}

export interface IParser {
  accept(message: Buffer): boolean
  parse(message: Buffer, ip: string): Promise<ParseResult & IMessage | IMessage | LocationMessage>
}
