import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Login: React.FC = () => {
    const handleStreamlabsLogin = () => {
        window.location.href = 'https://streamlabs.com/api/v2.0/authorize?client_id=9da76297-69c2-4331-91df-1ceb46b95ea9&redirect_uri=https://cryptotip.elunesoft.com/auth&response_type=code&scope=donations.create%20donations.read%20alerts.create%20legacy.token%20socket.token%20points.read%20points.write%20alerts.write%20credits.write%20profiles.write%20jar.write%20wheel.write%20mediashare.control';
    };

    return (
        <Box
            sx={{
                maxWidth: 400,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 4,
                border: '1px solid #ccc',
                borderRadius: 2,
                boxShadow: 2,
                mt: 4,
                textAlign: 'center'
            }}
        >
            <Typography variant="h4" gutterBottom>
                Welcome to CrytoTip
            </Typography>
            <Box>
                <img src="/favicon.png" alt="Streamlabs Logo" style={{  height: '5rem' }} />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Connect your Streamlabs account to start receiving crypto donations.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={handleStreamlabsLogin}
                startIcon={<img src="/streamlabs_logo.png" alt="Streamlabs Logo" style={{  height: '2em' }} />}
                sx={{
                    backgroundColor: '#83f3d1',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
            </Button>

        </Box>
    );
};

export default Login;