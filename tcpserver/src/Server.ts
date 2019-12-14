import * as net from 'net';
import { MessageHandler, Clients, Client } from './Types'

class Server {

  private server: net.Server;
  private readonly clients: Clients

  constructor(private name: string, private bindIp: string = '0.0.0.0', private port: number, private onMessage: MessageHandler) {
  }

  close(): void {
    Object.keys(this.clients).forEach(ip => {
      this.clients[ip].connection.destroy();
      delete this.clients[ip]
    });

    this.server.close();
  }

  listen(): void {
    this.server = net.createServer();
    this.server.listen(this.port, this.bindIp, () => {
      console.log(`server starter for ${this.name} binded to ${this.bindIp}:${this.port}`)
    });

    this.server.on('connection', (socket: net.Socket) => {
      socket.on('connect', () => this.onConnect(socket));
      socket.on('data', (data, socket) => this.onData(data, socket))
      socket.on('close', (hadError) => { this.onConnectionClose(hadError, socket) });
    });
  }

  onConnect(socket: net.Socket) {
    this.clients[socket.remoteAddress] = {
      connection: socket,
      ip: socket.remoteAddress
    };

    console.log(`new socket connection ${socket.remoteAddress}`);
  }

  onData(data: Buffer, socket: net.Socket): void {
    this.onMessage(this.name, socket.remoteAddress, data);
  }

  onConnectionClose(error: boolean, socket: net.Socket): void {
    socket.destroy();
    delete this.clients[socket.remoteAddress];
    console.log(`Socket closed ${socket.remoteAddress} error: ${!!error}`);
  }

  write(ip: string, message: Buffer): void {
    const client: Client = this.clients[ip];
    if (client != null) {
      client.connection.write(message, (err?: Error) => {
        if (err != null) {
          console.error(`an error ocurred while writing message to ${this.name}(${ip})`, err);
        }
      });
    }
  }
}

export default Server;
