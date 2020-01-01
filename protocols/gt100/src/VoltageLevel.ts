export enum VoltageLevel {
  NO_POWER = 'NO_POWER',
  EXTREMELY_LOW_BATTERY = 'EXTREMELY_LOW_BATTERY',
  VERY_LOW_BATTERY = 'VERY_LOW_BATTERY',
  LOW_BATTERY = 'LOW_BATTERY',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  FULL = 'FULL'
}

export function voltageLevelFromCode(code: number): VoltageLevel {
  switch(code) {
    case 0x00: return VoltageLevel.NO_POWER;
    case 0x01: return VoltageLevel.EXTREMELY_LOW_BATTERY;
    case 0x02: return VoltageLevel.VERY_LOW_BATTERY;
    case 0x03: return VoltageLevel.LOW_BATTERY;
    case 0x04: return VoltageLevel.MEDIUM;
    case 0x05: return VoltageLevel.HIGH;
    case 0x06: return VoltageLevel.FULL;
    default: return null;
  }
}