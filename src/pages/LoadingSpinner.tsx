import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
    </Box>
);

export default LoadingSpinner;