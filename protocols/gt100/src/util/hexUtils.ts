export function hex2String(buffer: Buffer): string {

  const hexParts = buffer.reduce((strAcc: string[], current): string[] => {
    strAcc.push('0x' + ('0' + current.toString(16)).slice(-2));
    return strAcc
  }, [])


  return `[${hexParts.join(', ')}]`
}