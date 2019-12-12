import { AmqpClient, IAmqpClient, RawMessageExchange, RawMessageQueue } from "mototakip-common";
import { Protocol } from "./Types";
import * as path from 'path'

class App {

  constructor(private readonly protocols: Protocol[], private readonly amqpClient: IAmqpClient) {
    
  }

  async start(): Promise<void> {
    await this.amqpClient.createExchange(RawMessageExchange);
    await this.amqpClient.createQueue(RawMessageQueue);
  }

}

const amqpClient = new AmqpClient('amqp://localhost');

const protocols: Protocol[] = require(path.resolve('../') + '/protocols.json')

export default new App(protocols, amqpClient);
