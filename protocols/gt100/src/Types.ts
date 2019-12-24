import { IndexedList } from 'openmts-common'

export type ReplyMessage = (reply: Buffer, ip: string, queue: string) => void;

export type MessageParser = (message: Buffer, ip: string, reply: ReplyMessage) => void

export interface ActiveSession {
  ip: string,
  serial: string
}

export interface SessionList extends IndexedList<ActiveSession> {}

