import * as net from 'net';
import { MessageHandler, Clients, Client } from './Types'
import { getLogger } from 'openmts-common';


class Server {

  private server?: net.Server;
  private readonly clients: Clients = {}
  private readonly logger = getLogger('TcpServer');

  constructor(private name: string, private bindIp: string = '0.0.0.0', private port: number, private onMessage: MessageHandler) {
  }

  close(): void {
    if (this.server == null) {
      return;
    }

    Object.keys(this.clients).forEach(ip => {
      this.clients[ip].connection.destroy();
      delete this.clients[ip]
    });

    this.server.close();
  }

  listen(): void {
    this.server = net.createServer();
    this.server.listen(this.port, this.bindIp, () => {
      this.logger.info("server stared for %s on port %s", this.name, this.port)
    });

    this.server.on('connection', (socket: net.Socket) => this.onConnect(socket));
  }

  onConnect(socket: net.Socket) {
    socket.on('data', (data) => this.onData(data, socket))
    socket.on('close', (hadError) => { this.onConnectionClose(hadError, socket) });
    socket.on('error', (err: Error) => {
      this.logger.error(err, 'socket error');
    });
    
    this.clients[socket.remoteAddress] = {
      connection: socket,
      ip: socket.remoteAddress
    };

    this.logger.info('new socket connection %s', socket.remoteAddress);
  }

  onData(data: Buffer, socket: net.Socket): void {
    this.onMessage(this.name, socket.remoteAddress, data);
  }

  onConnectionClose(error: boolean, socket: net.Socket): void {
    socket.destroy();
    delete this.clients[socket.remoteAddress];
    this.logger.info(`Socket closed %s, error: %s`, socket.remoteAddress, !!error);
  }

  write(ip: string, message: Buffer): boolean {
    const client: Client = this.clients[ip];
    if (client != null) {
      this.logger.debug('writing (%s) value to %s', message, ip);
      return client.connection.write(message, (err?: Error) => {
        if (err != null) {
          this.logger.error(err, `an error ocurred while writing message to ${this.name}(${ip})`);
        }
      });
    }

    return false;
  }
}

export default Server;
