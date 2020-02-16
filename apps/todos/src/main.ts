import Koa from 'koa';
import Router from 'koa-router';
import Decimal from 'decimal.js';

const app = new Koa();
const router = new Router();
router.get('/', async ctx => {
  ctx.body = `hi from todos!!!\n`;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
