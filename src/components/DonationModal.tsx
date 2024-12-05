import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Alert,
    MenuItem
} from '@mui/material';
import {Currency} from "../types/types.ts";

interface DonationModalProps {
    open: boolean;
    onClose: () => void;
    onDonate: () => void;
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    status: string;
    selectedCurrency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

const DonationModal: React.FC<DonationModalProps> = ({
                                                         open,
                                                         onClose,
                                                         onDonate,
                                                         formData,
                                                         onChange,
                                                         status,
                                                         selectedCurrency,
                                                         onCurrencyChange
                                                     }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Make a Donation</DialogTitle>
        <DialogContent>
            {status === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Payment failed. Please try again.
                </Alert>
            )}
            <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={onChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Message"
                name="message"
                value={formData.message}
                onChange={onChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={onChange}
                fullWidth
                margin="normal"
            />
            <TextField
                select
                label="Currency"
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
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
            <Button onClick={onClose} color="secondary">
                Cancel
            </Button>
            <Button
                onClick={onDonate}
                color="primary"
                variant="contained"
                disabled={status === 'processing'}
                startIcon={status === 'processing' ? <CircularProgress size={20} /> : null}
            >
                {status === 'processing' ? 'Processing' : 'Donate'}
            </Button>
        </DialogActions>
    </Dialog>
);

export default DonationModal;