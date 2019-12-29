import { MongoClient, Db } from 'mongodb';
import { IMessage, getLogger } from 'openmts-common';

export type Connector = () => Promise<MongoClient>;

class DbConnection {

  private logger = getLogger('persistance/dbconnection');
  private getConnection: Connector;

  constructor(private readonly dbUrl: string = process.env.DB_URL || 'mongodb://localhost:27017') {
    this.getConnection = this.createConnector();
  }

  private createConnector(): Connector {
    let connection: MongoClient, timer;

    const restartTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (connection != null) {
          connection.close();
          connection = null;
        }
      }, 60 * 1000);
    }

    return async (): Promise<MongoClient> => {
      if (connection != null) {
        restartTimer();
        return connection;
      }
      const client: MongoClient = new MongoClient(this.dbUrl, { useNewUrlParser: true })
      connection = await client.connect();
      restartTimer();
      return connection;
    }

  }
  
  async saveNewMessage(message: IMessage): Promise<void> {
    try {
      const connection = await this.getConnection();
      const db: Db = connection.db(message.protocol);
      const collection = db.collection(message.type);
      await collection.insertOne(message);
    } catch (e) {
      this.logger.error('message save error', e)
    }
  }
}

export default DbConnection;