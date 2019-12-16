import { Queue, Protocol, Exchange } from "./Types";

export const newProtocolQueue = (protocol: Protocol, bindTo: Exchange, args?: any): Queue => {
  const names = [`${protocol.name}.queue`];
  (args && args.queueSuffix) && names.push(args.queueSuffix)
  return {
    name: names.join('.'),
    pattern: protocol.name,
    options: {
      durable: true,
    },
    bindTo,
    args
  }
}