import amqplib, { Channel, Connection } from 'amqplib'
import { Exchange, Queue } from './Types';

export interface IAmqpClient {
  connect(): Promise<void>
  channel(): Promise<Channel>
  createExchange(exchange: Exchange): Promise<void>
  createQueue(queue: Queue): Promise<void>
  bindQueueToExchange(queue: Queue): Promise<void>
}

class AmqpClient implements IAmqpClient {
  readonly url: string;
  private connection: Connection = null;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(this.url)
    } catch(e) {
      console.error(e);
    }
    
  }

  async channel(): Promise<Channel> {
    if (this.connection == null) {
      await this.connect();
    }

    return await this.connection.createChannel();
  }

  async createExchange(exchange: Exchange): Promise<void> {
    let channel: Channel = null;
    try {
      channel = await this.channel();
      await channel.assertExchange(exchange.name, exchange.type, exchange.options);
    } finally {
      this.safeCloseChannel(channel);
    }
  }

  async createQueue(queue: Queue): Promise<void> {
    let channel: Channel = null;
    try {
      channel = await this.channel();
      await channel.assertQueue(queue.name, queue.options);
      await this.bindQueueToExchange(queue);
    } finally {
      this.safeCloseChannel(channel);
    }
  }

  async bindQueueToExchange(queue: Queue): Promise<void> {
    if (queue.bindTo == null) {
      return null;
    }

    let channel: Channel = null;
    try {
      channel = await this.channel();
      await channel.bindQueue(queue.name, queue.bindTo.name, queue.pattern == null ? '' : queue.pattern);
    } finally {
      this.safeCloseChannel(channel);
    }
  
  }

  private safeCloseChannel(channel: Channel): void {
    if (channel != null) {
      channel.close();
    }
  }

}

export default AmqpClient;