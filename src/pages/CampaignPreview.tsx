import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
    Box,
    Typography,
    Divider,
    Link as MuiLink,
    Button,
    CircularProgress,
    Modal,
    useMediaQuery,
    useTheme,
    IconButton,
    Snackbar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Campaign, Currency, Donation } from "../types/types.ts";
import { fetchCampaign, fetchDonations, recordDonation } from "../services/ApiService.ts";
import { processPayment } from "../services/PaymentService.ts";
import DonationList from "../components/DonationList.tsx";
import DonationModal from "../components/DonationModal.tsx";

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.ETH);
    const [donationData, setDonationData] = useState({
        name: '',
        message: '',
        amount: '',
        campaign: id,
        currency: Currency.ETH,
        tx_hash: ''
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

    // Handle return from wallet redirect
    useEffect(() => {
        // Check if we're returning from a wallet redirect
        const isWalletReturn = sessionStorage.getItem('walletRedirect') === 'true';
        if (isWalletReturn) {
            // Clear the redirect flag
            sessionStorage.removeItem('walletRedirect');

            // Try to retrieve pending donation
            const pendingDonation = sessionStorage.getItem('pendingDonation');
            if (pendingDonation) {
                setDonationData(JSON.parse(pendingDonation));
                sessionStorage.removeItem('pendingDonation');
                // Reopen donation modal
                setDonationModalOpen(true);
            }
        }
    }, []);

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleCloseModal = () => {
        setDonationModalOpen(false);
        setWalletModalOpen(false);
        resetDonationData();
    };

    const resetDonationData = () => {
        setDonationData({
            name: '',
            message: '',
            amount: '',
            campaign: id,
            currency: Currency.ETH,
            tx_hash: ''
        });
        setPaymentStatus('idle');
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSnackbar('Copied to clipboard!');
        } catch (err) {
            showSnackbar('Failed to copy. Please try manually.');
        }
    };

    const handlePayment = async () => {
        if (!campaign) return;

        try {
            setPaymentStatus('processing');

            // Clear any existing wallet session
            sessionStorage.removeItem('walletRedirect');

            // Check if we're inside a dApp browser (like Trust Wallet's browser)
            const isDAppBrowser = window.ethereum || (window as any).trustwallet;

            if (isDAppBrowser) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                const tx = await processPayment(
                    campaign.wallet_address,
                    donationData.amount,
                    selectedCurrency,
                    provider
                );

                setDonationData(prev => ({ ...prev, tx_hash: tx.hash }));
                await recordDonation(id!, { ...donationData, tx_hash: tx.hash, currency: selectedCurrency });
                setPaymentStatus('success');
                showSnackbar('Donation successful!');
            } else {
                // Save donation data before redirect
                sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));
                setWalletModalOpen(true);
                setDonationModalOpen(false);
            }

            await loadData();
        } catch (err) {
            console.error('Payment failed:', err);
            setPaymentStatus('error');
            showSnackbar('Payment failed. Please try again.');
        }
    };

    const handleMobileWalletSelection = (wallet: 'metamask' | 'trust') => {
        // Mark that we're doing a wallet redirect to prevent loops
        sessionStorage.setItem('walletRedirect', 'true');

        // Get base URL without query parameters
        const baseUrl = window.location.origin + window.location.pathname;

        const deepLink = wallet === 'metamask'
            ? `https://metamask.app.link/dapp/${encodeURIComponent(baseUrl)}`
            : `trust://browser_enable?url=${encodeURIComponent(baseUrl)}`;

        // For iOS, we need to use window.location.href
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            window.location.href = deepLink;
        } else {
            window.open(deepLink, '_blank');
        }
        setWalletModalOpen(false);
    };
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!campaign) {
        return (
            <Box padding={3}>
                <Typography>Campaign not found.</Typography>
            </Box>
        );
    }

    const shareLink = `${window.location.origin}/campaign/${id}`;

    return (
        <Box padding={isMobile ? 2 : 4}>
            <Typography variant="h4" gutterBottom>
                {campaign.title}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <Typography variant="subtitle2" sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    {campaign.wallet_address}
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(campaign.wallet_address)}>
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="body1" sx={{ mt: 2 }}>
                {campaign.description}
            </Typography>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                    Goal: ${parseFloat(campaign.goal).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                    Collected: ${parseFloat(campaign.collected).toFixed(2)}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">Share:</Typography>
                <MuiLink
                    href={shareLink}
                    sx={{
                        maxWidth: isMobile ? '200px' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {shareLink}
                </MuiLink>
                <IconButton size="small" onClick={() => copyToClipboard(shareLink)}>
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Box>

            <Button
                variant="contained"
                color="primary"
                fullWidth={isMobile}
                onClick={() => setDonationModalOpen(true)}
                sx={{ my: 3 }}
            >
                Donate Now
            </Button>

            <Typography variant="h6" gutterBottom>
                Recent Donations
            </Typography>

            <DonationList donations={donations} />

            <DonationModal
                open={donationModalOpen}
                onClose={handleCloseModal}
                onDonate={handlePayment}
                formData={donationData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDonationData(prev => ({
                    ...prev,
                    [e.target.name]: e.target.value
                }))}
                status={paymentStatus}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={(currency) => {
                    setSelectedCurrency(currency);
                    setDonationData(prev => ({ ...prev, currency }));
                }}
            />

            <Modal
                open={walletModalOpen}
                onClose={handleCloseModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 3,
                    width: isMobile ? '90%' : '400px',
                    maxWidth: '90vw'
                }}>
                    <Typography variant="h6" gutterBottom>
                        Select Your Wallet
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleMobileWalletSelection('metamask')}
                        sx={{ mb: 2 }}
                    >
                        MetaMask
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleMobileWalletSelection('trust')}
                        color="secondary"
                    >
                        Trust Wallet
                    </Button>
                </Box>
            </Modal>

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