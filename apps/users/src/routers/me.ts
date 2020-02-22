import Router from 'koa-router';

const meRouter = new Router({ prefix: '/me' });

meRouter.post('/update-profile', async ctx => {
  ctx.body = null;
});

export default meRouter;
