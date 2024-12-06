import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
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

            <Box component="footer" bgcolor="#f5f5f5" padding={2} textAlign="center">
                <Typography variant="body2">© 2024 CrytoTip. All rights reserved.</Typography>
            </Box>
        </Box>
    );
};

export default Layout;