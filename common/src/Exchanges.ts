import { Exchange, Protocol, ExchangeType, Direction } from "./Types";

const protocolExchanges: Exchange[] = [];

export const getProtocolExchange = (protocol: Protocol, direction: Direction): Exchange => {
  return protocolExchanges.find((ex: Exchange) => ex.name === `${protocol.name}.exchange.${direction}`)
};

// pre-defined protcol exchange declaration
export const newProtocolExcange = (protocol: Protocol, type: ExchangeType, direction: Direction): Exchange => {
  const exchangeAlreadyDefined: Exchange = getProtocolExchange(protocol, direction);  
  if (exchangeAlreadyDefined && exchangeAlreadyDefined.type === type) {
    return exchangeAlreadyDefined;
  }

  const exchange: Exchange = {
    name: `${protocol.name}.exchange.${direction}`,
    type: 'headers',
    options: {
      durable: true,
    },
    publisingOptions: {
      routingKey: '',
      headers: {
        protocol: protocol.name
      }
    }
  }
  protocolExchanges.push(exchange);
  return exchange;
}