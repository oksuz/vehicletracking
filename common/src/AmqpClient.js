const amqp = require('amqplib');
const config = require('./config.default');

class AmqpClient {

  constructor(url) {
    this.url = url;
    this.connection = null;
  }

  async connect() {
    if (this.connection != null) {
      return this.connection;
    }

    this.connection = await amqp.connect(this.url);

    return this.connection;
  }

  async getChannel() {
    const conn = await this.connect();
    return await conn.createChannel();
  }

}

module.exports = new AmqpClient(config.amqpUrl);