import { IParser, ParseResult, AmqpClient, Queue, TCP_IN, getLogger, NEW_MESSAGE, amqpDisconnect, IMessage } from "openmts-common";
import { PROTOCOL_NAME } from "./constants";
import { Channel, ConsumeMessage } from "amqplib";
import { hex2String } from "./util/hexUtils";

export type MessageParser = IParser<IMessage>;
export type MessageParseResult = ParseResult<IMessage>;

class GT100Protocol {

  static Q_NAME = "gt100.incoming.messages"
  static DIRECT_MESSAGE_PATTERN = PROTOCOL_NAME;

  static gt100IncomingMessageQ: Queue = {
    name: GT100Protocol.Q_NAME,
    options: {
      durable: false,
      autoDelete: true,
      messageTtl: 30 * 1000,
      arguments: {
        'x-single-active-consumer': true
      }
    },
    bindingOptions: {
      bindTo: TCP_IN.name,
      pattern: PROTOCOL_NAME,
    }
  }

  private logger = getLogger('Gt100Protocol')

  constructor(private readonly amqp: AmqpClient, private readonly parsers: MessageParser[]) {
  }

  async start(): Promise<void> {
    const channelClose: Function = await this.amqp.consume(GT100Protocol.gt100IncomingMessageQ, this.consumer.bind(this));

    process.on('SIGINT', () => {
      amqpDisconnect(this.amqp, [channelClose]);
    });
  }

  private async consumer(message: ConsumeMessage, channel: Channel): Promise<void> {
    try {
      const parser: MessageParser = this.parsers.find((parser: MessageParser) => parser.accept(message.content));
      channel.ack(message); 
      
      if (!parser) {
        this.logger.info('unknown message %s', hex2String(message.content));
        return;
      }

      const parsedMessage = await parser.parse(message.content, message.properties.headers.ip);
      const parsedMessageWType = (parsedMessage as MessageParseResult);
      if (parsedMessageWType.reply) {
        const { reply: { message: replyMessage, ip, protocol } } = parsedMessageWType;
        this.logger.debug('replying message (%s) with %s', hex2String(message.content), hex2String(replyMessage));
        await this.amqp.publish(message.properties.replyTo, replyMessage, { headers: { ip, protocol } } );
      }
      await this.amqp.publish(NEW_MESSAGE, Buffer.from(JSON.stringify(parsedMessage.message)), {})
    } catch (e) {
      this.logger.error('error when handling message', e);
    }
  }

}

export default GT100Protocol;