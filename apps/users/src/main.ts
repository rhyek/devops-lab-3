import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import morgan from 'koa-morgan';
import meRouter from './routers/me';
import './data';
import allRouter from './routers/all';

const app = new Koa();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser());
const router = new Router();

app.use(router.routes()).use(router.allowedMethods());
app.use(meRouter.routes()).use(meRouter.allowedMethods());
app.use(allRouter.routes()).use(allRouter.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
