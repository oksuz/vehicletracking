import amqp, { ConsumeMessage, Connection, Channel } from "amqplib";
import { Queue, Exchange, PublishOptions, Reply } from './Types'
import { getLogger } from "../LoggerFactory";

class AmqpClient {

  private readonly logger = getLogger('AmqpClient');
  private connectionInProgress: boolean = false;
  constructor(private readonly url: string = process.env.AMQP_URL || 'amqp://localhost', private connection?: Connection) {
  }

  private async channel(): Promise<Channel> {
    if (!this.connection) {
      await this.connect();
    }
    
    return this.connection.createChannel();
  }

  private async connect(): Promise<Connection> {
    if (this.connection != null) {
      return Promise.resolve(this.connection)
    }

    this.logger.debug('new ampq connection request');
    return new Promise(async (resolve, reject) => {
      if (this.connectionInProgress) {
        this.logger.debug('amqp connection in progress, starting connection check interval');
        const interval = setInterval(() => {
          if (this.connection) {
            this.logger.debug('end connection check interval, sending amqp link to requester');
            clearInterval(interval);
            resolve(this.connection);
          }
        }, 500);
        return;
      }

      this.connectionInProgress = true;
      this.connection = await amqp.connect(this.url);
      this.logger.debug('amqp connection established');
      resolve(this.connection);
    })
  }

  async close() {
    if (this.connection != null) {
      this.logger.debug('closing amqp connection');
      await this.connection.close();
    }
  }

  async newExchange(exchanges: Exchange[] | Exchange): Promise<void> {
    const exs = Array.isArray(exchanges) ? exchanges : [exchanges];
    exs.forEach(async (exchange: Exchange) => {
      let channel: Channel;

      try {
        channel = await this.channel();
        await channel.assertExchange(exchange.name, exchange.type, (exchange.options || {}))
      } catch (e) {
      } finally {
        AmqpClient.safeClose(channel);
      }
    });
  }

  private static safeClose(ch: Channel) {
    if (ch != null) {
      ch.close();
    }
  }

  async consume(queue: Queue | string, handler: (message: ConsumeMessage, channel: Channel) => void): Promise<Function> {
    let channel: Channel;
    try {
      channel = await this.channel();
      const name = AmqpClient.getNameFromType(queue);
      await this.newQueue(queue as Queue);
      await channel.consume(name, message => handler(message, channel));
      return () => {
        AmqpClient.safeClose(channel);
      }
    } catch (e) {
      AmqpClient.safeClose(channel);
    }
  }

  async publish(exchange: Exchange | string, content: Buffer, options: PublishOptions): Promise<void> {
    const exchangeName: string = AmqpClient.getNameFromType(exchange);
    let channel: Channel;
    try {
      channel = await this.channel();
      this.logger.debug('publishing message to %s, with options %s', exchangeName, JSON.stringify(options));
      const published = await channel.publish(exchangeName, options.pattern || '', content, options || {});
      this.logger.debug('message publish result is %s', published);
    } catch (e) {
      this.logger.error(e, 'message publishing error to %s', exchangeName);
    } finally {
      AmqpClient.safeClose(channel);
    }
  }

  async newQueue(queue: Queue[] | Queue): Promise<Queue[]> {
    const queues: Queue[] = Array.isArray(queue) ? queue : [queue];
    const isObject = queues.every((q: Queue) => (q as Queue) && (q as Queue).name);
    if (!isObject) {
      return;
    }

    let channel: Channel;
    try {
      channel = await this.channel();
      for (let i = 0, l = queues.length; i < l; i++) {
        const currentQ: Queue = queues[i];
        await channel.assertQueue(currentQ.name, currentQ.options || {});
        if (currentQ.bindingOptions) {
          await channel.bindQueue(currentQ.name, currentQ.bindingOptions.bindTo, currentQ.bindingOptions.pattern || '', currentQ.bindingOptions.args || {})
        }
      }
      Promise.resolve(queues);
    } catch (e) {
      this.logger.error('Error creating queue', e);
    } finally {
      AmqpClient.safeClose(channel);
    }
  }

  private static getNameFromType<T extends Exchange | Queue>(val: T | string): string {
    const obj = (val as T);
    return obj.name ? obj.name : (val as string);
  }
}

export default AmqpClient;