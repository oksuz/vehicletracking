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

export interface CellTower {
  mobileCountryCode: number,
  mobileNetworkCode: number,
  locationAreaCode: number,
  cellId: number
}

export interface GsmLocation {
  accuracy?: number,
  latitude?: number,
  longitude?: number,
  mobileCountryCode: number,
  mobileNetworkCode: number,
  locationAreaCode: number,
  cellIds: CellTower[]
}

export interface LocationMessage extends IMessage {
  latitude: number,
  longitude: number,
  direction: number,
  speed: number,
  accuracy?: number,
  gsmLocation?: GsmLocation
}

export interface AlertMessage extends LocationMessage {
  alert: string
}

export interface MessageReply {
  message: Buffer,
  ip: string,
  protocol: string
}

export interface ParseResult<T extends IMessage> {
  reply?: MessageReply 
  message: T
}

export interface IParser<T extends IMessage> {
  accept(message: Buffer): boolean
  parse(message: Buffer, ip: string): Promise<ParseResult<T>>
}
