import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { Campaign } from '../types/campaign';

const CampaignList: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get<Campaign[]>('http://localhost:8000/donation/campaigns/');
                setCampaigns(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCampaigns();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Campaigns
            </Typography>
            <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                    <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{campaign.title}</Typography>
                                <Typography variant="body2">
                                    Goal: ${campaign.goal.toFixed(2)}
                                </Typography>
                                <Typography variant="body2">
                                    Collected: ${campaign.collected.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CampaignList;
