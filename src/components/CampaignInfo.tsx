import React from 'react';
import {
    Box,
    Typography,
    Divider,
    Link as MuiLink,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Campaign } from "../types/types";

interface CampaignInfoProps {
    campaign: Campaign;
    onCopy: (text: string) => void;
}

export const CampaignInfo: React.FC<CampaignInfoProps> = ({ campaign, onCopy }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const shareLink = `${window.location.origin}/campaign/${campaign.id}`;

    return (
        <>
            <Typography variant="h4" gutterBottom>
                {campaign.title}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <Typography variant="subtitle2" sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    {campaign.wallet_address}
                </Typography>
                <IconButton size="small" onClick={() => onCopy(campaign.wallet_address)}>
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography variant="body1" sx={{ mt: 2 }}>
                {campaign.description}
            </Typography>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                    Goal: ${parseFloat(campaign.goal).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                    Collected: ${parseFloat(campaign.collected).toFixed(2)}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">Share:</Typography>
                <MuiLink
                    href={shareLink}
                    sx={{
                        maxWidth: isMobile ? '200px' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {shareLink}
                </MuiLink>
                <IconButton size="small" onClick={() => onCopy(shareLink)}>
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Box>
        </>
    );
};
