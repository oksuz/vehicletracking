import AmqpClient, { amqpDisconnect } from './AmqpClient';
import uuid from 'uuid/v1';
import { Exchange, Queue, Reply, ReplyFn } from './Types';
import { REQUEST_EXCHANGE, RESPONSE_EXCHANGE } from './Exchanges';
import { getLogger } from "../LoggerFactory";
import { ConsumeMessage, Channel } from 'amqplib';
import { hostname } from 'os';

export interface ResponseHandler {
  [key: string]: (message: ConsumeMessage) => void
}

class DataChannel {

  private readonly logger = getLogger('DataChannel');
  
  private readonly responseQueue: Queue = {
    name: 'dataChannel.response',
    options: {
      autoDelete: false,
      durable: true,
      messageTtl: 30 * 1000,
      arguments: {
        'x-single-active-consumer': true
      }
    },
    bindingOptions: {
      bindTo: RESPONSE_EXCHANGE.name
    }
  }

  private readonly handlers: ResponseHandler = {} 
  private channelClosers: Function[] = [];

  constructor(private readonly amqpClient: AmqpClient, exchanges: Exchange[]) {
    this.init(exchanges);

    process.on('SIGINT', async () => {
      this.logger.debug('closing datachannel on %s', hostname());
      amqpDisconnect(this.amqpClient, this.channelClosers);
    })
  }

  private newDataProviderQueue(name: string): Queue {
    return {
      name,
      options: {
        autoDelete: true,
        durable: false,
        messageTtl: 30 * 1000,
      },
      bindingOptions: {
        bindTo: REQUEST_EXCHANGE.name
      }
    }
  }

  private async init(exchanges: Exchange[]) {
    this.logger.debug('data channel initialize on host %s', hostname());
    try {
      await this.amqpClient.newExchange(exchanges);
      await this.amqpClient.newQueue(this.responseQueue);
      await this.consumeResponseQueue();
    } catch (e) {
      this.logger.error(e, 'initialize error');
    }
  }

  async registerDataProvider(serviceName: string, handler: (message: ConsumeMessage) => void): Promise<void> {
    const q = this.newDataProviderQueue(serviceName);
    await this.amqpClient.newQueue(q)
    const closeChannel = await this.amqpClient.consume(q.name, (message: ConsumeMessage, channel: Channel) => {
      channel.ack(message);
      handler(message);
    });

    this.channelClosers.push(closeChannel);
  }

  private async consumeResponseQueue() {
    const closeChannel = await this.amqpClient.consume(this.responseQueue, (message: ConsumeMessage, channel: Channel) => {
      if (message.properties && message.properties.correlationId && !this.handlers[message.properties.correlationId]) {
        return;
      }

      try {
        this.handlers[message.properties.correlationId](message);  
      } catch (e) {
        this.logger.error('error on calling response handler', e);
      }
      
      delete this.handlers[message.properties.correlationId];
      channel.ack(message);
    });

    this.channelClosers.push(closeChannel);
  }

  async response(requestId: string, payload: Buffer, headers?: object): Promise<void> {
    await this.amqpClient.publish(RESPONSE_EXCHANGE, payload, { headers, correlationId: requestId });
  }

  private createReplyFn(requestId: string): ReplyFn {
    return (reply: Reply) => {
      const body = typeof reply.body === 'string' ? Buffer.from(reply.body as string) : reply.body
      this.response(requestId, body, reply.headers);
    }
  }

  async request(payload: Buffer, headers?: object, timeout: number = 30): Promise<Reply> {
    const requestId = uuid();
    await this.amqpClient.publish(REQUEST_EXCHANGE, payload, { headers, correlationId: requestId });

    return new Promise((resolve, reject) => {
      let rejected = false;
      const timer = setTimeout(() => {
        reject('timeout');
        rejected = true;
      }, timeout * 1000);
      this.handlers[requestId] = (message: ConsumeMessage) => {
        if (rejected) {
          return;
        }
        clearTimeout(timer);
        resolve({
          body: message.content,
          headers: message.properties && (message.properties.headers || {}),
          reply: this.createReplyFn(requestId)
        });
      };
    });
  }
}


export default new DataChannel(new AmqpClient(), [REQUEST_EXCHANGE, RESPONSE_EXCHANGE]);
