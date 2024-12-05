import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import Layout from './components/Layout';
import './App.css'
import Dashboard from "./pages/Dashboard.tsx";
import CampaignPreview from "./pages/CampaignPreview.tsx";
const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/campaign/:id" element={<CampaignPreview />} /> {/* Dynamic route for campaign preview */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/campaigns" element={<CampaignList />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} /> {/* Dynamic Route */}
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
