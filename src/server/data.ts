import { faker } from '@faker-js/faker';

export interface Author {
  id: string;
  name: string;
  bio: string;
  country: string;
}

export interface Book {
  id: string;
  title: string;
  genre: string;
  publishedYear: number;
  rating: number;
  authorId: string;
}

const GENRES = ['Sci-Fi', 'Fantasy', 'Thriller', 'Romance', 'History', 'Biography'] as const;

export const authors = new Map<string, Author>();
export const books = new Map<string, Book>();

export function createAuthor(overrides: Partial<Author> = {}): Author {
  const author: Author = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    bio: faker.lorem.sentence(),
    country: faker.location.country(),
    ...overrides,
  };
  authors.set(author.id, author);
  return author;
}

export function createBook(overrides: Partial<Book> = {}): Book {
  const authorId = overrides.authorId ?? faker.helpers.arrayElement([...authors.keys()]);
  const book: Book = {
    id: faker.string.uuid(),
    title: faker.book.title(),
    genre: faker.helpers.arrayElement(GENRES),
    publishedYear: faker.number.int({ min: 1950, max: 2025 }),
    rating: Number(faker.number.float({ min: 1, max: 5, fractionDigits: 1 })),
    ...overrides,
    authorId,
  };
  books.set(book.id, book);
  return book;
}

export function randomBookFields(): Pick<Book, 'title' | 'genre' | 'rating'> {
  return {
    title: faker.book.title(),
    genre: faker.helpers.arrayElement(GENRES),
    rating: Number(faker.number.float({ min: 1, max: 5, fractionDigits: 1 })),
  };
}

export function seed(authorCount = 5, bookCount = 12): void {
  faker.seed(42);
  for (let i = 0; i < authorCount; i++) createAuthor();
  for (let i = 0; i < bookCount; i++) createBook();
}
