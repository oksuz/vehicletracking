export enum GsmSignalStrength {
  NO_SIGNAL = 'NO_SIGNAL',
  EXTEMELY_WEAK_SIGNAL = 'EXTEMELY_WEAK_SIGNAL',
  WEAK_SIGNAL = 'WEAK_SIGNAL',
  GOOD_SIGNAL = 'GOOD_SIGNAL',
  STRONG_SIGNAL = 'STRONG_SIGNAL'
}

export function gsmSignalStrengthFromCode(code: number): GsmSignalStrength {
  switch(code) {
    case 0x00: return GsmSignalStrength.NO_SIGNAL;
    case 0x01: return GsmSignalStrength.EXTEMELY_WEAK_SIGNAL;
    case 0x02: return GsmSignalStrength.WEAK_SIGNAL;
    case 0x03: return GsmSignalStrength.GOOD_SIGNAL;
    case 0x03: return GsmSignalStrength.STRONG_SIGNAL;
    default: return null;
  }
}