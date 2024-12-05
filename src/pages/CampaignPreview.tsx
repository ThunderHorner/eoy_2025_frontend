import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Divider,
    Link as MuiLink,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Donation {
    id: number;
    name: string;
    message: string;
    amount: string;
    created_at: string;
}

interface Campaign {
    id: number;
    title: string;
    description: string;
    goal: string;
    collected: string;
    created_at: string;
    wallet_address:string;
}

const CampaignPreview: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Extract campaign ID from the URL
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [donationData, setDonationData] = useState({
        name: '',
        message: '',
        amount: '',
        campaign: id,
    });

    const get_headers = (): Record<string, string> => {
        const token = localStorage.getItem('access');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        return {}; // Return an empty object if no token is found
    };
    useEffect(() => {
        const fetchCampaignData = async () => {
            try {

                // Fetch campaign details
                const campaignResponse = await axios.get<Campaign>(
                    `http://localhost:8000/api/v1/donation/campaigns/${id}/`,
                    { headers: get_headers() }
                );
                setCampaign(campaignResponse.data);

                // Fetch donations for the campaign
                const donationsResponse = await axios.get<Donation[]>(
                    `http://localhost:8000/api/v1/donation/campaigns/${id}/donations/`,
                    { headers: get_headers() }
                );
                setDonations(donationsResponse.data);
            } catch (error) {
                console.error('Error fetching campaign data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignData();
    }, [id]);

    const handleOpenDonationModal = () => setDonationModalOpen(true);
    const handleCloseDonationModal = () => {
        setDonationModalOpen(false);
        setDonationData({ name: '', message: '', amount: '', campaign: id }); // Reset form
    };

    const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDonationData({ ...donationData, [e.target.name]: e.target.value });
    };

    const handleDonate = async () => {
        try {
            const token = localStorage.getItem('access');
            await axios.post(
                `http://localhost:8000/api/v1/donation/campaigns/${id}/donate/`,
                donationData,
                { headers: get_headers() }
            );
            alert('Donation successful!');
            handleCloseDonationModal();
            // Refresh donations
            const donationsResponse = await axios.get<Donation[]>(
                `http://localhost:8000/api/v1/donation/campaigns/${id}/donations/`,
                { headers: get_headers() }
            );
            setDonations(donationsResponse.data);
        } catch (error) {
            console.error('Error making donation:', error);
            alert('Failed to make donation.');
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!campaign) {
        return <Typography>Campaign not found.</Typography>;
    }

    const shareLink = `${window.location.origin}/campaign/${id}`;

    return (
        <Box padding={4}>
            <Typography variant="h4" gutterBottom>
                {campaign.title}
            </Typography>
            <Typography variant="small" gutterBottom>
                {campaign.wallet_address}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {campaign.description}
            </Typography>
            <Typography variant="body2" gutterBottom>
                Goal: ${parseFloat(campaign.goal).toFixed(2)}
            </Typography>
            <Typography variant="body2" gutterBottom>
                Collected: ${parseFloat(campaign.collected).toFixed(2)}
            </Typography>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6">Share this Campaign:</Typography>
            <MuiLink href={shareLink} target="_blank" rel="noopener">
                {shareLink}
            </MuiLink>

            <Divider sx={{ marginY: 2 }} />

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDonationModal}
                sx={{ marginBottom: 2 }}
            >
                Donate to this Campaign
            </Button>

            <Typography variant="h6" gutterBottom>
                Donations
            </Typography>

            {donations.length === 0 ? (
                <Typography>No donations yet. Be the first to contribute!</Typography>
            ) : (
                <Grid container spacing={2}>
                    {donations.map((donation) => (
                        <Grid item xs={12} key={donation.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="body1">
                                        <strong>{donation.name || 'Anonymous'}</strong> donated $
                                        {parseFloat(donation.amount).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {donation.message || 'No message provided.'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        {new Date(donation.created_at).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Donation Modal */}
            <Dialog open={donationModalOpen} onClose={handleCloseDonationModal}>
                <DialogTitle>Make a Donation</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        name="name"
                        value={donationData.name}
                        onChange={handleDonationChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Message"
                        name="message"
                        value={donationData.message}
                        onChange={handleDonationChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Amount"
                        name="amount"
                        type="number"
                        value={donationData.amount}
                        onChange={handleDonationChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDonationModal} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDonate} color="primary" variant="contained">
                        Donate
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CampaignPreview;
