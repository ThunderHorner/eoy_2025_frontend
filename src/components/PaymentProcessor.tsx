import React, {useState} from 'react';
import {ethers} from 'ethers';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertDescription from '@mui/material/AlertTitle';
// import {Loader2} from 'lucide-react';

interface PaymentProps {
    amount: string;
    walletAddress: string;
    onSuccess: (txHash: string) => void;
    onError: (error: string) => void;
}

const PaymentProcessor = ({ amount, walletAddress, onSuccess, onError }: PaymentProps) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState('');

    const processPayment = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not detected');
            }

            setStatus('processing');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tx = await signer.sendTransaction({
                to: walletAddress,
                value: ethers.parseEther(amount),
            });

            setTxHash(tx.hash);
            setStatus('success');
            onSuccess(tx.hash);
        } catch (err) {
            setStatus('error');
            onError(err.message);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
                {status === 'processing' && (
                    <div className="flex items-center justify-center gap-2">
                        {/*<Loader2 className="h-4 w-4 animate-spin" />*/}
                        <span>Processing payment...</span>
                    </div>
                )}

                {status === 'success' && (
                    <Alert className="bg-green-50">
                        <AlertDescription>
                            Payment successful! Transaction: {txHash.slice(0, 10)}...
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'error' && (
                    <Alert variant="destructive">
                        <AlertDescription>Payment failed. Please try again.</AlertDescription>
                    </Alert>
                )}

                <Button
                    className="w-full mt-4"
                    onClick={processPayment}
                    disabled={status === 'processing'}
                >
                    Pay {amount} ETH
                </Button>
            </CardContent>
        </Card>
    );
};

export default PaymentProcessor;