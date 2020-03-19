import React, { useState, useEffect, PropsWithChildren, useContext } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import axios, { AxiosInstance } from 'axios';

const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
firebase.initializeApp(firebaseConfig);

interface AuthContext {
  loading: boolean;
  user: firebase.User | null;
  axios: AxiosInstance | null;
}

const AuthContext = React.createContext<AuthContext>(null as any);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onIdTokenChanged(async user => {
      setLoading(true);
      setUser(user);
      if (user) {
        axios.interceptors.request.use(
          async config => {
            const idToken = await user.getIdToken();
            config.headers.authorization = `Bearer ${idToken}`;
            return config;
          },
          error => {
            return Promise.reject(error);
          },
        );
        if (loading) {
          await axios.post('/api/users/me/update-profile');
        }
      } else {
        axios.defaults.headers.authorization = undefined;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <AuthContext.Provider value={{ loading, user, axios }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
