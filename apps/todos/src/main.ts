import Router from 'koa-router';
import changeCaseObject from 'change-case-object';
import axios from 'axios';
import { pgDb, save } from './data';
import { getAuthenticatedUserData } from '../../@shared/auth';
import { taskPayloadSchema } from '../../@shared/schemas/yup/todos';
import { TaskRecord, TaskDocument } from '../../@shared/types/todo';
import { makeKoaApp } from '../../@shared/utils/http';

const app = makeKoaApp();
const router = new Router();

router.get('/', async (ctx) => {
  const todos: TaskDocument[] = (await pgDb.manyOrNone<TaskRecord>('select * from todos')).map(
    changeCaseObject.camel,
  ) as any;
  ctx.body = todos;
});

router.post('/', async (ctx) => {
  const userData = getAuthenticatedUserData(ctx);
  const input = await taskPayloadSchema.validate(ctx.request.body);
  const data: Omit<TaskRecord, 'created_at'> = { ...(changeCaseObject.snake(input) as any), owner_id: userData.id };
  const persisted = await save(data);
  ctx.body = persisted;
});

router.patch('/:id', async (ctx) => {
  const input = await taskPayloadSchema.validate(ctx.request.body);
  await axios.patch(`http://orleans-service/todos/${ctx.params.id}`, input);
  ctx.body = null;
});

router.delete('/:id', async (ctx) => {
  await pgDb.none('delete from todos where id = $1', ctx.params.id);
  ctx.body = null;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
