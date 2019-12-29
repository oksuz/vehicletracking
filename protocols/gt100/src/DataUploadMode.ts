export enum DataUploadMode {
  INTERVAL = 'INTERVAL',
  DISTANCE = 'DISTANCE',
  CORNER_CORRECTION = 'CORNER_CORRECTION',
  ACC_STATUS_CHANGE = 'ACC_STATUS_CHANGE',
  LAST_POSTION_BEFORE_STATIC = 'LAST_POSTION_BEFORE_STATIC',
  UNKONW = 'UNKONW',
}

export function dataUploadModeFromCode(code: number): DataUploadMode {
  switch(code) {
    case 0x00: return DataUploadMode.INTERVAL;
    case 0x01: return DataUploadMode.DISTANCE;
    case 0x02: return DataUploadMode.CORNER_CORRECTION;
    case 0x03: return DataUploadMode.ACC_STATUS_CHANGE;
    case 0x04: return DataUploadMode.LAST_POSTION_BEFORE_STATIC;
    default: return DataUploadMode.UNKONW
  }

}