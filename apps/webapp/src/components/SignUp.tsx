import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
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
import firebase from 'firebase/app';
import mem from 'mem';
import EasyField from './EasyField';
import { useAsyncWork } from '../utils/async-work';
import Copyright from './Copyright';

const useStyles = makeStyles(theme => ({
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

async function _checkEmailExists(email: string) {
  try {
    yup
      .string()
      .email()
      .validateSync(email);
    const result = await firebase.auth().fetchSignInMethodsForEmail(email);
    if (result.length > 0) {
      return false;
    }
  } catch {}
  return true;
}

const checkEmailExists = mem(_checkEmailExists, { maxAge: 600_000 });

export default function SignUp() {
  const classes = useStyles();
  const asyncWork = useAsyncWork();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Formik<Values>
          initialValues={{ firstName: '', lastName: '', email: '', password: '' }}
          validationSchema={yup.object<Values>({
            firstName: yup
              .string()
              .required()
              .label('This'),
            lastName: yup
              .string()
              .required()
              .label('This'),
            email: yup
              .string()
              .required()
              .email()
              .test('email-exists', 'Email address already in use', checkEmailExists)
              .label('This'),
            password: yup
              .string()
              .required()
              .label('This'),
          })}
          onSubmit={async (values, formikHelpers) => {
            await asyncWork(async () => {
              try {
                const created = await firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
                if (created.user) {
                  await created.user.updateProfile({ displayName: `${values.firstName} ${values.lastName}` });
                  return true;
                } else {
                  throw new Error('No user');
                }
              } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                  formikHelpers.setFieldError('email', 'Email address already in use');
                } else {
                  throw error;
                }
              }
            });
          }}
          validateOnBlur={false}
        >
          {() => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <EasyField<Values> name="firstName">
                    {({ field, hasError, error }) => (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="First Name"
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <EasyField<Values> name="lastName">
                    {({ field, hasError, error }) => (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="Last Name"
                        inputProps={{
                          required: false,
                        }}
                        error={hasError}
                        helperText={error}
                        {...field}
                      />
                    )}
                  </EasyField>
                </Grid>
                <Grid item xs={12}>
                  <EasyField<Values> name="email">
                    {({ field, hasError, error }) => (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="Email Address"
                        autoComplete="email"
                        inputProps={{
                          required: false,
                        }}
                        error={hasError}
                        helperText={error}
                        {...field}
                      />
                    )}
                  </EasyField>
                </Grid>
                <Grid item xs={12}>
                  <EasyField<Values> name="password">
                    {({ field, hasError, error }) => (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        inputProps={{
                          required: false,
                        }}
                        error={hasError}
                        helperText={error}
                        {...field}
                      />
                    )}
                  </EasyField>
                </Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                Sign Up
              </Button>
              <Grid container justify="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/sign-in" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}
