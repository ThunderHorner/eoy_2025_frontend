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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { Wallet } from 'lucide-react';
import {Campaign, Currency, Donation} from "../types/types.ts";
import {fetchCampaign, fetchDonations, recordDonation} from "../services/ApiService.ts";
import {processPayment} from "../services/PaymentService.ts";
import DonationList from "../components/DonationList.tsx";
import DonationModal from "../components/DonationModal.tsx";

interface WalletOption {
    name: string;
    mobile: {
        android: string;
        ios: string;
    };
    downloadUrl: string;
}

const WALLET_OPTIONS: Record<string, WalletOption> = {
    metamask: {
        name: 'MetaMask',
        mobile: {
            android: 'https://metamask.app.link/dapp/',
            ios: 'https://metamask.app.link/dapp/'
        },
        downloadUrl: 'https://metamask.io/download/'
    },
    trust: {
        name: 'Trust Wallet',
        mobile: {
            android: 'https://link.trustwallet.com/open_url?url=',
            ios: 'https://link.trustwallet.com/open_url?url='
        },
        downloadUrl: 'https://trustwallet.com/download'
    }
};

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.ETH);
    const [walletError, setWalletError] = useState<string | null>(null);
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

    const handleWalletSelect = async (walletKey: string) => {
        setWalletSelectorOpen(false);
        setWalletError(null);

        const wallet = WALLET_OPTIONS[walletKey];
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const dappUrl = `${window.location.host}/campaign/${id}`;

        if (isMobile) {
            const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'android';
            const deepLink = `${wallet.mobile[platform]}${dappUrl}`;
            window.location.href = deepLink;
            return;
        }

        // Desktop flow
        if (typeof window.ethereum === 'undefined') {
            window.open(wallet.downloadUrl, '_blank');
            setWalletError(`Please install ${wallet.name} to continue`);
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setDonationModalOpen(true);
        } catch (err) {
            console.error('Error connecting wallet:', err);
            setWalletError(`Failed to connect to ${wallet.name}. Please try again.`);
        }
    };

    const handleOpenDonationModal = () => {
        setWalletSelectorOpen(true);
    };

    const handleCloseModal = () => {
        setDonationModalOpen(false);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDonationData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePayment = async () => {
        if (!window.ethereum || !campaign) {
            setWalletError('Wallet connection required. Please connect your wallet first.');
            return;
        }

        try {
            setPaymentStatus('processing');
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const tx = await processPayment(
                campaign.wallet_address,
                donationData.amount,
                selectedCurrency,
                provider
            );

            setDonationData(prev => ({ ...prev, tx_hash: tx.hash }));
            setPaymentStatus('success');
            await recordDonation(id!, { ...donationData, tx_hash: tx.hash, currency: selectedCurrency });

            await loadData();
            handleCloseModal();
        } catch (err) {
            setPaymentStatus('error');
            console.error('Payment failed:', err);
        }
    };

    if (loading) return <CircularProgress />;
    if (!campaign) return <Typography>Campaign not found.</Typography>;

    const shareLink = `${window.location.origin}/campaign/${id}`;

    return (
        <Box padding={4}>
            <Typography variant="h4" gutterBottom>
                {campaign.title}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
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

            <Divider sx={{ my: 2 }} />

            {walletError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {walletError}
                </Alert>
            )}

            <Typography variant="h6">Share this Campaign:</Typography>
            <MuiLink href={shareLink} target="_blank" rel="noopener">
                {shareLink}
            </MuiLink>

            <Divider sx={{ my: 2 }} />

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDonationModal}
                sx={{mb: 2, display: 'block', mx: 'auto'}}
            >
                Donate to this Campaign
            </Button>

            <Typography variant="h6" gutterBottom>
                Donations
            </Typography>

            <DonationList donations={donations} />

            {/* Wallet Selection Dialog */}
            <Dialog
                open={walletSelectorOpen}
                onClose={() => setWalletSelectorOpen(false)}
            >
                <DialogTitle>Select a Wallet</DialogTitle>
                <DialogContent>
                    <List>
                        {Object.entries(WALLET_OPTIONS).map(([key, wallet]) => (
                            <ListItem key={key} disablePadding>
                                <ListItemButton onClick={() => handleWalletSelect(key)}>
                                    <ListItemIcon>
                                        <Wallet />
                                    </ListItemIcon>
                                    <ListItemText primary={wallet.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <DonationModal
                open={donationModalOpen}
                onClose={handleCloseModal}
                onDonate={handlePayment}
                formData={donationData}
                onChange={handleInputChange}
                status={paymentStatus}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={(currency) => {
                    setSelectedCurrency(currency);
                    setDonationData(prev => ({ ...prev, currency }));
                }}
            />
        </Box>
    );
};

export default CampaignPreview;