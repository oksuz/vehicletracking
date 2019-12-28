import { AmqpClient, Protocol, getLogger, TCP_IN, TCP_OUT, Queue, TCP_SERVER } from "openmts-common";
import { MessageHandler, Servers } from "./Types";
import { Channel, ConsumeMessage } from "openmts-common/node_modules/@types/amqplib";
import Server from './Server'
import * as path from 'path'
import { hostname } from "os";


class App {

  private readonly servers: Servers = {};
  private readonly logger = getLogger('TcpServer')
  private closeOutChannel?: Function;

  private readonly outQueue: Queue = {
    name: `${hostname()}.tcp.out.q`,
    options: {
      durable: true,
      autoDelete: false,
      messageTtl: 30 * 1000,
    },
    bindingOptions: {
      bindTo: TCP_OUT.name
    }
  }

  constructor(
    private readonly ServerClass: { new(name: string, bindIp: string, port: number, onMessage: MessageHandler): Server },
    private readonly protocols: Protocol[],
    private readonly amqpClient: AmqpClient
  ) {
  
    const closeHandler = () => {
      this.logger.debug('sigint recevied closing amqp and servers');
      try {
        if (this.closeOutChannel) {
          this.closeOutChannel();
        }
      } catch (e) {}

      try {
        this.amqpClient.close();
      } catch (e) {}
      
      try {
        this.closeServers();
      } catch (e) {}
      
    }

    process.on('SIGINT', closeHandler);
  }

  private closeServers() {
    Object.keys(this.servers).forEach(protocolName => {
      this.servers[protocolName].close();
    });
  }

  async start(): Promise<void> {
    await this.amqpClient.newExchange([TCP_IN, TCP_OUT]);
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
      this.logger.error(`cannot find ${protocolName} in defined protocols`);
      return;
    }

    try {
      await this.amqpClient.publish(TCP_IN, message, {
        appId: TCP_SERVER,
        headers: {
          ip
        },
        pattern: protocolName,
        replyTo: this.outQueue.name
      });
    } catch (e) {
      this.logger.error(e, 'error on publishing message to %s protocol: %s, ip: %s', TCP_IN.name, protocolName, ip);
    }
  }

  private async startConsumingForOut() {
    const consumer = (message: ConsumeMessage, channel: Channel) => {
      const headers: any = message.properties.headers;
      let server: Server;
      
      if (headers && headers.protocol && headers.ip && (server = this.servers[headers.protocol]) != null) {
        if (server.write(headers.ip, message.content)) {
          channel.ack(message);
        }
      }
    }

    this.closeOutChannel = await this.amqpClient.consume(this.outQueue, consumer);
  }

  private createServers(): void {
    this.protocols.forEach((protocol: Protocol) => {
      this.servers[protocol.name] = new this.ServerClass(protocol.name, "0.0.0.0", protocol.port, this.onMessage.bind(this))
    });
  }
}

const protocols: Protocol[] = require(path.resolve('../') + '/protocols.json')
export default new App(Server, protocols, new AmqpClient());
