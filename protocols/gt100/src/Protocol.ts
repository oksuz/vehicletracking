import { IAmqpClient, TcpInOutExchanges, tcpExchanges, IParser, ParseResult } from "openmts-common";
import { PROTOCOL_NAME } from "./constants";
import { Channel, ConsumeMessage } from "amqplib";
class GT100Protocol {

  static Q_NAME = "GT100Q"
  static DIRECT_MESSAGE_PATTERN = PROTOCOL_NAME;

  constructor(private readonly amqp: IAmqpClient, private readonly parsers: IParser[]) {
  }

  async start(): Promise<void> {
    const exhcanges: TcpInOutExchanges = tcpExchanges('');
    await this.amqp.createQueue({
      name: GT100Protocol.Q_NAME,
      pattern: GT100Protocol.DIRECT_MESSAGE_PATTERN,
      options: {
        durable: true,
        autoDelete: false,
      },
      bindTo: exhcanges.in
    });

    await this.startConsume();
  }

  private async startConsume(): Promise<void> {

    const consumer = (channel: Channel) => async (message: ConsumeMessage) => {
      message.content
      try {
        const parser: IParser = this.parsers.find((parser: IParser) => parser.accept(message.content));

        if (parser) {
          channel.ack(message);
        }

        const parsedMessage = await parser.parse(message.content, message.properties.headers.ip);

        if ((parsedMessage as ParseResult).reply) {
          const parseResult = (parsedMessage as ParseResult);
          channel.publish(message.properties.replyTo, '', parseResult.reply, { headers: parseResult.headers });
        }

        
      } catch (e) {

      }
    }

    let ch: Channel
    try {
      ch = await this.amqp.channel();
      ch.consume(GT100Protocol.Q_NAME, (consumer(ch)));
    } catch (e) {
      console.error('channel consume error');
    }
  }

}

export default GT100Protocol;