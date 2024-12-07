import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Link } from '@mui/material';
import { Donation } from "../types/types";

interface DonationListProps {
    donations: Donation[];
}

const DonationList: React.FC<DonationListProps> = ({ donations }) => {
    const getExplorerUrl = (hash: string) => {
        return `https://scan.request.network/request/${hash}`
    };

    if (donations.length === 0) {
        return <Typography>No donations yet. Be the first to contribute!</Typography>;
    }

    return (
        <Grid container spacing={2}>
            {donations.map((donation) => (
                <Grid item xs={12} sm={12} md={6} xl={3} key={donation.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="body1">
                                <strong>{donation.name || 'Anonymous'}</strong> {' '}
                                <br/>
                                <strong>{parseFloat(donation.amount)} {donation.currency} ~ {'$'}{parseFloat(donation.amount_usd)}</strong>

                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {donation.message || 'No message provided.'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(donation.created_at).toLocaleString()}
                                </Typography>

                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {donation.tx_hash && (
                                        <Link
                                            href={getExplorerUrl(donation.tx_hash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            color="primary"
                                            variant="caption"
                                        >
                                            Tx: {donation.tx_hash.slice(0, 20)}...
                                        </Link>
                                    )}
                                </Typography>

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default DonationList;