import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { config } from '../shared/config.js';

const BOOK_EVENTS = /* GraphQL */ `
  subscription BookEvents($genre: String) {
    bookEvents(genre: $genre) {
      type
      at
      book {
        id
        title
        genre
        rating
        author {
          name
        }
      }
    }
  }
`;

interface BookEvent {
  type: string;
  at: string;
  book: {
    id: string;
    title: string;
    genre: string;
    rating: number;
    author: { name: string } | null;
  };
}

const genre = process.argv[2];

const client = createClient({
  url: config.wsUrl,
  webSocketImpl: WebSocket,
  retryAttempts: Infinity,
  on: {
    connected: () => console.log(`connected to ${config.wsUrl}`),
    closed: () => console.log('connection closed'),
  },
});

process.on('SIGINT', () => {
  void (async () => {
    await client.dispose();
    process.exit(0);
  })();
});

console.log(genre ? `listening for "${genre}" book events…` : 'listening for all book events…');

for await (const result of client.iterate<{ bookEvents: BookEvent }>({
  query: BOOK_EVENTS,
  variables: { genre },
})) {
  const event = result.data?.bookEvents;
  if (!event) continue;
  const { type, at, book } = event;
  console.log(
    `[${at}] ${type.padEnd(7)} ${book.title} (${book.genre}, ★${book.rating}) - ${book.author?.name ?? 'unknown'}`,
  );
}
