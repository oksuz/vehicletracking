import { AmqpClient, IAmqpClient, Protocol, newProtocolQueue, Queue, Exchange, TcpInOutExchanges, tcpExchanges } from "mototakip-common";
import Server from './Server'
import { MessageHandler, Servers } from "./Types";
import * as path from 'path'
import { Channel, ConsumeMessage } from "mototakip-common/node_modules/@types/amqplib";
import logger from './Logger';
import { hostname } from "os";

class App {

  private readonly servers: Servers = {};
  private inOutExchanges: TcpInOutExchanges;
  static TCP_OUT_QUEUE_NAME = `${hostname()}.tcp.out.q`;

  constructor(
    private readonly ServerClass: { new(name: string, bindIp: string, port: number, onMessage: MessageHandler): Server },
    private readonly protocols: Protocol[],
    private readonly amqpClient: IAmqpClient
  ) {
    this.inOutExchanges = tcpExchanges(hostname())

    const closeHandler = () => {
      logger.debug('sigint recevied closing amqp and servers');
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
    await this.amqpClient.createExchange(this.inOutExchanges.in);
    await this.amqpClient.createExchange(this.inOutExchanges.out);
    await this.amqpClient.createQueue({ name: App.TCP_OUT_QUEUE_NAME, bindTo: this.inOutExchanges.out });
    await this.startConsumingForOut();
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

    let channel: Channel;
    try {
      channel = await this.amqpClient.channel();
      const inExchange: Exchange = this.inOutExchanges.in;
      await channel.publish(inExchange.name, protocol.name, message, { ...inExchange.publisingOptions, headers: { ip } })
    } catch (e) {
      console.error(`error while publishing message to exchange ${protocol.name}`, e);
    } finally {
      if (channel != null) {
        channel.close();
      }
    }
  }

  private async startConsumingForOut() {
    const consumer = (message: ConsumeMessage) => {
      const headers: any = message.properties.headers;
      let server: Server;
      
      if (headers && headers.protocol && headers.ip && (server = this.servers[headers.protocol]) != null) {
        if (server.write(headers.ip, message.content)) {
          channel.ack(message);
        }
      }
    }

    let channel: Channel;
    try {
      channel = await this.amqpClient.channel();
      channel.consume(App.TCP_OUT_QUEUE_NAME, consumer);
    } catch (e) {
      console.error(`error while consuming ${App.TCP_OUT_QUEUE_NAME}`, e)
    }
  }

  private createServers(): void {
    this.protocols.forEach((protocol: Protocol) => {
      this.servers[protocol.name] = new this.ServerClass(protocol.name, "0.0.0.0", protocol.port, this.onMessage.bind(this))
    });
  }
}

const amqpClient = new AmqpClient('amqp://localhost');
const protocols: Protocol[] = require(path.resolve('../') + '/protocols.json')
export default new App(Server, protocols, amqpClient);
