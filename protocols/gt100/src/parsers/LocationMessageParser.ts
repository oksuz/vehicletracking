import { IParser, ParseResult, MessageType, LocationMessage } from 'openmts-common';
import sessionHolder from '../Session';
import { PROTOCOL_NAME } from '../constants';
import { dataUploadModeFromCode } from '../DataUploadMode'
import { hex2String } from '../util/hexUtils';


class LocationParser implements IParser<LocationMessage> {
  accept(message: Buffer): boolean {
    const header: number = message.readInt16BE(0);
    const length: number = message.readInt8(2)
    const type: number = message.readInt8(3)
    return header === 0x7878 && type === 0x22 && length === 0x22;
  }  
  
  parse(message: Buffer, ip: string): Promise<ParseResult<LocationMessage>> {
    return new Promise((resolve) => {
      resolve(this._parse(message, ip))
    });
  }

  private _parse(message: Buffer, ip: string): ParseResult<LocationMessage> {
    const date = message.subarray(4, 10);
    const latInfo = message.subarray(11, 15);
    const lngInfo = message.subarray(15, 19);
    const courseAndStatus = message.subarray(20, 22);
    const lbsInfo = message.subarray(22, 30);

    const part1: any = courseAndStatus.readInt8(0);
    const part2: any = courseAndStatus.readInt8(1);
    const courseBits =  ('00000000' + parseInt(part1, 16).toString(2)).slice(-2) + ('00000000' + parseInt(part2, 16).toString(2)).slice(-8)
    const direction = parseInt(courseBits, 2);

    const [year, month, day, hour, minute, second] = [date.readInt8(0), date.readInt8(1), date.readInt8(2), date.readInt8(3), date.readInt8(4), date.readInt8(5)]

    const mcc = lbsInfo.readInt16BE(0);
    const mnc = lbsInfo.readInt8(2);
    const lac = lbsInfo.readUInt16BE(3);
    const cellId = lbsInfo.readIntBE(5, 3)

    return {
      message: {
        datetime: new Date(`${2000 + year}-${month}-${day} ${hour}:${minute}:${second}`),
        latitude: latInfo.readInt32BE(0) / 1800000,
        longitude: lngInfo.readInt32BE(0) / 1800000,
        direction,
        speed: message.readUInt8(19),
        meta: {
          acc: message.readInt8(30),
          dataUploadMode: dataUploadModeFromCode(message.readInt8(31)),
          raw: hex2String(message)
        },
        gsmLocation: {
          mobileCountryCode: mcc,
          mobileNetworkCode: mnc,
          locationAreaCode: lac,
          cellIds: [{
            mobileCountryCode: mcc,
            mobileNetworkCode: mnc,
            locationAreaCode: lac,
            cellId
          }]
        },
        serial: sessionHolder.getSerialFromIp(ip),
        protocol: PROTOCOL_NAME,
        type: MessageType.Location
      }
    }
  }

}

export default new LocationParser();