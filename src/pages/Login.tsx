import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserCredentials {
    email: string;
    password: string;
}

interface AuthTokens {
    access: string;
    refresh: string;
}

const Login: React.FC = () => {
    const [formData, setFormData] = useState<UserCredentials>({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Hook to programmatically navigate

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error state
        try {
            const response = await axios.post<AuthTokens>('http://localhost:8000/api/v1/token/', formData);
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            navigate('/dashboard'); // Redirect to the management dashboard
        } catch (error: any) {
            setError(error.response?.data?.detail || 'Invalid credentials');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
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
            }}
        >
            <Typography variant="h4" textAlign="center" gutterBottom>
                Login
            </Typography>
            {error && (
                <Typography color="error" textAlign="center">
                    {error}
                </Typography>
            )}
            <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
            />
            <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
            </Button>
        </Box>
    );
};

export default Login;
