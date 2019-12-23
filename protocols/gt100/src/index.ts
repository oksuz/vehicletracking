import parsers from './parsers'
import GT100Protocol from './Protocol'
import { AmqpClient, IAmqpClient } from 'openmts-common'

const amqpClient: IAmqpClient = new AmqpClient('amqp://localhost');


const protocol = new GT100Protocol(amqpClient, parsers)
protocol.start();