import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import '../styles/profile.css';

export default function Profile() {
    const { userId } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileStats = async () => {
            try {
                const response = await fetch(`http://localhost:8081/user/stats/${userId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to fetch profile statistics');
                }

                const data = await response.json();
                setStats(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileStats();
    }, [userId, navigate]);

    if (loading) return <div className="loading-div">Loading...</div>;
    if (error) return <div className="error-div">Error: {error}</div>;
    if (!stats) return <div className="not-found-div">No statistics found</div>;

    const profileNav = [
        { label: "Back to Estates", to: "/estate" }
    ];

    return (
        <div className="profile-container">
            <Header navItems={profileNav} />
            
            <div className="profile-content">
                <h2>Profile Statistics</h2>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Estates</h3>
                        <p className="stat-number">{stats.totalEstates}</p>
                        <p className="stat-label">Total Properties</p>
                    </div>

                    <div className="stat-card">
                        <h3>Contracts</h3>
                        <p className="stat-number">{stats.totalContracts}</p>
                        <p className="stat-label">Active Contracts</p>
                    </div>

                    <div className="stat-card">
                        <h3>Monthly Income</h3>
                        <p className="stat-number">${stats.monthlyIncome}</p>
                        <p className="stat-label">Total Rental Income</p>
                    </div>

                    <div className="stat-card">
                        <h3>Occupancy</h3>
                        <p className="stat-number">{stats.occupancyRate}%</p>
                        <p className="stat-label">Average Occupancy Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}