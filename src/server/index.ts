import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { seed } from './data.js';
import { config } from '../shared/config.js';

seed();

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({ server: httpServer, path: config.path });
const wsCleanup = useServer({ schema }, wsServer);

const apollo = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsCleanup.dispose();
          },
        };
      },
    },
  ],
});

await apollo.start();

app.use(config.path, cors<cors.CorsRequest>(), express.json(), expressMiddleware(apollo));

httpServer.listen(config.port, () => {
  console.log(`query/mutation endpoint: ${config.httpUrl}`);
  console.log(`subscription endpoint:   ${config.wsUrl}`);
});
