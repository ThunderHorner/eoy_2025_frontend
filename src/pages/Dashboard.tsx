import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Campaign {
    id: number;
    title: string;
    description: string;
    goal: string; // Stored as string from API
    collected: string; // Stored as string from API
    wallet_address: string;
}

const Dashboard: React.FC = () => {

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [open, setOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        description: '',
        goal: '',
        wallet_address: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await axios.get<Campaign[]>('http://localhost:8000/api/v1/donation/campaigns/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCampaigns(response.data);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            }
        };


        fetchCampaigns();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewCampaign({ title: '', description: '', goal: '', wallet_address: ''});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCampaign({ ...newCampaign, [e.target.name]: e.target.value });
    };

    const handleCreateCampaign = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await axios.post(
                'http://localhost:8000/api/v1/donation/campaigns/',
                {
                    title: newCampaign.title,
                    description: newCampaign.description,
                    goal: parseFloat(newCampaign.goal),
                    wallet_address: newCampaign.wallet_address,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCampaigns([...campaigns, response.data]);
            handleClose();
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    return (
        <Box padding={4}>
            <Box display="flex" className={"create-campaign-button"} justifyContent="space-between" alignItems="center" marginBottom={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpen}
                    sx={{
                        borderRadius: '50%',
                        minWidth: '60px',
                        width: '60px',
                        height: '60px',
                        fontSize: '1.5rem',
                        padding: 0
                    }}
                >
                    +
                </Button>
            </Box>
            <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                    <Grid item xs={12} sm={12} md={6} xl={4} key={campaign.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{campaign.title}</Typography>
                                <Typography variant="body2">{campaign.wallet_address}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {campaign.description}
                                </Typography>
                                <Typography variant="body1">
                                    Goal: ${parseFloat(campaign.goal).toFixed(2)}
                                </Typography>
                                <Typography variant="body1">
                                    Collected: ${parseFloat(campaign.collected).toFixed(2)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/campaign/${campaign.id}`)} // Navigate to Campaign Preview
                                    sx={{ marginTop: 2 }}
                                >
                                    View Campaign
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create Campaign Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create a New Campaign</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        name="title"
                        value={newCampaign.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={newCampaign.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Goal"
                        name="goal"
                        type="number"
                        value={newCampaign.goal}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Wallet address"
                        name="wallet_address"
                        type="string"
                        value={newCampaign.wallet_address.startsWith('0x') ? newCampaign.wallet_address : `0x${newCampaign.wallet_address}`}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateCampaign} color="primary" variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
