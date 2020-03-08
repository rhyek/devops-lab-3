import Router from 'koa-router';
import { getAuthenticatedUserData } from '../../../@shared/auth';
import { saveUser } from '../data';
import { UserRecord } from '../../../@shared/types/users';

const meRouter = new Router({ prefix: '/me' });

meRouter.post('/update-profile', async ctx => {
  const userData = getAuthenticatedUserData(ctx);
  console.log(userData);
  const newUser: UserRecord = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    external_id: userData.id,
  };
  await saveUser(newUser);
  ctx.body = null;
});

export default meRouter;
