export enum Currency {
    ETH = 'ETH',
    USDT = 'USDT',
    USDC = 'USDC'
}

export const CURRENCY_DETAILS = {
    [Currency.ETH]: {
        decimals: 18,
        symbol: 'ETH',
        contractAddress: '',
    },
    [Currency.USDT]: {
        decimals: 6,
        symbol: 'USDT',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
    },
    [Currency.USDC]: {
        decimals: 6,
        symbol: 'USDC',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },


};

export const ERC20_ABI = [
    'function transfer(address to, uint256 value) returns (bool)',
    'function approve(address spender, uint256 value) returns (bool)',
    'function balanceOf(address owner) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)'
];

export interface Donation {
    id: number;
    name: string;
    message: string;
    amount: string;
    currency: Currency;
    created_at: string;
    tx_hash?: string;
    amount_usd:string;
}

export interface Campaign {
    id: number;
    title: string;
    description: string;
    goal: string;
    collected: string;
    created_at: string;
    wallet_address: string;
}