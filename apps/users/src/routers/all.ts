import Router from 'koa-router';
import { pgDb } from '../data';
import { OtherUser } from '../../../@shared/types/users';

const allRouter = new Router({ prefix: '/' });

allRouter.get('/', async ctx => {
  const users: OtherUser[] = (await pgDb.manyOrNone('select * from users')).map(r => ({
    id: r.id,
    email: r.email,
    name: r.name,
  }));
  ctx.body = users;
});

export default allRouter;
