import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from '../components/CustomButton';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <Box textAlign="center">
            <Typography variant="h4" gutterBottom>
                Welcome to the Donation Platform
            </Typography>
            <Typography variant="body1" gutterBottom>
                Support campaigns or create your own to raise funds for a cause.
            </Typography>
            <Box display="flex" justifyContent="center" gap={2} marginTop={3}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <CustomButton label="Login" />
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    <CustomButton label="Register" />
                </Link>
                <Link to="/campaigns" style={{ textDecoration: 'none' }}>
                    <CustomButton label="View Campaigns" />
                </Link>
            </Box>
        </Box>
    );
};

export default Home;
