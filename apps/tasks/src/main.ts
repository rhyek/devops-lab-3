import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import morgan from 'koa-morgan';
import { pgDb, save } from './data';
import { getAuthenticatedUserData } from '../../@shared/auth';
import { taskPayloadSchema } from '../../@shared/schemas/yup/tasks';
import { TaskRecord, TaskPayload, TaskDocument } from '../../@shared/types/task';

const app = new Koa();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser());
const router = new Router();

router.get('/', async ctx => {
  const tasks: TaskDocument[] = (await pgDb.manyOrNone<TaskRecord>('select * from tasks')).map(r => ({
    id: r.id,
    description: r.description,
    ownerId: r.owner_id,
    assigneeId: r.assignee_id,
    completed: r.completed,
    createdAt: r.created_at,
  }));
  ctx.body = tasks;
});

router.post('/', async ctx => {
  const userData = getAuthenticatedUserData(ctx);
  const input = await taskPayloadSchema.validate(ctx.request.body);
  const data: Omit<TaskRecord, 'created_at'> = {
    id: input.id,
    description: input.description,
    owner_id: userData.id,
    assignee_id: input.assigneeId,
    completed: input.completed,
  };
  const persisted = await save(data);
  ctx.body = persisted;
});

router.patch('/:id', async ctx => {
  const userData = getAuthenticatedUserData(ctx);
  const input = await taskPayloadSchema.validate(ctx.request.body);
  const data: Omit<TaskRecord, 'created_at'> = {
    id: ctx.params.id,
    description: input.description,
    owner_id: userData.id,
    assignee_id: input.assigneeId,
    completed: input.completed,
  };
  const persisted = await save(data);
  ctx.body = persisted;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
