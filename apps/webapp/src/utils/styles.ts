import { makeStyles } from '@material-ui/core';

const useGeneralStyles = makeStyles({
  center: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expand: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

export default useGeneralStyles;
