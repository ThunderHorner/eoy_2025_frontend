import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { Campaign } from '../types/campaign';

const CampaignDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get the campaign ID from the route
    const [campaign, setCampaign] = useState<Campaign | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await axios.get<Campaign>(`http://localhost:8000/api/v1/donation/campaigns/${id}/`);
                setCampaign(response.data);
            } catch (error) {
                console.error('Error fetching campaign:', error);
            }
        };
        fetchCampaign();
    }, [id]);

    if (!campaign) {
        return <Typography>Loading campaign...</Typography>;
    }

    return (
        <Box>
            <Card>
                <CardContent>
                    <Typography variant="h4">{campaign.title}</Typography>
                    <Typography variant="body1">Goal: ${campaign.goal.toFixed(2)}</Typography>
                    <Typography variant="body1">Collected: ${campaign.collected.toFixed(2)}</Typography>
                    <Typography variant="body2">Created by: {campaign.user}</Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CampaignDetail;
