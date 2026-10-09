import { gql } from '../shared/http-client.js';
import { config } from '../shared/config.js';

const BOOKS = /* GraphQL */ `
  query Books($limit: Int) {
    books(limit: $limit) {
      id
      title
      genre
      publishedYear
      rating
      author {
        name
        country
      }
    }
  }
`;

const AUTHORS = /* GraphQL */ `
  query Authors($limit: Int) {
    authors(limit: $limit) {
      id
      name
      bio
      books {
        title
      }
    }
  }
`;

interface Book {
  id: string;
  title: string;
  genre: string;
  publishedYear: number;
  rating: number;
  author: { name: string; country: string };
}

interface Author {
  id: string;
  name: string;
  bio: string;
  books: { title: string }[];
}

const limit = Number(process.argv[2] ?? 5);

console.log(`querying ${config.httpUrl}\n`);

const { books } = await gql<{ books: Book[] }>(BOOKS, { limit });
console.log(`--- books (${books.length}) ---`);
for (const b of books) {
  console.log(
    `${b.title} [${b.genre}, ${b.publishedYear}] ★${b.rating} - ${b.author.name} (${b.author.country})`,
  );
}

const { authors } = await gql<{ authors: Author[] }>(AUTHORS, { limit: 3 });
console.log(`\n--- authors (${authors.length}) ---`);
for (const a of authors) {
  console.log(`${a.name}: ${a.books.length} book(s) - ${a.bio}`);
}
