import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Snackbar, Stack } from '@mui/material';
import { Campaign, Donation } from "../types/types";
import { fetchCampaign, fetchDonations, recordDonation } from "../services/ApiService";
import { CampaignInfo } from '../components/CampaignInfo';
import LoadingSpinner from './LoadingSpinner';
import DonationForm from './DonationForm';
import DonationsCard from './DonationsCard';

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [donationData, setDonationData] = useState({
        amount: '',
        name: '',
        message: '',
    });

    const loadData = async () => {
        try {
            const [campaignData, donationsData] = await Promise.all([
                fetchCampaign(id!),
                fetchDonations(id!)
            ]);
            setCampaign(campaignData);
            setDonations(donationsData);
        } catch (error) {
            console.error('Error loading data:', error);
            showSnackbar('Failed to load campaign data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            fetchDonations(id!).then(setDonations);
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleDonationDataChange = (field: string, value: string) => {
        setDonationData(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentSuccess = async (request: any) => {
        try {
            await recordDonation(id!, {
                name: donationData.name,
                message: donationData.message,
                amount: donationData.amount,
                campaign: id,
                currency: "USD",
                tx_hash: request.requestId
            });
            showSnackbar('Donation successful!');
            await loadData();
        } catch (error) {
            console.error('Error recording donation:', error);
            showSnackbar('Error recording donation');
        }
    };

    const handlePaymentError = (error: any) => {
        console.error(error);
        showSnackbar('Payment failed. Please try again.');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!campaign) {
        return null;
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 4,
                px: { xs: 1, sm: 2, md: 3 },
                overflow: 'hidden'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    mb: 4,
                    p: { xs: 2, md: 4 },
                    borderRadius: 2,
                    maxWidth: '100%'
                }}
            >
                <CampaignInfo
                    campaign={campaign}
                    onCopy={(text) => {
                        navigator.clipboard.writeText(text).then(
                            () => showSnackbar('Copied to clipboard!'),
                            () => showSnackbar('Failed to copy. Please try manually.')
                        );
                    }}
                />
            </Paper>

            <Stack spacing={4}>
                <DonationForm
                    campaignTitle={campaign.title}
                    walletAddress={campaign.wallet_address}
                    donationData={donationData}
                    onDonationDataChange={handleDonationDataChange}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />

                <DonationsCard donations={donations} />
            </Stack>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                sx={{
                    '& .MuiSnackbarContent-root': {
                        borderRadius: 2,
                    }
                }}
            />
        </Container>
    );
};

export default CampaignPreview;