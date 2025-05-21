import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import Detales from './Detales';
import AddEstateModal from './AddEstateModal';
import Header from './Header';

export default function Estate() {
    const [user, setUser] = useState(null);
    const [estates, setEstates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Move fetchUserEstates definition before useEffect and wrap in useCallback
    const fetchUserEstates = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8081/estates', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch estates');
            }
            
            const data = await response.json();
            setEstates(data);
        } catch (error) {
            console.error('Error fetching estates:', error);
        } finally {
            setLoading(false);
        }
    }, [navigate]); // Include navigate in dependencies

    useEffect(() => {
        // Prevent going back
        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', preventGoBack);

        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            const user = JSON.parse(userData);
            setUser(user);
            fetchUserEstates();
        }

        // Cleanup function
        return () => {
            window.removeEventListener('popstate', preventGoBack);
        };
    }, [navigate, fetchUserEstates]); // Add fetchUserEstates to dependencies

    const preventGoBack = (e) => {
        window.history.pushState(null, '', window.location.pathname);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8081/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Remove event listener before logging out
                window.removeEventListener('popstate', preventGoBack);
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Funkcja obsługująca dodanie mieszkania po zatwierdzeniu z modalu
    const handleAddEstate = async (formData) => {
        try {
            const response = await fetch('http://localhost:8081/estates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    max_person: parseInt(formData.max_person),
                    people: parseInt(formData.people),
                    area: parseInt(formData.area)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add estate');
            }

            const data = await response.json();
            console.log('Estate added:', data);
            fetchUserEstates(); // Refresh the estates list
        } catch (error) {
            console.error('Error adding estate:', error);
        }
    };

    if (loading) {
        return <div className='loading-div'>Loading...</div>;
    }

    const estateNav = [
        { label: "Dashboard", to: "/estate" },
        { label: "Profile", to: "/profile" },
        { label: "Settings", to: "/settings" },
        { label: "Add estate", to: "#", onClick: () => setIsModalOpen(true) },
        { label: "Logout", to: "#", onClick: handleLogout }
    ];

    return (
        <div className="estate-container">
            <Header navItems={estateNav} />
            <div className="header-section">
                {user && (
                    <div className="user-info">
                        <h2>Welcome, {user.name} {user.surname}</h2>
                    </div>
                )}
            </div>

            <AddEstateModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEstate}
            />

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
                                <p><strong>City:</strong> {estate.city}</p>
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

