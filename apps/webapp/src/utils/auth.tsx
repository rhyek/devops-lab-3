import React, { useState, useEffect, PropsWithChildren, useContext, useCallback } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import axios, { AxiosInstance } from 'axios';

const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
firebase.initializeApp(firebaseConfig);

interface AuthContext {
  loading: boolean;
  user: firebase.User | null;
  axios: AxiosInstance | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContext>(null as any);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [interceptor, setInterceptor] = useState<number | null>(null);

  const initialize = useCallback(
    async (user: firebase.User | null) => {
      setUser(user);
      if (interceptor !== null) {
        axios.interceptors.request.eject(interceptor);
      }
      if (user) {
        const newInterceptor = axios.interceptors.request.use(
          async (config) => {
            const idToken = await user.getIdToken();
            config.headers.authorization = `Bearer ${idToken}`;
            return config;
          },
          (error) => {
            return Promise.reject(error);
          },
        );
        setInterceptor(newInterceptor);
        await axios.post('/api/users/me/update-profile');
      }
    },
    [interceptor],
  );

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      try {
        await initialize(user);
      } finally {
        setLoading(false);
        unsubscribe();
      }
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setLoading(true);
      try {
        const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
        if (user) {
          await user.updateProfile({ displayName });
          await user.getIdToken(true);
          await initialize(user);
        } else {
          throw new Error('No user');
        }
      } finally {
        setLoading(false);
      }
    },
    [initialize],
  );

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean) => {
      setLoading(true);
      try {
        await firebase
          .auth()
          .setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
        const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
        await initialize(user);
      } finally {
        setLoading(false);
      }
    },
    [initialize],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebase.auth().signOut();
      await initialize(null);
    } finally {
      setLoading(false);
    }
  }, [initialize]);

  return (
    <AuthContext.Provider value={{ loading, user, axios, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
