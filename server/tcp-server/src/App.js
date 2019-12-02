const protocols = require('mototakip-protocols');
const { AmqpClient, Constants } = require('mototakip-common');
const ServerSocket = require('./ServerSocket');
const util = require('util');

class TcpServer {

  async start() {
    await this.createExchangesAndQs();
    this.servers = await this.createTcpListeners()
  }


  async createExchangesAndQs() {
    const mqChannel = await AmqpClient.getChannel();
    
    try {
      await mqChannel.assertExchange(Constants.AMQP.RAW_MESSAGE_EXCHANGE, 'fanout', { durable: true });
      await mqChannel.assertQueue(Constants.AMQP.RAW_MESSAGE_QUEUE, { durable: true });
      await mqChannel.bindQueue(Constants.AMQP.RAW_MESSAGE_QUEUE, Constants.AMQP.RAW_MESSAGE_EXCHANGE, '')
    } catch (e) {
      console.error(e);
    } finally {
      mqChannel.close();
    }
  }

  async rawMessageHandler(message, name, ip, port) {
    const mqChannel = await AmqpClient.getChannel();

    try {
      await mqChannel.publish(Constants.AMQP.RAW_MESSAGE_EXCHANGE, '', message, {
        headers: {
          'ip-address': `${ip}:${port}`,
          'protocol': name
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      mqChannel.close();
    }
  }

  async createTcpListeners() {
    return new Promise((resolve) => {
      const servers = protocols.map(protocol => {
        const { id, port } = protocol;
        const serverSocket = new ServerSocket(id, this.rawMessageHandler.bind(this));
        serverSocket.listen(port);

        return serverSocket;
      });

      resolve(servers);
    });
  }
}


module.exports = new TcpServer();