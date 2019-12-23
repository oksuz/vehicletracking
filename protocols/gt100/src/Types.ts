import { IndexedList, ReplyHeaders, IMessage, LocationMessage } from 'openmts-common'

export type ReplyMessage = (reply: Buffer, ip: string, queue: string) => void;

export type MessageParser = (message: Buffer, ip: string, reply: ReplyMessage) => void

export interface ActiveSession {
  ip: string,
  serial: string
}


export interface ParseResult {
  reply: Buffer,
  headers: ReplyHeaders
}

export interface IParser {
  accept(message: Buffer): boolean
  parse(message: Buffer, ip: string): Promise<ParseResult & IMessage> | Promise<IMessage> | Promise<LocationMessage>
}

export interface SessionList extends IndexedList<ActiveSession> {}

