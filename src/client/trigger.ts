import { gql } from '../shared/http-client.js';

const ADD_BOOK = /* GraphQL */ `
  mutation AddBook($title: String, $genre: String, $rating: Float) {
    addBook(title: $title, genre: $genre, rating: $rating) {
      id
      title
      genre
      rating
    }
  }
`;

const UPDATE_BOOK = /* GraphQL */ `
  mutation UpdateBook($id: ID!, $title: String, $genre: String, $rating: Float) {
    updateBook(id: $id, title: $title, genre: $genre, rating: $rating) {
      id
      title
      genre
      rating
    }
  }
`;

const DELETE_BOOK = /* GraphQL */ `
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) {
      id
      title
    }
  }
`;

const SHUFFLE = /* GraphQL */ `
  mutation Shuffle {
    shuffleRandomBook {
      id
      title
      genre
      rating
    }
  }
`;

function usage(): never {
  console.log(`usage:
  pnpm trigger add [title] [genre] [rating]
  pnpm trigger update <id> [title] [genre] [rating]
  pnpm trigger delete <id>
  pnpm trigger shuffle [count] [intervalMs]`);
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'add': {
    const [title, genre, rating] = args;
    const data = await gql(ADD_BOOK, {
      title,
      genre,
      rating: rating ? Number(rating) : undefined,
    });
    console.log(JSON.stringify(data, null, 2));
    break;
  }

  case 'update': {
    const [id, title, genre, rating] = args;
    if (!id) usage();
    const data = await gql(UPDATE_BOOK, {
      id,
      title,
      genre,
      rating: rating ? Number(rating) : undefined,
    });
    console.log(JSON.stringify(data, null, 2));
    break;
  }

  case 'delete': {
    const [id] = args;
    if (!id) usage();
    console.log(JSON.stringify(await gql(DELETE_BOOK, { id }), null, 2));
    break;
  }

  case 'shuffle': {
    const count = Number(args[0] ?? 1);
    const interval = Number(args[1] ?? 1000);
    for (let i = 0; i < count; i++) {
      const data = await gql<{ shuffleRandomBook: { title: string } }>(SHUFFLE);
      console.log(`${i + 1}/${count} -> ${data.shuffleRandomBook.title}`);
      if (i < count - 1) await new Promise((r) => setTimeout(r, interval));
    }
    break;
  }

  default:
    usage();
}
