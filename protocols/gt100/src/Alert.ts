export enum Alert {
  STATUS_NORMAL = "NORMAL",
  SOS = "SOS",
  POWER_CUT = 'POWER_CUT',
  VIBRATION = 'VIBRATION',
  FENCE_IN = 'FENCE_IN',
  FENCE_OUT = 'FENCE_OUT',
  OVER_SPEED = 'OVER_SPEED',
  MOVING = 'MOVING',
  UNKNOWN = 'UNKOWN',
  ENTER_GPS_DEAD_ZONE = 'ENTER_GPS_DEAD_ZONE',
  EXIT_GPS_DEAD_ZONE = 'EXIT_GPS_DEAD_ZONE',
  POWER_ON = 'POWER_ON',
  GPS_FIRST_FIX_NOTICE = 'GPS_FIRST_FIX_NOTICE',
  LOW_EXTERNAL_BATTERY = 'LOW_EXTERNAL_BATTERY',
  LOW_EXTERNAL_BATTERY_PROTECTION = 'LOW_EXTERNAL_BATTERY_PROTECTION',
  SIM_CHANGE = 'SIM_CHANGE',
  POWER_OFF = 'POWER_OFF',
  ACC_ON = 'ACC_ON',
  ACC_OFF = 'ACC_OFF',
  DOOR_OPEN = 'DOOR_OPEN',
  AIRPLANE_MODE = 'AIRPLANE_MODE',
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
    case 0x0A: return Alert.ENTER_GPS_DEAD_ZONE;
    case 0x0B: return Alert.EXIT_GPS_DEAD_ZONE;
    case 0x0C: return Alert.POWER_ON;
    case 0x0D: return Alert.GPS_FIRST_FIX_NOTICE;
    case 0x0E: return Alert.LOW_EXTERNAL_BATTERY;
    case 0x0F: return Alert.LOW_EXTERNAL_BATTERY_PROTECTION;
    case 0x10: return Alert.SIM_CHANGE;
    case 0x11: return Alert.POWER_OFF;
    case 0xFE: return Alert.ACC_ON;
    case 0xFF: return Alert.ACC_OFF;
    case 0x14: return Alert.DOOR_OPEN;
    case 0x12: return Alert.AIRPLANE_MODE;
    default: return Alert.UNKNOWN
  }

}