import koa from 'koa';
import cors from '@koa/cors';
import koaBodyparser from 'koa-bodyparser';
import config from './common/config';

const app = new koa();

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

app.use(koaBodyparser({
  jsonLimit: config.TRAFFIC_MAX_JSON_PAYLOAD,
}));

import errorParser from './controller/error-parser';
import allRoutes from './routes/all-routes';

app.use(errorParser);
app.use(allRoutes);

const server = app.listen(config.SERVICE_PORT, async () => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
    console.log(`Server started at port ${config.SERVICE_PORT}.`);
  }
});

export default server;
