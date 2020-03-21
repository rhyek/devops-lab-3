import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  makeStyles,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { Formik, Form } from 'formik';
import { taskPayloadSchema } from '../../../../@shared/schemas/yup/todos';
import EasyField from '../EasyField';
import { TaskPayload } from '../../../../@shared/types/todo';
import { OtherUser } from '../../../../@shared/types/users';
import { useAuthenticated } from '../Authenticated';
import { useAsyncWork } from '../../utils/async-work';

interface TaskProps {
  onClose: () => void;
  isNew: boolean;
  todo: TaskPayload;
  users: OtherUser[];
}

const useStyles = makeStyles(theme => ({
  formControl: {},
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Todo(props: TaskProps) {
  const { onClose: handleClose, isNew, todo, users } = props;
  const classes = useStyles();
  const { axios } = useAuthenticated();
  const asyncWork = useAsyncWork();

  return (
    <Formik<TaskPayload>
      initialValues={todo}
      validationSchema={taskPayloadSchema}
      onSubmit={async values => {
        const validated = taskPayloadSchema.validateSync(values);
        await asyncWork(async () => {
          if (isNew) {
            await axios.post('/api/todos', validated);
          } else {
            await axios.patch(`/api/todos/${todo.id}`, validated);
          }
          handleClose();
        });
      }}
    >
      {() => (
        <Dialog maxWidth="xs" fullWidth open={true} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{isNew ? 'New Todo' : 'Edit Todo'}</DialogTitle>
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <EasyField<TaskPayload> name="description">
                    {({ field }) => (
                      <TextField
                        multiline
                        rows={3}
                        rowsMax={7}
                        autoFocus
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        {...field}
                      />
                    )}
                  </EasyField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EasyField<TaskPayload> name="assigneeId">
                    {({ field }) => (
                      <FormControl className={classes.formControl} fullWidth>
                        <InputLabel shrink>Assignee</InputLabel>
                        <Select displayEmpty {...field} value={field.value ?? ''}>
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </EasyField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EasyField<TaskPayload> name="completed">
                    {({ field }) => (
                      <FormControlLabel
                        control={<Checkbox color="primary" checked={field.value} {...field} />}
                        label="Completed"
                      />
                    )}
                  </EasyField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </Form>
        </Dialog>
      )}
    </Formik>
  );
}
