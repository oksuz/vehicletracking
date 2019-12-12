import { Queue } from "./amqp/Types";
import { RawMessageExchange } from "./Exchanges";

export const RawMessageQueue: Queue = {
  name: 'rawMessageQueue',
  bindTo: RawMessageExchange,
  options: {
    durable: true
  }
}