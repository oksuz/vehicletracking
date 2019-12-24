import { IParser, ParseResult, MessageType } from 'openmts-common';
import sessionHolder from '../Session';
import { PROTOCOL_NAME } from '../constants';

type ParseResolve = (value: ParseResult) => void;

class LoginMessageParser implements IParser {

  accept(message: Buffer): boolean {

    const header: number = message.readInt16BE(0);
    const length: number = message.readInt8(2)
    const type: number = message.readInt8(3)
    return header === 0x7878 && type === 0x01 && length === 0x11;
  }

  parse(message: Buffer, ip: string): Promise<ParseResult>  {
    return new Promise(this._parse(message, ip));
  }

  // @TODO add timezone, Type Identification Code parser
  private _parse(message: Buffer, ip: string): any {
    return (resolve: ParseResolve) => {
      const deviceId = this.getDeviceId(message.subarray(4, 12));

      sessionHolder.openSessions(ip, deviceId);


      resolve({
        reply: {
          ip,
          message: Buffer.from([0x78, 0x78, 0x05, 0x01, 0x00, 0x01, 0xD9, 0xDC, 0x0D, 0x0A]),
          protocol: PROTOCOL_NAME,
        },
        message: {
          protocol: PROTOCOL_NAME,
          serial: deviceId,
          datetime: new Date(),
          type: MessageType.Login,
          meta: {},
        }
      })
    }
  }

  private getDeviceId(deviceId: Buffer): string {
    return deviceId.reduce((devicIdParts: string[], current: number): string[] => {
      const part = ('0' + current.toString(16)).slice(-2);
      devicIdParts.push(part);

      return devicIdParts;
    }, []).join('').slice(-15);
  }

}

export default new LoginMessageParser();