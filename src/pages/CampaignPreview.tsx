import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Snackbar,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Campaign, Currency, Donation } from "../types/types";
import { fetchCampaign, fetchDonations, recordDonation } from "../services/ApiService";
import { CampaignInfo } from '../components/CampaignInfo.tsx';
import { DonationModal } from '../components/DonationModal';
import DonationList from "../components/DonationList";

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [showAmountInput, setShowAmountInput] = useState(true);
    const [showPaymentWidget, setShowPaymentWidget] = useState(false);
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

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSnackbar('Copied to clipboard!');
        } catch (err) {
            showSnackbar('Failed to copy. Please try manually.');
        }
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
            handleCloseModal();
        } catch (error) {
            console.error('Error recording donation:', error);
            showSnackbar('Error recording donation');
        }
    };

    const handleCloseModal = () => {
        setPaymentModalOpen(false);
        setShowAmountInput(true);
        setShowPaymentWidget(false);
        setDonationData({
            amount: '',
            name: '',
            message: '',
            selectedCurrencies: ["ETH_MAINNET"],
        });
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
                onCopy={handleCopyToClipboard}
            />

            <Button
                variant="contained"
                color="primary"
                fullWidth={isMobile}
                onClick={() => setPaymentModalOpen(true)}
                sx={{ my: 3 }}
            >
                Donate Now
            </Button>

            <DonationList donations={donations} />

            <DonationModal
                open={paymentModalOpen}
                onClose={handleCloseModal}
                campaign={campaign}
                showAmountInput={showAmountInput}
                showPaymentWidget={showPaymentWidget}
                donationData={donationData}
                onDonationDataChange={{
                    onAmountChange: (amount) => setDonationData(prev => ({ ...prev, amount })),
                    onNameChange: (name) => setDonationData(prev => ({ ...prev, name })),
                    onMessageChange: (message) => setDonationData(prev => ({ ...prev, message })),
                    onCurrencyChange: (currencies) => setDonationData(prev => ({ ...prev, selectedCurrencies: currencies })),
                }}
                onAmountSubmit={() => {
                    setShowAmountInput(false);
                    setShowPaymentWidget(true);
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={(error) => {
                    console.error(error);
                    showSnackbar('Payment failed. Please try again.');
                }}
            />

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