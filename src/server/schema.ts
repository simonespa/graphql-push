export const typeDefs = /* GraphQL */ `
  type Author {
    id: ID!
    name: String!
    bio: String!
    country: String!
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    genre: String!
    publishedYear: Int!
    rating: Float!
    author: Author!
  }

  enum BookEventType {
    ADDED
    UPDATED
    DELETED
  }

  type BookEvent {
    type: BookEventType!
    book: Book!
    at: String!
  }

  type Query {
    books(limit: Int, genre: String): [Book!]!
    book(id: ID!): Book
    authors(limit: Int): [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    "Create a book with faker-generated values for any field left out."
    addBook(title: String, genre: String, rating: Float, authorId: ID): Book!
    "Update an existing book; omitted fields stay unchanged."
    updateBook(id: ID!, title: String, genre: String, rating: Float): Book!
    deleteBook(id: ID!): Book!
    "Pick a random book and randomise its fields - handy to trigger a push."
    shuffleRandomBook: Book!
    addAuthor(name: String, country: String): Author!
  }

  type Subscription {
    "Every add/update/delete, optionally filtered by genre."
    bookEvents(genre: String): BookEvent!
    bookAdded: Book!
    bookUpdated: Book!
  }
`;
