export enum Currency {
    ETH = 'ETH',
    USDT = 'USDT'
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
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
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