import { AmqpClient, IAmqpClient, Protocol, newProtocolExcange, newProtocolQueue, getProtocolExchange, Queue } from "mototakip-common";
import Server from './Server'
import { MessageHandler, Servers } from "./Types";
import * as path from 'path'
import { Channel, ConsumeMessage } from "mototakip-common/node_modules/@types/amqplib";

class App {

  private readonly servers: Servers = {};

  constructor(
    private readonly ServerClass: { new(name: string, bindIp: string, port: number, onMessage: MessageHandler): Server },
    private readonly protocols: Protocol[],
    private readonly amqpClient: IAmqpClient
  ) {

    const closeHandler = () => {
      this.amqpClient.close();
      this.closeServers();
    }

    process.on('SIGINT', closeHandler);
  }

  getProtocols(): Protocol[] {
    return this.protocols;
  }

  private closeServers() {
    Object.keys(this.servers).forEach(protocolName => {
      this.servers[protocolName].close();
    });
  }

  async start(): Promise<void> {
    await this.createExchanges();
    await this.createOutQueue();
    this.createServers();
    this.startServers();
  }

  private startServers(): void {
    Object.keys(this.servers).forEach(protocolName => {
      try {
        this.servers[protocolName].listen();
      } catch (e) {
        console.error(`error while starting server for ${protocolName}`, e);
      }
    });
  }

  async onMessage(protocolName: string, ip: string, message: Buffer): Promise<void> {
    const protocol = this.protocols.find((proto: Protocol) => proto.name === protocolName);
    if (!protocol) {
      console.error(`cannot find ${protocolName} in defined protocols`);
      return;
    }

    const protocolInExchange = getProtocolExchange(protocol, 'in');
    if (!protocolInExchange) {
      console.error(`protocol exchange '${protocol.name}:in' not found in registered exhcanges`);
      return;
    }

    let channel: Channel;
    try {
      const channel = await this.amqpClient.channel();
      await channel.publish(protocolInExchange.name, protocolInExchange.publisingOptions.routingKey || '', message, {
        headers: {
          ...protocolInExchange.publisingOptions.headers,
          ip
        }
      })

    } catch (e) {
      console.error(`error while publishing message to exchange ${protocol.name}`, e);
    } finally {
      if (channel != null) {
        channel.close();
      }
    }
  }

  private async consumeQueueForProtocol(protocol: Protocol, queue: Queue) {
    let channel: Channel;

    const consumer = (message: ConsumeMessage) => {
      const headers = message.properties.headers;
      const server: Server = this.servers[protocol.name]
      if (headers.ip) {
        server.write(headers.ip, message.content);
        channel.ack(message);
      }
    };

    try {
      channel = await this.amqpClient.channel();
      channel.consume(queue.name, consumer);
    } catch (e) {
      console.error(`error while consuming ${queue.name}`, e)
    }
  }

  private async createOutQueue(): Promise<void> {
    for (let i = 0, l = this.protocols.length; i < l; i++) {
      const protocol: Protocol = this.protocols[i];
      const outExchange = getProtocolExchange(protocol, 'out');
      const queue = newProtocolQueue(protocol, outExchange, 'out', { headers: { protocol: protocol.name, 'x-match': 'any' } });
      await this.amqpClient.createQueue(queue);
      await this.consumeQueueForProtocol(protocol, queue);
    }
  }

  private createServers(): void {
    this.protocols.forEach((protocol: Protocol) => {
      this.servers[protocol.name] = new this.ServerClass(protocol.name, "0.0.0.0", protocol.port, this.onMessage.bind(this))
    });
  }

  private async createExchanges(): Promise<void> {
    for (let i = 0, l = this.protocols.length; i < l; i++) {
      const protocol: Protocol = this.protocols[i];
      await this.amqpClient.createExchange(newProtocolExcange(protocol, 'headers', 'in'))
      await this.amqpClient.createExchange(newProtocolExcange(protocol, 'headers', 'out'))
    }
  }
}



const amqpClient = new AmqpClient('amqp://localhost');
const protocols: Protocol[] = require(path.resolve('../') + '/protocols.json')
export default new App(Server, protocols, amqpClient);
