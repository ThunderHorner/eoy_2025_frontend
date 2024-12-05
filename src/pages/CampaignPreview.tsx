import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
    Box,
    Typography,
    Divider,
    Link as MuiLink,
    Button,
    CircularProgress
} from '@mui/material';
import {Campaign, Currency, Donation} from "../types/types.ts";
import {fetchCampaign, fetchDonations, recordDonation} from "../services/ApiService.ts";
import {processPayment} from "../services/PaymentService.ts";
import DonationList from "../components/DonationList.tsx";
import DonationModal from "../components/DonationModal.tsx";

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
    }, [id]);

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
        if (!window.ethereum || !campaign) return;

        try {
            setPaymentStatus('processing');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
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

            <DonationList donations={donations} />

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