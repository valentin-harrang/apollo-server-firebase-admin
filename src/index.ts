import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    addUser(username: String!, email: String!): User
    deleteUser(id: ID!): User
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }
`;

const users = [
  {
    id: 1,
    username: "johnsmith",
    email: "john@example.com",
  },
  {
    id: 2,
    username: "janesmith",
    email: "jane@example.com",
  },
];

const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find((user) => user.id === id),
  },
  Mutation: {
    addUser: (_, { username, email }) => {
      const newUser = {
        id: users.length + 1,
        username,
        email,
      };
      users.push(newUser);
      return newUser;
    },
    deleteUser: (_, { id }) => {
      const index = users.findIndex((user) => user.id === id);
      if (index !== -1) {
        const deletedUser = users[index];
        users.splice(index, 1);
        return deletedUser;
      }
      return null;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server);

console.log(`🚀 Server ready at ${url}`);
