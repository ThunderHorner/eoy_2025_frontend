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
    const [searchParams] = useState(new URLSearchParams(window.location.search));

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
        const checkWalletConnection = async () => {
            const walletType = sessionStorage.getItem('walletType');
            const pendingDonation = sessionStorage.getItem('pendingDonation');

            if (walletType && pendingDonation) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const accounts = await provider.listAccounts();

                    if (accounts.length > 0) {
                        const parsedDonation = JSON.parse(pendingDonation);
                        setDonationData(parsedDonation);
                        setDonationModalOpen(true);

                        // Clear storage after successful processing
                        sessionStorage.removeItem('walletType');
                        sessionStorage.removeItem('pendingDonation');
                    }
                } catch (error) {
                    console.error('Wallet connection check failed:', error);
                }
            }
        };

        checkWalletConnection();
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

            // Check if we're inside a dApp browser or have Web3 provider
            if (window.ethereum) {
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
                await loadData();
            } else {
                setWalletModalOpen(true);
                setDonationModalOpen(false);
            }
        } catch (err) {
            console.error('Payment failed:', err);
            setPaymentStatus('error');
            showSnackbar('Payment failed. Please try again.');
        }
    };

    useEffect(() => {
        const handleTrustWalletCallback = async () => {
            const txId = searchParams.get('txId');
            const pendingTxId = sessionStorage.getItem('pendingTxId');
            const pendingDonation = sessionStorage.getItem('pendingDonation');
            const walletType = sessionStorage.getItem('walletType');

            // Only proceed if we have a matching transaction ID
            if (walletType === 'trust' && pendingDonation && txId && txId === pendingTxId) {
                const parsedDonation = JSON.parse(pendingDonation);

                try {
                    // Get the latest transaction from the user's wallet
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const accounts = await provider.listAccounts();

                    if (accounts.length > 0) {
                        const history = await provider.getHistory(accounts[0]);
                        const latestTx = history[0]; // Get the most recent transaction

                        if (latestTx) {
                            // Record the successful donation with the actual transaction hash
                            await recordDonation(id!, {
                                ...parsedDonation,
                                tx_hash: latestTx.hash,
                                currency: selectedCurrency
                            });
                            setPaymentStatus('success');
                            showSnackbar('Donation successful!');
                            await loadData();
                        } else {
                            throw new Error('No transaction found');
                        }
                    }
                } catch (err) {
                    console.error('Failed to process donation:', err);
                    setPaymentStatus('error');
                    showSnackbar('Failed to process donation. Please check your wallet for the transaction status.');
                }

                // Clear storage
                sessionStorage.removeItem('walletType');
                sessionStorage.removeItem('pendingDonation');
                sessionStorage.removeItem('pendingTxId');
            }
        };

        handleTrustWalletCallback();
    }, [searchParams, id, selectedCurrency]);
// Update your handleMobileWalletSelection function
    const handleMobileWalletSelection = async (wallet: 'metamask' | 'trust') => {
        if (!campaign) return;

        // Save donation data and wallet type
        sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));
        sessionStorage.setItem('walletType', wallet);

        // Get current URL for return, ensuring we have a clean base URL
        const currentUrl = window.location.href.split('?')[0];

        if (wallet === 'trust') {
            // Create a unique transaction identifier
            const txId = `tx-${Date.now()}`;
            sessionStorage.setItem('pendingTxId', txId);

            // Construct callback URL with transaction ID
            const callbackUrl = `${currentUrl}?txId=${txId}`;

            // Construct Trust Wallet deep link with modified callback parameters
            const trustWalletDeepLink = `https://link.trustwallet.com/send?asset=c60&address=${
                campaign.wallet_address
            }&amount=${donationData.amount}&return_type=back&callback_url=${
                encodeURIComponent(callbackUrl)
            }`;

            // Open the deep link
            window.location.href = trustWalletDeepLink;
        } else {
            // MetaMask handling remains the same
            const deepLink = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;

            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                window.location.href = deepLink;
            } else {
                window.open(deepLink, '_blank');
            }
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