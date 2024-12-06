import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import Layout from './components/Layout';
import Dashboard from "./pages/Dashboard";
import CampaignPreview from "./pages/CampaignPreview";
import './App.css';
import StreamlabsAuth from "./pages/StreamlabsAuth.tsx";

const App: React.FC = () => {
    const isAuthenticated = localStorage.getItem('access') !== null;

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />}
                    />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route
                        path="/auth"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <StreamlabsAuth />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                    />
                    <Route
                        path="/dashboard"
                        element={!isAuthenticated ? <Navigate to="/login" /> : <Dashboard />}
                    />
                    <Route path="/campaign/:id" element={<CampaignPreview />} />
                    <Route path="/campaigns" element={<CampaignList />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;