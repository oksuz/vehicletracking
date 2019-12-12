import { Exchange } from "./Types";

export const RawMessageExchange: Exchange = {
  name: 'rawMessages',
  type: 'fanout',
  options: {
    durable: true
  }
}