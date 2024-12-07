import React from 'react';
import { Box, Modal, useMediaQuery, useTheme } from '@mui/material';
import PaymentWidget from "@requestnetwork/payment-widget/react";
import { Campaign } from "../types/types";
import { DonationForm } from './DonationForm';

interface DonationModalProps {
    open: boolean;
    onClose: () => void;
    campaign: Campaign;
    showAmountInput: boolean;
    showPaymentWidget: boolean;
    donationData: {
        amount: string;
        name: string;
        message: string;
        selectedCurrencies: string[];
    };
    onDonationDataChange: {
        onAmountChange: (amount: string) => void;
        onNameChange: (name: string) => void;
        onMessageChange: (message: string) => void;
        onCurrencyChange: (currencies: string[]) => void;
    };
    onAmountSubmit: () => void;
    onPaymentSuccess: (request: any) => void;
    onPaymentError: (error: any) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
                                                                open,
                                                                onClose,
                                                                campaign,
                                                                showAmountInput,
                                                                showPaymentWidget,
                                                                donationData,
                                                                onDonationDataChange,
                                                                onAmountSubmit,
                                                                onPaymentSuccess,
                                                                onPaymentError,
                                                            }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Modal
            open={open}
            onClose={onClose}
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
                width: isMobile ? '90%' : '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {showAmountInput ? (
                    <DonationForm
                        donationAmount={donationData.amount}
                        donorName={donationData.name}
                        donorMessage={donationData.message}
                        selectedCurrencies={donationData.selectedCurrencies}
                        onAmountChange={onDonationDataChange.onAmountChange}
                        onNameChange={onDonationDataChange.onNameChange}
                        onMessageChange={onDonationDataChange.onMessageChange}
                        onCurrencyChange={onDonationDataChange.onCurrencyChange}
                        onSubmit={onAmountSubmit}
                    />
                ) : showPaymentWidget && (
                    <PaymentWidget
                        sellerInfo={{
                            name: campaign.title,
                        }}
                        productInfo={{
                            name: donationData.name ? `Donation from ${donationData.name}` : "Donation",
                            description: donationData.message || `Donation to ${campaign.title}`,
                        }}
                        amountInUSD={parseFloat(donationData.amount)}
                        sellerAddress={campaign.wallet_address}
                        supportedCurrencies={donationData.selectedCurrencies}
                        persistRequest={true}
                        onPaymentSuccess={onPaymentSuccess}
                        onError={onPaymentError}
                    />
                )}
            </Box>
        </Modal>
    );
};