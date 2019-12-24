import { IAmqpClient, TcpInOutExchanges, tcpExchanges, IParser, ParseResult } from "openmts-common";
import { PROTOCOL_NAME } from "./constants";
import { Channel, ConsumeMessage } from "amqplib";
import { parse } from "querystring";
import { hex2String } from "./util/hexUtils";
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
        messageTtl: 20000
      },
      bindTo: exhcanges.in
    });

    await this.startConsume();
  }

  private async startConsume(): Promise<void> {

    const consumer = (channel: Channel) => async (message: ConsumeMessage) => {
      try {
        const parser: IParser = this.parsers.find((parser: IParser) => parser.accept(message.content));

        if (!parser) { 
          console.error('unknown message' , hex2String(message.content));
          return;
        }

        const parsedMessage = await parser.parse(message.content, message.properties.headers.ip);
        console.log(parsedMessage);
        channel.ack(message);
        if ((parsedMessage as ParseResult).reply) {
          const { reply: { message: replyMessage, ip, protocol } } = (parsedMessage as ParseResult);
          
          channel.publish(message.properties.replyTo, '', replyMessage, {
            headers: { ip, protocol }
          });
        }
      } catch (e) {
        console.error(e);
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