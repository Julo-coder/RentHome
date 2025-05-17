import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Detales from './Detales';

export default function Estate() {
    const [user, setUser] = useState(null);
    const [estates, setEstates] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            const user = JSON.parse(userData);
            setUser(user);
            fetchUserEstates(user.id);
        }
    }, [navigate]);

    const fetchUserEstates = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8081/estates/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch estates');
            }
            const data = await response.json();
            setEstates(data);
        } catch (error) {
            console.error('Error fetching estates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="estate-container">
            {user && <h2>Welcome, {user.name} {user.surname} {user.phone}</h2>}
            <h1>Your Estates</h1>
            <div className="estates-grid">
                {estates.length === 0 ? (
                    <p>You don't have any estates yet.</p>
                ) : (
                    estates.map(estate => (
                        <div key={estate.id} className="estate-card">
                            <div className="estate-header">
                                <h3>Estate #{estate.id}</h3>
                                <span className="occupancy">
                                    {estate.people}/{estate.max_person} people
                                </span>
                            </div>
                            <div className="estate-details">
                                <p><strong>Address:</strong> {estate.address}</p>
                                <p><strong>Area:</strong> {estate.area} m²</p>
                                <p><strong>Occupancy:</strong> {estate.people} out of {estate.max_person}</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/estate-details/${estate.id}`)}
                                className="view-details-btn"
                            >
                                View Details
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

