import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler, handlers, } from "@as-integrations/aws-lambda";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "")),
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

  input UpdateUserInput {
    email: String
    phoneNumber: String
    password: String
    displayName: String
    photoURL: String
    disabled: Boolean
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
  }

  type Query {
    hello: String
    getUser(id: ID!): User!
  }
`;
const resolvers = {
    Mutation: {
        async createUser(_, { input }) {
            const { email, phoneNumber, password, displayName, photoURL } = input;
            try {
                // Create user in Firebase Authentication with email
                const userRecord = await admin.auth().createUser({
                    email,
                    password,
                    displayName,
                    photoURL,
                    phoneNumber,
                });
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    phoneNumber: userRecord.phoneNumber,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        updateUser(_, { id, input }) {
            return admin.auth().updateUser(id, input);
        },
        deleteUser(_, { id }) {
            return admin.auth().deleteUser(id);
        },
    },
    Query: {
        getUser(_, { id }) {
            return admin.auth().getUser(id);
        },
    },
};
const server = new ApolloServer({ typeDefs, resolvers });
export const graphqlHandler = startServerAndCreateLambdaHandler(server, 
// We will be using the Proxy V2 handler
handlers.createAPIGatewayProxyEventV2RequestHandler());
