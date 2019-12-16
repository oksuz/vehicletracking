import { TcpInOutExchanges } from "./Types";
import { TCP_SERVER } from './Apps'

export const tcpExchanges = (hostname: string): TcpInOutExchanges => {
  return {
    in: {
      name: 'tcp.in',
      type: 'direct',
      publisingOptions: {
        replyTo: `${hostname}.tcp.out`,
        appId: TCP_SERVER,
      },
    },
    out: {
      name: `${hostname}.tcp.out`,
      type: 'fanout',
    }
  }
}