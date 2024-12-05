import axios from 'axios';
// import { Campaign, Donation } from './types';
import {Campaign, Donation} from '../types/types.ts';
const BASE_URL = 'http://localhost:8000/api/v1/donation';

export const getHeaders = () => {
    const token = localStorage.getItem('access');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchCampaign = async (id: string) => {
    const response = await axios.get<Campaign>(
        `${BASE_URL}/campaigns/${id}/`,
        { headers: getHeaders() }
    );
    return response.data;
};

export const fetchDonations = async (id: string) => {
    const response = await axios.get<Donation[]>(
        `${BASE_URL}/campaigns/${id}/donations/`,
        { headers: getHeaders() }
    );
    return response.data;
};

export const recordDonation = async (id: string, donationData: any) => {
    await axios.post(
        `${BASE_URL}/campaigns/${id}/donate/`,
        donationData,
        { headers: getHeaders() }
    );
};