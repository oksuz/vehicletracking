import parsers from './parsers'
import GT100Protocol from './Protocol'
import { AmqpClient } from 'openmts-common'


const protocol = new GT100Protocol(new AmqpClient(), parsers)
protocol.start();