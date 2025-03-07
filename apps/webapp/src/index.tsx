import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './utils/auth';
import { LoadingSpinnerProvider } from './utils/async-work';

ReactDOM.render(
  <LoadingSpinnerProvider>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </LoadingSpinnerProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
