import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography } from '@mui/material';

interface RegisterData {
    battletag: string;
    email: string;
    password: string;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        battletag: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/users/register/', formData);
            alert('Registration successful!');
        } catch (error: any) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
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
                Register
            </Typography>
            {error && (
                <Typography color="error" textAlign="center">
                    {error}
                </Typography>
            )}
            <TextField
                label="BattleTag"
                name="battletag"
                value={formData.battletag}
                onChange={handleChange}
                required
                fullWidth
            />
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
                Register
            </Button>
        </Box>
    );
};

export default Register;
