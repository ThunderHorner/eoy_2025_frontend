import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper, Snackbar,Divider, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Campaign, Donation } from "../types/types";
import { fetchCampaign, fetchDonations, recordDonation } from "../services/ApiService";
import { CampaignInfo } from '../components/CampaignInfo';
import LoadingSpinner from './LoadingSpinner';
import DonationForm from './DonationForm';
import DonationsCard from './DonationsCard';


const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

    const campaignUrl = window.location.href;

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 4,
                px: { xs: 1, sm: 2, md: 3 },
                overflow: 'hidden'
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 4 },
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 3, sm: 4 },
                        alignItems: { xs: 'center', sm: 'flex-start' }
                    }}>
                        <Box sx={{ flex: 1, width: '100%' }}>
                            <CampaignInfo
                                campaign={campaign}
                                onCopy={(text) => {
                                    navigator.clipboard.writeText(text).then(
                                        () => showSnackbar('Copied to clipboard!'),
                                        () => showSnackbar('Failed to copy. Please try manually.')
                                    );
                                }}
                            />
                        </Box>

                        <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem />

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            minWidth: { xs: '100%', sm: '200px' }
                        }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    textAlign: 'center'
                                }}
                            >
                                Share Campaign
                            </Typography>

                            <Box sx={{
                                backgroundColor: 'white',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: `1px solid ${theme.palette.divider}`
                            }}>
                                <QRCodeSVG
                                    value={campaignUrl}
                                    size={160}
                                    level="H"
                                    includeMargin={true}
                                />
                            </Box>

                            <Typography
                                variant="caption"
                                sx={{
                                    textAlign: 'center',
                                    color: theme.palette.text.secondary,
                                    maxWidth: '180px'
                                }}
                            >
                                Scan to view and share this campaign
                            </Typography>
                        </Box>
                    </Box>
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
            </Box>

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