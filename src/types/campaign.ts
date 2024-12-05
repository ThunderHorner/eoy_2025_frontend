export interface Campaign {
    id: number;
    title: string;
    goal: number;
    collected: number;
    user: string; // Username or user ID
    created_at: string;
    updated_at: string;
}

export interface NewCampaign {
    title: string;
    goal: number;
}
