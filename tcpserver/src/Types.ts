import { Socket } from 'net';
import Server from './Server';
import { IndexedList } from 'openmts-common'
export type MessageHandler = (name: string, ip: string, message: Buffer) => void;

export interface Client {
  ip: string,
  connection: Socket
}


export interface Clients extends IndexedList<Client> {}
export interface Servers extends IndexedList<Server> {}