import { ethers } from 'ethers';
import { Currency, CURRENCY_DETAILS, ERC20_ABI } from '../types/types.ts';

export const processPayment = async (
    walletAddress: string,
    amount: string,
    selectedCurrency: Currency,
    provider: ethers.providers.Web3Provider
) => {
    const signer = provider.getSigner();

    if (selectedCurrency === Currency.ETH) {
        return await signer.sendTransaction({
            to: walletAddress,
            value: ethers.utils.parseEther(amount)
        });
    }

    const contract = new ethers.Contract(
        CURRENCY_DETAILS[selectedCurrency].contractAddress,
        ERC20_ABI,
        signer
    );
    const decimals = CURRENCY_DETAILS[selectedCurrency].decimals;
    const value = ethers.utils.parseUnits(amount, decimals);
    return await contract.transfer(walletAddress, value);
};