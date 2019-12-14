import { AmqpClient, IAmqpClient, RawMessageExchange, RawMessageQueue } from "mototakip-common";
import Server from './Server'
import { Protocol, MessageHandler, Servers } from "./Types";
import * as path from 'path'

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

  closeServers() {
    Object.keys(this.servers).forEach(protocolName => {
      this.servers[protocolName].close();
    });
  }

  async start(): Promise<void> {
    await this.amqpClient.createExchange(RawMessageExchange);
    await this.amqpClient.createQueue(RawMessageQueue);
    this.createServers();
    this.startServers()
  }

  startServers(): void {
    Object.keys(this.servers).forEach(protocolName => {
      try {
        this.servers[protocolName].listen();
      } catch (e) {
        console.error(`error while starting server for ${protocolName}`, e);
      }  
    });
  }

  onMessage(name: string, ip: string, message: Buffer): void {

  }

  createServers(): void {
    this.protocols.forEach(async protocol => {
      this.servers[protocol.name] = new this.ServerClass(protocol.name, "0.0.0.0", protocol.port, this.onMessage.bind(this))
    })
  }
}



const amqpClient = new AmqpClient('amqp://localhost');
const protocols: Protocol[] = require(path.resolve('../') + '/protocols.json')
export default new App(Server, protocols, amqpClient);
