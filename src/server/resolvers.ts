import { PubSub, withFilter } from 'graphql-subscriptions';
import { GraphQLError } from 'graphql';
import { faker } from '@faker-js/faker';
import {
  authors,
  books,
  createAuthor,
  createBook,
  randomBookFields,
  type Author,
  type Book,
} from './data.js';

export const BOOK_EVENT = 'BOOK_EVENT';

type BookEventType = 'ADDED' | 'UPDATED' | 'DELETED';

interface BookEvent {
  type: BookEventType;
  book: Book;
  at: string;
}

export const pubsub = new PubSub();

function publish(type: BookEventType, book: Book): Book {
  const event: BookEvent = { type, book, at: new Date().toISOString() };
  void pubsub.publish(BOOK_EVENT, { bookEvents: event });
  return book;
}

function requireBook(id: string): Book {
  const book = books.get(id);
  if (!book) {
    throw new GraphQLError(`No book with id ${id}`, { extensions: { code: 'NOT_FOUND' } });
  }
  return book;
}

export const resolvers = {
  Query: {
    books: (_: unknown, { limit, genre }: { limit?: number; genre?: string }): Book[] => {
      const all = [...books.values()].filter((b) => !genre || b.genre === genre);
      return limit ? all.slice(0, limit) : all;
    },
    book: (_: unknown, { id }: { id: string }): Book | undefined => books.get(id),
    authors: (_: unknown, { limit }: { limit?: number }): Author[] => {
      const all = [...authors.values()];
      return limit ? all.slice(0, limit) : all;
    },
    author: (_: unknown, { id }: { id: string }): Author | undefined => authors.get(id),
  },

  Book: {
    author: (book: Book): Author | undefined => authors.get(book.authorId),
  },

  Author: {
    books: (author: Author): Book[] =>
      [...books.values()].filter((b) => b.authorId === author.id),
  },

  Mutation: {
    addBook: (_: unknown, args: Partial<Book>): Book => {
      const defined = Object.fromEntries(
        Object.entries(args).filter(([, v]) => v !== undefined && v !== null),
      );
      return publish('ADDED', createBook(defined));
    },

    updateBook: (_: unknown, { id, ...changes }: { id: string } & Partial<Book>): Book => {
      const book = requireBook(id);
      for (const [key, value] of Object.entries(changes)) {
        if (value !== undefined && value !== null) {
          (book as unknown as Record<string, unknown>)[key] = value;
        }
      }
      return publish('UPDATED', book);
    },

    deleteBook: (_: unknown, { id }: { id: string }): Book => {
      const book = requireBook(id);
      books.delete(id);
      return publish('DELETED', book);
    },

    shuffleRandomBook: (): Book => {
      const book = faker.helpers.arrayElement([...books.values()]);
      Object.assign(book, randomBookFields());
      return publish('UPDATED', book);
    },

    addAuthor: (_: unknown, args: Partial<Author>): Author => {
      const defined = Object.fromEntries(
        Object.entries(args).filter(([, v]) => v !== undefined && v !== null),
      );
      return createAuthor(defined);
    },
  },

  Subscription: {
    bookEvents: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator<{ bookEvents: BookEvent }>(BOOK_EVENT),
        (payload: { bookEvents: BookEvent } | undefined, variables: { genre?: string } | undefined) =>
          !!payload && (!variables?.genre || payload.bookEvents.book.genre === variables.genre),
      ),
    },
    bookAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator<{ bookEvents: BookEvent }>(BOOK_EVENT),
        (payload: { bookEvents: BookEvent } | undefined) => payload?.bookEvents.type === 'ADDED',
      ),
      resolve: (payload: { bookEvents: BookEvent }): Book => payload.bookEvents.book,
    },
    bookUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator<{ bookEvents: BookEvent }>(BOOK_EVENT),
        (payload: { bookEvents: BookEvent } | undefined) => payload?.bookEvents.type === 'UPDATED',
      ),
      resolve: (payload: { bookEvents: BookEvent }): Book => payload.bookEvents.book,
    },
  },
};
