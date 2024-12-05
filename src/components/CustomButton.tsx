import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
    label: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ label, ...props }) => {
    return (
        <Button variant="contained" color="primary" {...props}>
            {label}
        </Button>
    );
};

export default CustomButton;
