import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import NotFound from './NotFound';

export default function Anonymous() {
  return (
    <Switch>
      <Route path="/sign-up">
        <SignUp />
      </Route>
      <Route path="/sign-in">
        <SignIn />
      </Route>
      <Route exact path="/">
        <Redirect to="/sign-in" />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
