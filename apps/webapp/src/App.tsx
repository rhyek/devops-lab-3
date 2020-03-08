import React from 'react';
import { hot } from 'react-hot-loader/root';
import { useAuth } from './utils/auth';
import SplashScreen from './components/SplashScreen';
import Authenticated from './components/Authenticated';
import Anonymous from './components/Anonymous';

const App = () => {
  const { loading: authLoading, user } = useAuth();

  if (authLoading) {
    return <SplashScreen />;
  }

  return <div className="App">{user ? <Authenticated /> : <Anonymous />}</div>;
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
