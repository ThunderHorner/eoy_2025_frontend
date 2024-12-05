import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
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
    CircularProgress,
    Alert,
    MenuItem,
} from '@mui/material';

enum Currency {
    ETH = 'ETH',
    USDT = 'USDT'
}

const CURRENCY_DETAILS = {
    [Currency.ETH]: {
        decimals: 18,
        symbol: 'ETH',
        contractAddress: '',
    },
    [Currency.USDT]: {
        decimals: 6,
        symbol: 'USDT',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
};

const ERC20_ABI = [
    'function transfer(address to, uint256 value) returns (bool)',
    'function approve(address spender, uint256 value) returns (bool)',
    'function balanceOf(address owner) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)'
];

interface Donation {
    id: number;
    name: string;
    message: string;
    amount: string;
    currency: Currency;
    created_at: string;
    tx_hash?: string;
}

interface Campaign {
    id: number;
    title: string;
    description: string;
    goal: string;
    collected: string;
    created_at: string;
    wallet_address: string;
}

const CampaignPreview = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.ETH);
    const [donationData, setDonationData] = useState({
        name: '',
        message: '',
        amount: '',
        campaign: id,
        currency: Currency.ETH,
        tx_hash: ''
    });

    const getHeaders = () => {
        const token = localStorage.getItem('access');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchCampaignData = async () => {
        try {
            const [campaignRes, donationsRes] = await Promise.all([
                axios.get<Campaign>(`http://localhost:8000/api/v1/donation/campaigns/${id}/`, { headers: getHeaders() }),
                axios.get<Donation[]>(`http://localhost:8000/api/v1/donation/campaigns/${id}/donations/`, { headers: getHeaders() })
            ]);
            setCampaign(campaignRes.data);
            setDonations(donationsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaignData();
    }, [id]);

    const processPayment = async () => {
        if (!window.ethereum || !campaign) return;

        try {
            setPaymentStatus('processing');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            let tx;
            if (selectedCurrency === Currency.ETH) {
                tx = await signer.sendTransaction({
                    to: campaign.wallet_address,
                    value: ethers.utils.parseEther(donationData.amount)
                });
            } else {
                const contract = new ethers.Contract(
                    CURRENCY_DETAILS[selectedCurrency].contractAddress,
                    ERC20_ABI,
                    signer
                );
                const decimals = CURRENCY_DETAILS[selectedCurrency].decimals;
                const value = ethers.utils.parseUnits(donationData.amount, decimals);
                tx = await contract.transfer(campaign.wallet_address, value);
            }

            setDonationData(prev => ({ ...prev, tx_hash: tx.hash }));
            setPaymentStatus('success');
            await handleDonate(tx.hash);
        } catch (err) {
            setPaymentStatus('error');
            console.error('Payment failed:', err);
        }
    };

    const handleDonate = async (txHash: string) => {
        try {
            await axios.post(
                `http://localhost:8000/api/v1/donation/campaigns/${id}/donate/`,
                {
                    ...donationData,
                    tx_hash: txHash,
                    currency: selectedCurrency
                },
                { headers: getHeaders() }
            );
            await fetchCampaignData();
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
        } catch (error) {
            console.error('Error recording donation:', error);
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

            <Typography variant="h6">Share this Campaign:</Typography>
            <MuiLink href={shareLink} target="_blank" rel="noopener">
                {shareLink}
            </MuiLink>

            <Divider sx={{ my: 2 }} />

            <Button
                variant="contained"
                color="primary"
                onClick={() => setDonationModalOpen(true)}
                sx={{ mb: 2 }}
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
                                        <strong>{donation.name || 'Anonymous'}</strong> donated{' '}
                                        {parseFloat(donation.amount).toFixed(donation.currency === Currency.USDT ? 2 : 6)}{' '}
                                        {donation.currency}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {donation.message || 'No message provided.'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(donation.created_at).toLocaleString()}
                                        </Typography>
                                        {donation.tx_hash && (
                                            <Typography variant="caption" color="textSecondary">
                                                Tx: {donation.tx_hash.slice(0, 8)}...
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={donationModalOpen} onClose={() => setDonationModalOpen(false)}>
                <DialogTitle>Make a Donation</DialogTitle>
                <DialogContent>
                    {paymentStatus === 'error' && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Payment failed. Please try again.
                        </Alert>
                    )}
                    <TextField
                        label="Name"
                        value={donationData.name}
                        onChange={(e) => setDonationData(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Message"
                        value={donationData.message}
                        onChange={(e) => setDonationData(prev => ({ ...prev, message: e.target.value }))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Amount"
                        type="number"
                        value={donationData.amount}
                        onChange={(e) => setDonationData(prev => ({ ...prev, amount: e.target.value }))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        select
                        label="Currency"
                        value={selectedCurrency}
                        onChange={(e) => {
                            setSelectedCurrency(e.target.value as Currency);
                            setDonationData(prev => ({ ...prev, currency: e.target.value as Currency }));
                        }}
                        fullWidth
                        margin="normal"
                    >
                        {Object.values(Currency).map((currency) => (
                            <MenuItem key={currency} value={currency}>
                                {currency}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDonationModalOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={processPayment}
                        color="primary"
                        variant="contained"
                        disabled={paymentStatus === 'processing'}
                        startIcon={paymentStatus === 'processing' ? <CircularProgress size={20} /> : null}
                    >
                        {paymentStatus === 'processing' ? 'Processing' : 'Donate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CampaignPreview;