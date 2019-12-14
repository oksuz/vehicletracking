import { Queue, Protocol, Exchange, Direction } from "./Types";

export const newProtocolQueue = (protocol: Protocol, bindTo: Exchange, direction: Direction, args?: any): Queue => {
  return {
    name: `${protocol.name}.queue.${direction}`,
    pattern: '',
    options: {
      durable: true,
    },
    bindTo,
    args
  }
}