import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import DonationList from "../components/DonationList";
import { Donation } from "../types/types";

interface DonationsCardProps {
    donations: Donation[];
}

const DonationsCard = ({ donations }: DonationsCardProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: 2,
                maxWidth: '100%',
                overflow: 'hidden'
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" gutterBottom sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mb: 3,
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}>
                    Recent Donations
                </Typography>
                <DonationList donations={donations} />
            </CardContent>
        </Card>
    );
};

export default DonationsCard;