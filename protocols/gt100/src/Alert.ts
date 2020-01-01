export enum Alert {
  STATUS_NORMAL = "NORMAL",
  SOS = "SOS",
  POWER_CUT = 'POWER_CUT',
  VIBRATION = 'VIBRATION',
  FENCE_IN = 'FENCE_IN',
  FENCE_OUT = 'FENCE_OUT',
  OVER_SPEED = 'OVER_SPEED',
  MOVING = 'MOVING',
  UNKNOWN = 'UNKOWN'
}

export function alertFromCode(code: number): Alert {

  switch(code) {
    case 0x00: return Alert.STATUS_NORMAL;
    case 0x01: return Alert.SOS;
    case 0x02: return Alert.POWER_CUT;
    case 0x03: return Alert.VIBRATION;
    case 0x04: return Alert.FENCE_IN;
    case 0x05: return Alert.FENCE_OUT;
    case 0x06: return Alert.OVER_SPEED;
    case 0x09: return Alert.MOVING;
    default: return Alert.UNKNOWN
  }

}