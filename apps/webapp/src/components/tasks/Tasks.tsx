import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Paper, makeStyles, Grid, Button, IconButton, CircularProgress } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { v4 as uuid } from 'uuid';
import 'firebase/firestore';
import Title from '../Title';
import TaskComponent from './Task';
import { OtherUser } from '../../../../@shared/types/users';
import { useAuthenticated } from '../Authenticated';
import { TaskPayload, TaskDocument } from '../../../../@shared/types/task';
import { useData } from '../../utils/data';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Tasks() {
  const classes = useStyles();

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<OtherUser[]>([]);
  const [currentTask, setCurrentTask] = useState<{ isNew: boolean; task: TaskPayload } | null>(null);
  const { axios } = useAuthenticated();

  const { tasks } = useData();

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
      tasks
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(t => ({
          task: t,
          assignee: t.assigneeId !== null ? users.find(u => u.id === t.assigneeId)?.name : null,
          completed: t.completed ? <Check /> : null,
        })),
    [users, tasks],
  );

  const closeTask = useCallback(() => {
    setCurrentTask(null);
  }, []);

  const createNewTask = useCallback(() => {
    setCurrentTask({
      isNew: true,
      task: {
        id: uuid(),
        description: '',
        assigneeId: null,
        completed: false,
      },
    });
  }, []);

  const editTask = useCallback((task: TaskDocument) => {
    setCurrentTask({
      isNew: false,
      task,
    });
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Title>Tasks</Title>
            {loading ? (
              <Grid container item justify="center">
                <CircularProgress color="secondary" />
              </Grid>
            ) : error !== null ? (
              <span>An error ocurred while loading data...</span>
            ) : tasks.length > 0 ? (
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
                  {composed.map(task => (
                    <TableRow key={task.task.id}>
                      <TableCell>{task.task.description}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell align="center">{task.completed}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => editTask(task.task)}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>No tasks</div>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="flex-end">
              <Button variant="contained" color="primary" onClick={createNewTask}>
                New
              </Button>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      {currentTask && <TaskComponent onClose={closeTask} users={users} {...currentTask} />}
    </>
  );
}
