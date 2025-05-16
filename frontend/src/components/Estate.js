import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Estate() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    return (
        <div>
            {user && <h2>Welcome, {user.email}</h2>}
            <h1>List of Estates</h1>
            {/* Rest of your estate list content */}
        </div>
    );
}
