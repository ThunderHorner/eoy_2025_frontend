import React from 'react';
import { Box, Card, CardContent, Divider, Stack, TextField, Typography, useTheme } from '@mui/material';
import PaymentWidget from "@requestnetwork/payment-widget/react";

interface DonationFormProps {
    campaignTitle: string;
    walletAddress: string;
    donationData: {
        amount: string;
        name: string;
        message: string;
    };
    onDonationDataChange: (field: string, value: string) => void;
    onPaymentSuccess: (request: any) => void;
    onPaymentError: (error: any) => void;
}

const DonationForm = ({
                          campaignTitle,
                          walletAddress,
                          donationData,
                          onDonationDataChange,
                          onPaymentSuccess,
                          onPaymentError
                      }: DonationFormProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: 2,
                '& .rn-payment-widget': {
                    width: 'auto !important'
                }
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" gutterBottom sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mb: 3,
                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}>
                    Donate to {campaignTitle}
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        label="Amount in USD"
                        type="number"
                        value={donationData.amount}
                        onChange={(e) => onDonationDataChange('amount', e.target.value)}
                        fullWidth
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 1 }
                        }}
                    />
                    <TextField
                        label="Your Name"
                        value={donationData.name}
                        onChange={(e) => onDonationDataChange('name', e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 1 }
                        }}
                    />
                    <TextField
                        label="Message (Optional)"
                        value={donationData.message}
                        onChange={(e) => onDonationDataChange('message', e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 1 }
                        }}
                    />
                </Stack>

                {donationData.amount && parseFloat(donationData.amount) > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Divider sx={{ my: 3 }} />
                        <PaymentWidget
                            amountInUSD={parseFloat(donationData.amount)}
                            buyerInfo={{
                                email: "anon@anon.com",
                                firstName: donationData.name || "Anonymous",
                                lastName: "",
                            }}
                            sellerInfo={{
                                name: campaignTitle,
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
                            sellerAddress={walletAddress}
                            supportedCurrencies={["ETH-base-base", "ETH-mainnet", "USDC-mainnet", "USDT-mainnet"]}
                            onPaymentSuccess={onPaymentSuccess}
                            onError={onPaymentError}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default DonationForm;