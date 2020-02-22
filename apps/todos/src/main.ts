import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import uuid from 'uuid/v4';
import { Task } from '../../@shared/tasks';

const app = new Koa();
app.use(bodyParser());
const router = new Router();
const tasks: Task[] = [];

router.get('/', async ctx => {
  ctx.body = tasks;
});

router.post('/', async ctx => {
  const task: { description: string } = ctx.request.body;
  tasks.push({
    id: uuid(),
    description: task.description,
    owner: '2',
    assignedTo: null,
  });
  ctx.body = null;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
  console.log('Listening on 8080');
});
