const API_KEY =
  '8db07ad7d2ab9aa2239cce639d7af4b900b7a5e8c5fe2954f4429841192995d7';

const tickersHandlers = new Map();
let invalidSubsList = [];
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = '5';
const INVALID_SUB = 'INVALID_SUB';

socket.addEventListener('message', (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: nameSubs,
    MESSAGE: message,
  } = JSON.parse(e.data);

  // console.log(invalidSubsList);
  if (message === INVALID_SUB) {
    invalidSubsList.push(
      nameSubs
        .split('~')
        .filter((n, i) => i == 2)
        .join('')
    );
  }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach((fn) => {
    fn(newPrice);
  });
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
  let id = 0;
  invalidSubsList.map((el, indx) => (el === ticker ? (id = indx) : el));
  invalidSubsList.splice(id, 1);
};

export const getCoinlist = () =>
  fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=${API_KEY}`
  ).then((result) => result.json());

export const getInvalidSubsList = () => {
  return invalidSubsList;
};
