const host = process.env.GRAPHQL_HOST ?? 'localhost';
const port = Number(process.env.GRAPHQL_PORT ?? 4000);
const path = process.env.GRAPHQL_PATH ?? '/graphql';

const authority = port === 80 ? host : `${host}:${port}`;

export const config = {
  host,
  port,
  path,
  httpUrl: `http://${authority}${path}`,
  wsUrl: `ws://${authority}${path}`,
};
