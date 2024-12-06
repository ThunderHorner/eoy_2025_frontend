import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Alert, Container } from '@mui/material';

const StreamlabsAuth = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
            fetch('http://localhost:8000/api/v1/users/streamlabs-auth/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
                .then(res => {
                    if (!res.ok) throw new Error('Auth failed');
                    return res.json();
                })
                .then(data => {
                    // Store tokens and user data
                    localStorage.setItem('access', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    localStorage.setItem('userData', JSON.stringify(data.user));

                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                })
                .catch(err => {
                    console.error('Auth error:', err);
                    setError(err.message);
                });
        } else {
            setError('No authorization code found');
        }
    }, []);

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                {error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        <CircularProgress />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Authenticating with Streamlabs...
                        </Alert>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default StreamlabsAuth;