import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('access') !== null;

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.clear()
        window.location.reload();
    };

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <AppBar position="static">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component={Link} to="/" sx={{
                        color: 'inherit',
                        textDecoration: 'none'
                    }}>
                        CrytoTip
                    </Typography>
                    {isAuthenticated && (
                        <Button color="inherit" onClick={handleLogout}>
                            Logout <LogoutIcon sx={{marginLeft:2}}/>
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="main" flexGrow={1} padding={2}>
                {children}
            </Box>

            <Box
                component="footer"
                sx={{
                    bgcolor: '#f5f5f5',
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    textAlign: 'center'
                }}
            >
                <Typography variant="body2" sx={{ mb: 1 }}>
                    © 2024 CrytoTip. All rights reserved.
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <a
                        href="https://request.network/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        Powered by Request Network
                        <img
                            src="/request.png"
                            alt="Request Network logo"
                            style={{
                                height: '20px',
                                width: '20px'
                            }}
                        />
                    </a>
                </Typography>
            </Box>
        </Box>
    );
};

export default Layout;