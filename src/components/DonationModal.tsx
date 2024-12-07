import React from 'react';
import { Box, Modal, useMediaQuery, useTheme, TextField, Button, Typography } from '@mui/material';
import PaymentWidget from "@requestnetwork/payment-widget/react";
import { Campaign } from "../types/types";

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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">Choose an amount</Typography>
                        <TextField
                            label="Amount in USD"
                            type="number"
                            value={donationData.amount}
                            onChange={(e) => onDonationDataChange.onAmountChange(e.target.value)}
                            fullWidth
                            required
                        />
                        <Button
                            variant="contained"
                            onClick={onAmountSubmit}
                            disabled={!donationData.amount || parseFloat(donationData.amount) <= 0}
                        >
                            Continue to Payment
                        </Button>
                    </Box>
                ) : showPaymentWidget && (
                    <PaymentWidget
                        amountInUSD={parseFloat(donationData.amount)}
                        buyerInfo={{
                          email:"anon@anon.com",
                          firstName:"John",
                          lastName:"Doe",
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
                                "locality": "",
                                "region": "",
                                "postal-code": "",
                                "country-name": ""
                            }
                        }}
                        sellerAddress={campaign.wallet_address}
                        supportedCurrencies={["ETH-base-base", "ETH-mainnet", "USDC-mainnet", "USDT-mainnet"]}
                        onPaymentSuccess={onPaymentSuccess}
                        onError={onPaymentError}
                    />
                )}
            </Box>
        </Modal>
    );
};