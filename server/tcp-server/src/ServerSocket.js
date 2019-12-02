const net = require('net');

class ServerSocket {

  constructor(name, messageHandler) {
    this.name = name;
    this.connections = {};
    this.messageHandler = messageHandler
    this.server = net.createServer(); 
  }

  getName() {
    return this.name
  }

  listen(port, host = '0.0.0.0') {
    this.server.listen(port, host, () => {
      console.log(`server listening ${port} for ${this.getName()}`);
    });

    this.server.on('connection', sock => this.handleConnection(sock));
  }

  handleConnection(socket) {
    const idx = this.createIdx(socket);
    socket.on('data', (data) => {
      this.messageHandler(data, this.getName(), socket.remoteAddress, socket.remotePort)
    });

    socket.on('close', () => {
      delete this.connections[idx];
    });
  }

  write(payload, remoteAddress, remotePort) {
    const idx = this.createIdx({ remoteAddress, remotePort });  
    if (this.connections[idx]) {
      this.connections[idx].write(payload);
    }
  }

  createIdx(socket) {
    return `${socket.remoteAddress}_${socket.remotePort}`
  }

}

module.exports = ServerSocket;