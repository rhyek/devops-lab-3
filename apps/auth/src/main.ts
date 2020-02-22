import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log('path', ctx.request.path, 'method', ctx.request.method);
  await next();
});

const router = new Router();

router.get('/verify-jwt', async ctx => {
  console.log('id token', ctx.request.headers.authorization);
  ctx.body = null;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
