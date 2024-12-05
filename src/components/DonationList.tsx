import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Link } from '@mui/material';
import { Donation, Currency } from "../types/types";

interface DonationListProps {
    donations: Donation[];
}

const DonationList: React.FC<DonationListProps> = ({ donations }) => {
    const getExplorerUrl = (hash: string) => {
        // Change this URL based on the network you're using
        return `https://etherscan.io/tx/${hash}`;
        // https://blockscan.com/tx/0x893e465506e5a27743e06ba0efd90605b56bbca2c4d996d8918f6d5748acf1d7
    };

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
                                    <Link
                                        href={getExplorerUrl(donation.tx_hash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        color="primary"
                                        variant="caption"
                                    >
                                        Tx: {donation.tx_hash.slice(0, 8)}...
                                    </Link>
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