import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Snackbar,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Campaign, Currency, Donation } from "../types/types";
import { fetchCampaign, fetchDonations, recordDonation } from "../services/ApiService";
import { CampaignInfo } from '../components/CampaignInfo.tsx';
import DonationList from "../components/DonationList";
import PaymentWidget from "@requestnetwork/payment-widget/react";

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [donationData, setDonationData] = useState({
        amount: '',
        name: '',
        message: '',
        selectedCurrencies: ["ETH_MAINNET"],
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

    const handlePaymentSuccess = async (request: any) => {
        try {
            await recordDonation(id!, {
                name: donationData.name,
                message: donationData.message,
                amount: donationData.amount,
                campaign: id,
                currency: Currency.ETH,
                request_id: request.requestId
            });
            showSnackbar('Donation successful!');
            await loadData();
        } catch (error) {
            console.error('Error recording donation:', error);
            showSnackbar('Error recording donation');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!campaign) {
        return null;
    }

    return (
        <Box padding={isMobile ? 2 : 4}>
            <CampaignInfo
                campaign={campaign}
                onCopy={(text) => {
                    navigator.clipboard.writeText(text).then(
                        () => showSnackbar('Copied to clipboard!'),
                        () => showSnackbar('Failed to copy. Please try manually.')
                    );
                }}
            />

            <Typography variant="h5" sx={{ my: 3 }}>Donate to {campaign.title}</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: isMobile ? '100%' : '600px' }}>
                <TextField
                    label="Amount in USD"
                    type="number"
                    value={donationData.amount}
                    onChange={(e) =>
                        setDonationData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    fullWidth
                    required
                />
                <TextField
                    label="Your Name"
                    value={donationData.name}
                    onChange={(e) =>
                        setDonationData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    fullWidth
                />
                <TextField
                    label="Message (Optional)"
                    value={donationData.message}
                    onChange={(e) =>
                        setDonationData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    multiline
                    rows={3}
                    fullWidth
                />
                {donationData.amount && parseFloat(donationData.amount) > 0 && (
                    <PaymentWidget
                        amountInUSD={parseFloat(donationData.amount)}
                        buyerInfo={{
                            email: "anon@anon.com",
                            firstName: donationData.name || "Anonymous",
                            lastName: "",
                        }}
                        sellerInfo={{
                            name: campaign.title,
                            logo: "",
                            taxRegistration: "",
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: "",
                            address: {
                                "street-address": "",
                                locality: "",
                                region: "",
                                "postal-code": "",
                                "country-name": "",
                            },
                        }}
                        sellerAddress={campaign.wallet_address}
                        supportedCurrencies={["ETH-base-base", "ETH-mainnet", "USDC-mainnet", "USDT-mainnet"]}
                        onPaymentSuccess={handlePaymentSuccess}
                        onError={(error) => {
                            console.error(error);
                            showSnackbar('Payment failed. Please try again.');
                        }}
                    />
                )}
            </Box>

            <DonationList donations={donations} />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default CampaignPreview;
