import React from 'react';
import { CircularProgress } from '@material-ui/core';
import classNames from 'classnames';
import useGeneralStyles from '../utils/styles';

export default function SplashScreen() {
  const styles = useGeneralStyles();
  return (
    <div className={classNames(styles.center, styles.expand)}>
      <CircularProgress color="secondary" />
    </div>
  );
}
