import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { graphqlUploadExpress } from "graphql-upload";
import { ApolloServer } from "@apollo/server";
import express from "express";
import cors from "cors";
import http from "http";

import { typeDefs, resolvers } from "./src/endpoints/index.js";
import config from "./src/config/config.js";
import db from "./src/database/index.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  csrfPrevention: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

db.on("open", async () => {
  console.log("Database connected successfully");
  app.use(
    "/graphql",
    cors(),
    graphqlUploadExpress(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // const token = req.headers.authorization || "";
        // if (token === "") {
        //   return;
        // }
        // const Token = token.replace("Bearer", "").replace(/\s/g, "");
        // const user = await userService.getUserByToken(Token);
        // if (!user) throw new AuthenticationError("User not found");
        // return user;
      },
    })
  );

  await new Promise((resolve) => httpServer.listen({ port: 5000 }, resolve));
  console.log("Server ready at http://localhost:5000/graphql");
});

db.on("error", (error) => {
  console.log("DB connection failed", error);
});
