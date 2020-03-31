import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link as RouterLink } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import EasyField from './EasyField';
import { useAsyncWork } from '../utils/async-work';
import Copyright from './Copyright';
import { useAuth } from '../utils/auth';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

interface Values {
  email: string;
  password: string;
  remember: boolean;
}

export default function SignIn() {
  const classes = useStyles();
  const { signIn } = useAuth();
  const asyncWork = useAsyncWork();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Formik<Values>
          initialValues={{ email: '', password: '', remember: true }}
          validationSchema={yup.object({
            email: yup.string().required().email().label('This'),
            password: yup.string().required().label('This'),
          })}
          onSubmit={async (values) => {
            await asyncWork(async () => {
              const { email, password, remember } = values;
              await signIn(email, password, remember);
            });
          }}
        >
          {() => (
            <Form className={classes.form}>
              <EasyField<Values> name="email">
                {({ field, hasError, error }) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    autoComplete="email"
                    autoFocus
                    inputProps={{
                      required: false,
                    }}
                    error={hasError}
                    helperText={error}
                    {...field}
                  />
                )}
              </EasyField>
              <EasyField<Values> name="password">
                {({ field, hasError, error }) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    inputProps={{
                      required: false,
                    }}
                    error={hasError}
                    helperText={error}
                    {...field}
                  />
                )}
              </EasyField>
              <EasyField<Values> name="remember">
                {({ field }) => (
                  <FormControlLabel
                    control={<Checkbox color="primary" checked={field.value} {...field} />}
                    label="Remember me"
                  />
                )}
              </EasyField>
              <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to="/sign-up" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
