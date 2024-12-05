import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
// import { Donation, Currency } from './types';
import {Donation, Currency} from "../types/types.ts";

interface DonationListProps {
    donations: Donation[];
}

const DonationList: React.FC<DonationListProps> = ({ donations }) => {
    if (donations.length === 0) {
        return <Typography>No donations yet. Be the first to contribute!</Typography>;
    }

    return (
        <Grid container spacing={2}>
            {donations.map((donation) => (
                <Grid item xs={12} key={donation.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="body1">
                                <strong>{donation.name || 'Anonymous'}</strong> donated{' '}
                                {parseFloat(donation.amount).toFixed(donation.currency === Currency.USDT ? 2 : 6)}{' '}
                                {donation.currency}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {donation.message || 'No message provided.'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(donation.created_at).toLocaleString()}
                                </Typography>
                                {donation.tx_hash && (
                                    <Typography variant="caption" color="textSecondary">
                                        Tx: {donation.tx_hash.slice(0, 8)}...
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default DonationList;