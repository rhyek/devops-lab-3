import React from 'react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
// import PeopleIcon from '@material-ui/icons/People';
// import BarChartIcon from '@material-ui/icons/BarChart';
// import LayersIcon from '@material-ui/icons/Layers';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem, List } from '@material-ui/core';

function ListItemLink({ to, children }: React.PropsWithChildren<{ to: string }>) {
  const location = useLocation();

  return (
    <MenuItem button component={Link} to={to} selected={location.pathname === to}>
      {children}
    </MenuItem>
  );
}

export default function Menu() {
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
    </>
  );
}
