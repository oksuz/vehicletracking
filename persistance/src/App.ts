import { AmqpClient, Queue, NEW_MESSAGE, IMessage, getLogger, amqpDisconnect } from 'openmts-common';
import { ConsumeMessage, Channel } from 'openmts-common/node_modules/@types/amqplib'
import DbConnection from './DbConnection';

class App {

  private readonly logger = getLogger('Persistance');

  private static persistanceQueue: Queue = {
    name: 'persistance',
    options: {
      durable: true,
      autoDelete: false,
      messageTtl: 30 * 1000
    },
    bindingOptions: {
      bindTo: NEW_MESSAGE.name,
    }
  }

  constructor(
    private readonly amqp: AmqpClient, 
    private readonly dbConncetion: DbConnection) {
  }

  private persist(message: ConsumeMessage, channel: Channel): void {

    let parsedMessage: IMessage;
    try {
      parsedMessage = JSON.parse(message.content.toString());
      this.logger.debug('message to persist %s', parsedMessage);
      channel.ack(message);
      this.dbConncetion.saveNewMessage(parsedMessage);
    } catch (e) {
      this.logger.error('Message parsing error', e)
    }
  }

  async start(): Promise<void> {
    const channelCloser = await this.amqp.consume(App.persistanceQueue, this.persist.bind(this));
    process.on('SIGINT', () => {
      amqpDisconnect(this.amqp, [channelCloser]);
    });
  }
}


export default App;