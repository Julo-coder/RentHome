import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import AddContractModal from './AddContractModal';
import ContractDetailsModal from './ContractDetailsModal';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
    const [isContractDetailsOpen, setIsContractDetailsOpen] = useState(false);
    const navigate = useNavigate();

    const fetchUserProfile = useCallback(async () => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userData);
            setUser(user);

            const response = await fetch(`http://localhost:8081/user/stats/${user.id}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile statistics');
            }

            const statsData = await response.json();
            setStats(statsData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleContractUpdate = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8081/user/stats/${user.id}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch profile statistics');
            const statsData = await response.json();
            setStats(statsData);
        } catch (error) {
            setError(error.message);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    if (loading) return <div className="loading-div">Loading...</div>;
    if (error) return <div className="error-div">Error: {error}</div>;
    if (!user || !stats) return <div className="not-found-div">Profile not found</div>;

    const profileNav = [
        { label: "Back to Estates", to: "/estate" },
        { label: "Add Contract", to: "#", onClick: () => setIsAddContractModalOpen(true) }
    ];

    return (
        <div className="profile-container">
            <Header navItems={profileNav} />
            
            <div className="profile-content">
                <div className="profile-header">
                    <h2>Profile Overview</h2>
                    <div className="user-details">
                        <h3>{user.name} {user.surname}</h3>
                        <p>{user.email}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Properties</h3>
                        <div className="stat-value">{stats.estates.total}</div>
                        <p className="stat-label">Total Estates</p>
                        <p className="stat-details">Average Area: {stats.estates.averageArea}m²</p>
                    </div>

                    <div className="stat-card">
                        <h3>Tenants</h3>
                        <div className="stat-value">{stats.estates.totalTenants}</div>
                        <p className="stat-label">Total Occupants</p>
                        <p className="stat-details">Occupancy Rate: {stats.estates.occupancyRate}%</p>
                    </div>

                    <div className="stat-card">
                        <h3>Finances</h3>
                        <div className="stat-value">{stats.contracts.monthlyIncome} zł</div>
                        <p className="stat-label">Monthly Income</p>
                        <p className="stat-details">Average Rent: {stats.contracts.averageRent} zł</p>
                    </div>

                    <div className="stat-card">
                        <h3>Contracts</h3>
                        <div className="stat-value">{stats.contracts.total}</div>
                        <p className="stat-label">Active Contracts</p>
                        <p className="stat-details">Monthly Charges: {stats.contracts.monthlyCharges} zł</p>
                        <button 
                            className="view-details-btn"
                            onClick={() => setIsContractDetailsOpen(true)}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            <AddContractModal
                isOpen={isAddContractModalOpen}
                onClose={() => setIsAddContractModalOpen(false)}
                onUpdate={fetchUserProfile}
                userId={user?.id}
            />

            <ContractDetailsModal
                isOpen={isContractDetailsOpen}
                onClose={() => setIsContractDetailsOpen(false)}
                userId={user?.id}
                onUpdate={handleContractUpdate}
            />
        </div>
    );
}