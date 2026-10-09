const host = process.env.sky_HOST ?? 'localhost';
const port = Number(process.env.sky_PORT ?? 4000);
const path = process.env.sky_PATH ?? '/sky';

const authority = port === 80 ? host : `${host}:${port}`;

export const config = {
  host,
  port,
  path,
  httpUrl: `http://${authority}${path}`,
  wsUrl: `ws://${authority}${path}`,
};
