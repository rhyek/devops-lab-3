import Koa from 'koa';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import morgan from 'koa-morgan';
import { isAxiosError } from './errors';

export function makeKoaApp<T = {}>(): Koa<T, {}> {
  const app = new Koa<T>();
  app.use(helmet());
  app.use(bodyParser());
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  app.use(async (ctx, next) => {
    await next();
    if (ctx._matchedRoute && typeof ctx.body === 'undefined') {
      ctx.body = null;
    }
  });
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data) {
        ctx.status = error.response.status;
        ctx.body = error.response.data;
      } else {
        throw error;
      }
    }
  });
  return app;
}
