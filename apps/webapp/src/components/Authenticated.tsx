import React, { useContext } from 'react';
import { AxiosInstance } from 'axios';
import Dashboard from './Dashboard';
import { useAuth } from '../utils/auth';
import { DataProvider } from '../utils/data';

interface AuthenticatedContext {
  user: firebase.User;
  axios: AxiosInstance;
}

const AuthenticatedContext = React.createContext<AuthenticatedContext>(null as any);

export function useAuthenticated() {
  return useContext(AuthenticatedContext);
}

export default function Authenticated() {
  const { user, axios } = useAuth();

  if (!user || !axios) {
    return null;
  }

  return (
    <AuthenticatedContext.Provider value={{ user, axios }}>
      <DataProvider>
        <Dashboard />
      </DataProvider>
    </AuthenticatedContext.Provider>
  );
}
