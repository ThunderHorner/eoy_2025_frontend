import React from 'react';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';

// Correct Request Network currency codes
export const SUPPORTED_CURRENCIES = [
    { id: "MATIC-POLYGON", label: "MATIC" },
    { id: "USDC-POLYGON", label: "USDC (Polygon)" },
    { id: "ETH-GOERLI", label: "ETH (Goerli)" },
    { id: "FAU-GOERLI", label: "FAU (Goerli)" },
    // Mainnet options
    { id: "ETH-MAINNET", label: "ETH" },
    { id: "USDC-MAINNET", label: "USDC" },
    { id: "DAI-MAINNET", label: "DAI" }
];

interface DonationFormProps {
    donationAmount: string;
    donorName: string;
    donorMessage: string;
    selectedCurrencies: string[];
    onAmountChange: (amount: string) => void;
    onNameChange: (name: string) => void;
    onMessageChange: (message: string) => void;
    onCurrencyChange: (currencies: string[]) => void;
    onSubmit: () => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({
                                                              donationAmount,
                                                              donorName,
                                                              donorMessage,
                                                              selectedCurrencies,
                                                              onAmountChange,
                                                              onNameChange,
                                                              onMessageChange,
                                                              onCurrencyChange,
                                                              onSubmit,
                                                          }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Make a Donation</Typography>
            <TextField
                label="Amount in USD"
                type="number"
                value={donationAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                fullWidth
                required
            />
            <TextField
                label="Your Name (Optional)"
                value={donorName}
                onChange={(e) => onNameChange(e.target.value)}
                fullWidth
            />
            <TextField
                label="Message (Optional)"
                value={donorMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                fullWidth
                multiline
                rows={3}
            />
            <FormControl fullWidth>
                <InputLabel>Accepted Currencies</InputLabel>
                <Select
                    multiple
                    value={selectedCurrencies}
                    onChange={(e) => onCurrencyChange(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                    label="Accepted Currencies"
                >
                    {SUPPORTED_CURRENCIES.map((currency) => (
                        <MenuItem key={currency.id} value={currency.id}>
                            {currency.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!donationAmount || parseFloat(donationAmount) <= 0}
            >
                Continue to Payment
            </Button>
        </Box>
    );
};

