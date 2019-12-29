import { IParser, ParseResult, MessageType } from 'openmts-common';
import sessionHolder from '../Session';
import { PROTOCOL_NAME } from '../constants';
import { dataUploadModeFromCode } from '../DataUploadMode'


class LocationParser implements IParser {
  accept(message: Buffer): boolean {
    const header: number = message.readInt16BE(0);
    const length: number = message.readInt8(2)
    const type: number = message.readInt8(3)
    return header === 0x7878 && type === 0x22 && length === 0x22;
  }  
  
  parse(message: Buffer, ip: string): Promise<ParseResult> {
    return new Promise((resolve) => {
      resolve(this._parse(message, ip))
    });
  }

  private _parse(message: Buffer, ip: string): ParseResult {
    const date = message.subarray(4, 10);
    const latInfo = message.subarray(11, 15);
    const lngInfo = message.subarray(15, 19);
    const courseAndStatus = message.subarray(20, 22);

    const [year, month, day, hour, minute, second] = [date.readInt8(0), date.readInt8(1), date.readInt8(2), date.readInt8(3), date.readInt8(4), date.readInt8(5)]

    const part1: any = courseAndStatus.readInt8(0);
    const part2: any = courseAndStatus.readInt8(1);
    const courseBits =  ('00000000' + parseInt(part1, 16).toString(2)).slice(-2) + ('00000000' + parseInt(part2, 16).toString(2)).slice(-8)
    const direction = parseInt(courseBits, 2);

    return {
      message: {
        datetime: new Date(`${2000 + year}-${month}-${day} ${hour}:${minute}:${second}`),
        latitue: latInfo.readInt32BE(0) / 30000.0 / 60.0,
        longitude: lngInfo.readInt32BE(0) / 30000.0 / 60.0,
        direction,
        speed: message.readInt8(19),
        meta: {
          acc: message.readInt8(30),
          dataUploadMode: dataUploadModeFromCode(message.readInt8(31))
        },
        serial: sessionHolder.getSerialFromIp(ip),
        protocol: PROTOCOL_NAME,
        type: MessageType.Location
      }
    }
  }

}

export default new LocationParser();