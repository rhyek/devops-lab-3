import React, { useCallback, useState, useContext } from 'react';
import classNames from 'classnames';
import { getErrorMessage } from './errors';
import useGeneralStyles from './styles';
import { makeStyles, CircularProgress } from '@material-ui/core';

interface ILoadingSpinnerContext {
  showing: boolean;
  show: () => void;
  hide: () => void;
}

const LoadingSpinnerContext = React.createContext<ILoadingSpinnerContext>(null as any);

const useStyles = makeStyles({
  overlay: {
    backgroundColor: 'rgb(0, 0, 0, 0.1)',
    zIndex: 10000,
  },
});

export function LoadingSpinnerProvider({ children }: React.PropsWithChildren<{}>) {
  const [counter, setCounter] = useState(0);
  const showing = counter > 0;
  const show = useCallback(() => {
    setCounter(showing => showing + 1);
  }, []);
  const hide = useCallback(() => {
    setCounter(showing => {
      if (showing === 0) {
        throw new Error('Cannot hide');
      }
      return showing - 1;
    });
  }, []);
  const generalClasses = useGeneralStyles();
  const classes = useStyles();
  return (
    <LoadingSpinnerContext.Provider value={{ showing, show, hide }}>
      <>
        <div
          className={classNames(generalClasses.expand, generalClasses.center, classes.overlay)}
          style={{ display: showing ? 'flex' : 'none' }}
        >
          <CircularProgress color="secondary" />
        </div>
        {children}
      </>
    </LoadingSpinnerContext.Provider>
  );
}

export function useAsyncWork<T>() {
  const { show, hide } = useContext(LoadingSpinnerContext);
  const fn = useCallback(
    async (work: () => Promise<T>) => {
      try {
        show();
        const result = await work();
        return result;
      } catch (error) {
        alert(getErrorMessage(error));
        throw error;
      } finally {
        hide();
      }
    },
    [hide, show],
  );
  return fn;
}
