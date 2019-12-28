export enum MessageType {
  Login = 'login',
  Location = 'location',
  Heartbeat = 'heartbeat',
  Alert = 'alert'
}

export interface Protocol {
  name: string,
  port: number
}

export interface IndexedList<V> {
  [key: string]: V
}

export interface IMessage {
  protocol: string,
  serial: string,
  datetime: Date | null,
  type: MessageType,
  meta: object
}

export interface LocationMessage extends IMessage {
  latitue: number,
  longitude: number,
  direction: number,
  speed: number
}

export interface MessageReply {
  message: Buffer,
  ip: string,
  protocol: string
}

export interface ParseResult {
  reply?: MessageReply 
  message: IMessage | LocationMessage
}

export interface IParser {
  accept(message: Buffer): boolean
  parse(message: Buffer, ip: string): Promise<ParseResult>
}
