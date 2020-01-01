import { IParser, ParseResult, MessageType, IMessage } from 'openmts-common';
import sessionHolder from '../Session';
import { PROTOCOL_NAME } from '../constants';
import { hex2String } from '../util/hexUtils';

export interface HeartbeatMessage extends IMessage {};


class HeartbeatMessageParser implements IParser<HeartbeatMessage> {
  
  accept(message: Buffer): boolean {
    const header: number = message.readInt16BE(0);
    const length: number = message.readInt8(2)
    const type: number = message.readInt8(3)
    return header === 0x7878 && type === 0x13 && length === 0x0A;
  }  
  
  parse(message: Buffer, ip: string): Promise<ParseResult<HeartbeatMessage>> {
    return new Promise((resolve) => {
      resolve(this._parse(message, ip))
    });
  }

  private _parse(message: Buffer, ip: string): ParseResult<HeartbeatMessage> {
    const reply = Buffer.from([0x78, 0x78, 0x05, 0x13, 0x00, 0x01, Buffer.from([0xE9]).readInt8(0), Buffer.from([0xF1]).readInt8(0), 0x0D, 0x0A]);

    return {
      reply: {
        message: reply,
        ip,
        protocol: PROTOCOL_NAME
      },
      message: {
        type: MessageType.Heartbeat,
        datetime: new Date,
        protocol: PROTOCOL_NAME,
        serial: sessionHolder.getSerialFromIp(ip),
        meta: {
          raw: hex2String(message)
        }
      }
    }
  }

}

export default new HeartbeatMessageParser();