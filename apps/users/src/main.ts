import Koa from 'koa';
import Router from 'koa-router';

type User = {
  id: string;
  name: string;
};

const users: User[] = [];

const app = new Koa();
const router = new Router();
router.get('/', async ctx => {
  ctx.body = [1];
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
