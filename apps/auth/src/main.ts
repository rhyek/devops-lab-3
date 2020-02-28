import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { Unauthorized } from 'http-errors';
import admin from 'firebase-admin';
import { DecodedIdTokenData } from '../../@shared/auth';

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string)),
});

const app = new Koa();
app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log('path', ctx.request.path, 'method', ctx.request.method);
  await next();
});

const router = new Router();

router.get('/verify-jwt', async ctx => {
  const header: string | undefined = ctx.request.headers.authorization;
  if (!header) {
    throw new Unauthorized('Authorization header empty');
  }
  const [, token] = header.split('Bearer ');
  if (!token) {
    throw new Unauthorized('Id token not present in authorization header');
  }
  const { uid, ...rest } = await admin.auth().verifyIdToken(token);
  const userData: DecodedIdTokenData = {
    id: uid,
    name: (rest as any).name,
    email: (rest as any).email,
    emailVerified: (rest as any).email_verified,
  };
  ctx.set('x-user-data', JSON.stringify(userData));
  ctx.body = '';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
