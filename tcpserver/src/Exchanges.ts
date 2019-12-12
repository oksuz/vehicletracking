import { Exchange } from "./amqp/Types";

export const RawMessageExchange: Exchange = {
  name: 'rawMessages',
  type: 'fanout',
  options: {
    durable: true
  }
}