import { AmqpClient, MessageType } from 'openmts-common';
import App from "./App";
import DbConnection from './DbConnection';


const app: App = new App(new AmqpClient(), new DbConnection())
app.start();