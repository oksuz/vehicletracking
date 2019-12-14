import { Socket } from 'net';
import Server from './Server';

export interface Protocol {
  name: string,
  port: number
}

export type MessageHandler = (name: string, ip: string, message: Buffer) => void;

export interface Client {
  ip: string,
  connection: Socket
}

export interface IndexedList<V> {
  [key: string]: V
}

export interface Clients extends IndexedList<Client> {}
export interface Servers extends IndexedList<Server> {}
