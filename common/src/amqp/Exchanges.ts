import { Exchange } from "./Types";
import { hostname } from "os";

export const TCP_IN: Exchange = {
  name: 'tcp.in',
  type: 'direct',
  options: {
    durable: true,
    autoDelete: false,
    internal: false,
  }
}

export const NEW_MESSAGE: Exchange = {
  type: 'fanout',
  name: 'new.message.parsed',
  options: {
    durable: true,
    autoDelete: false,
    internal: false
  }
}

export const TCP_OUT: Exchange = {
  name: `tcp.out.${hostname()}`,
  type: 'fanout',
  options: {
    durable: true,
    autoDelete: false,
    internal: false,
  }
}

export const REQUEST_EXCHANGE: Exchange = {
  type: 'fanout', 
  name: 'messagebus.request',
  options: {
    durable: true,
    autoDelete: false,
  }
}

export const RESPONSE_EXCHANGE: Exchange = {
  type: 'fanout', 
  name: 'messagebus.reply',
  options: {
    durable: true,
    autoDelete: false,
  }
}