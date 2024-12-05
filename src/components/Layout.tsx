import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Donation Platform
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box component="main" flexGrow={1} padding={2}>
                {children}
            </Box>

            {/* Footer (Optional) */}
            <Box component="footer" bgcolor="#f5f5f5" padding={2} textAlign="center">
                <Typography variant="body2">© 2024 Donation Platform. All rights reserved.</Typography>
            </Box>
        </Box>
    );
};

export default Layout;
