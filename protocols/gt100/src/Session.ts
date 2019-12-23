import { SessionList, ActiveSession } from "./Types";

class SessionHolder {
  private activeSessions: SessionList

  openSessions(ip: string, serial: string): void {
    if (this.activeSessions[ip]) {
      this.activeSessions[ip] = {
        ip,
        serial
      }
    }
  }

  closeSession(ip: string): void {
    delete this.activeSessions[ip];
  } 

  getSerialFromIp(ip: string): string {
    const sess: ActiveSession = this.activeSessions[ip];
    if (sess) {
      return sess.serial
    }
    return null;
  }

}

export default new SessionHolder();