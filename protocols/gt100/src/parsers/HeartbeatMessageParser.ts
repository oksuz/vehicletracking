import { IParser, ParseResult, IMessage, LocationMessage } from 'openmts-common';
import sessionHolder from '../Session';
import { PROTOCOL_NAME } from '../constants';

class HeartbeatMessageParser implements IParser {
  
  accept(message: Buffer): boolean {
    const header: number = message.readInt16BE(0);
    const length: number = message.readInt8(2)
    const type: number = message.readInt8(3)
    return header === 0x7878 && type === 0x13 && length === 0x0A;
  }  
  
  parse(message: Buffer, ip: string): Promise<IMessage | (ParseResult & IMessage) | LocationMessage> {
    return new Promise((resolve) => {
      resolve(this._parse(message, ip))
    });
  }

  private _parse(message: Buffer, ip: string): ParseResult & IMessage | LocationMessage {
    const errorCheck1 = Buffer.from([0xE9]).readInt8(1);
    const errorCheck2 = Buffer.from([0xF1]).readInt8(1);
    const reply = Buffer.from([0x78, 0x78, 0x05, 0x13, 0x00, 0x01, errorCheck1, errorCheck2, 0x0D, 0x0A]);

    return {
      reply,
      protocol: PROTOCOL_NAME,
      serial: sessionHolder.getSerialFromIp(ip),
      attributes: {},
      type: 0x13,
      datetime: null,
      headers: {
        ip,
        protocol: PROTOCOL_NAME
      },
    }
  }

}

export default new HeartbeatMessageParser();