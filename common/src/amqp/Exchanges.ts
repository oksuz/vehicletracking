import { Exchange } from "./Types";

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
    internal: true
  }
}

export const TCP_OUT: Exchange = {
  name: 'tcp.out',
  type: 'fanout',
  options: {
    durable: true,
    autoDelete: false,
    internal: false,
  }
}

export const REQUEST_EXCHANGE: Exchange = {
  type: 'fanout', 
  name: 'request',
  options: {
    durable: true,
    autoDelete: false,
  }
}

export const RESPONSE_EXCHANGE: Exchange = {
  type: 'fanout', 
  name: 'reply',
  options: {
    durable: true,
    autoDelete: false,
  }
}