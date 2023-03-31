import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const typeDefs = `#graphql
  type User {
    uid: ID!
    email: String
    phoneNumber: String
    displayName: String
    photoURL: String
  }

  input CreateUserInput {
    email: String
    phoneNumber: String
    password: String!
    displayName: String
    photoURL: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  type Query {
    hello: String
  }
`;

const resolvers = {
  Mutation: {
    async createUser(_, { input }) {
      try {
        const { email, phoneNumber, password, displayName, photoURL } = input;

        let userRecord;

        // Check if the user wants to use email or phone number
        if (email) {
          // Create user in Firebase Authentication with email
          userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            photoURL,
          });
        } else if (phoneNumber) {
          // Create user in Firebase Authentication with phone number
          userRecord = await admin.auth().createUser({
            phoneNumber,
            password,
            displayName,
            photoURL,
          });
        } else {
          throw new Error(
            "You must provide either an email or a phone number."
          );
        }

        // Return user information
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          phoneNumber: userRecord.phoneNumber,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server);

console.log(`🚀 Server ready at ${url}`);
