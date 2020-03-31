import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Paper, makeStyles, Grid, Button, IconButton, CircularProgress } from '@material-ui/core';
import { Edit, Check, Delete } from '@material-ui/icons';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { v4 as uuid } from 'uuid';
import 'firebase/firestore';
import Title from '../Title';
import TaskComponent from './Todo';
import { OtherUser } from '../../../../@shared/types/users';
import { useAuthenticated } from '../Authenticated';
import { TaskPayload, TaskDocument } from '../../../../@shared/types/todo';
import { useData } from '../../utils/data';
import { useAsyncWork } from '../../utils/async-work';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Todos() {
  const classes = useStyles();

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<OtherUser[]>([]);
  const [currentTodo, setCurrentTodo] = useState<{ isNew: boolean; todo: TaskPayload } | null>(null);
  const { axios } = useAuthenticated();
  const asyncWork = useAsyncWork();

  const { todos } = useData();

  useEffect(() => {
    (async () => {
      try {
        const [{ data: users }] = await Promise.all([axios.get<OtherUser[]>('/api/users')]);
        setUsers(users);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const composed = useMemo(
    () =>
      todos
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((t) => ({
          todo: t,
          assignee: t.assigneeId !== null ? users.find((u) => u.id === t.assigneeId)?.name : null,
          completed: t.completed ? <Check /> : null,
        })),
    [users, todos],
  );

  const closeTodo = useCallback(() => {
    setCurrentTodo(null);
  }, []);

  const createNewTodo = useCallback(() => {
    setCurrentTodo({
      isNew: true,
      todo: {
        id: uuid(),
        description: '',
        assigneeId: null,
        completed: false,
      },
    });
  }, []);

  const editTodo = useCallback((todo: TaskDocument) => {
    setCurrentTodo({
      isNew: false,
      todo,
    });
  }, []);

  const deleteTodo = useCallback(
    async (todo: TaskDocument) => {
      // eslint-disable-next-line
      if (confirm('Are you sure?')) {
        await asyncWork(async () => {
          await axios.delete(`/api/todos/${todo.id}`);
        });
      }
    },
    [asyncWork, axios],
  );

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Title>Todos</Title>
            {loading ? (
              <Grid container item justify="center">
                <CircularProgress color="secondary" />
              </Grid>
            ) : error !== null ? (
              <span>An error ocurred while loading data...</span>
            ) : todos.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Asignee</TableCell>
                    <TableCell align="center">Completed</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {composed.map((todo) => (
                    <TableRow key={todo.todo.id}>
                      <TableCell>{todo.todo.description}</TableCell>
                      <TableCell>{todo.assignee}</TableCell>
                      <TableCell align="center">{todo.completed}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => editTodo(todo.todo)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteTodo(todo.todo)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>No todos</div>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="flex-end">
              <Button variant="contained" color="primary" onClick={createNewTodo}>
                New
              </Button>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      {currentTodo && <TaskComponent onClose={closeTodo} users={users} {...currentTodo} />}
    </>
  );
}
