import React, { useCallback } from 'react';
import * as firebase from 'firebase/app';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
// import PeopleIcon from '@material-ui/icons/People';
// import BarChartIcon from '@material-ui/icons/BarChart';
// import LayersIcon from '@material-ui/icons/Layers';
import { ExitToApp } from '@material-ui/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { MenuItem, List, Divider, ListItem, Button } from '@material-ui/core';
import { useAsyncWork } from '../utils/async-work';

function ListItemLink({ to, children }: React.PropsWithChildren<{ to: string }>) {
  const location = useLocation();

  return (
    <MenuItem button component={Link} to={to} selected={location.pathname === to}>
      {children}
    </MenuItem>
  );
}

export default function Menu() {
  const history = useHistory();
  const asyncWork = useAsyncWork();
  const signOut = useCallback(async () => {
    await asyncWork(async () => {
      await firebase.auth().signOut();
      history.push('/');
    });
  }, [history, asyncWork]);

  return (
    <>
      <List>
        {/* <ListItemLink to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemLink> */}
        <ListItemLink to="/todos">
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Todos" />
        </ListItemLink>
      </List>
      <Divider />
      <List>
        <ListItem component={Button} onClick={signOut}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </ListItem>
      </List>
    </>
  );
}
