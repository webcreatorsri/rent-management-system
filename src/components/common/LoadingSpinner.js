import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" p={3}>
      <CircularProgress />
    </Box>
  );
};

export default LoadingSpinner;