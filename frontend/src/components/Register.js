import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import { Link } from "react-router-dom";
import Popup from './Popup';
import '../styles/popup.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.name || !formData.surname || !formData.phone || 
            !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            const response = await fetch('http://localhost:8081/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                setPopupMessage('Registration successful! You can now log in.');
                setShowPopup(true);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
        }
    };

    const handleConfirmPopup = () => {
        setShowPopup(false);
        navigate('/login');
    };

    return (
        <div className="register-section">
            <Header />
            <div className="register-container">
                <h1 className="register-title">Register</h1>
                {error && <p className="error-message">{error}</p>}
                <form className="register-form" onSubmit={handleSubmit}>
                    <label htmlFor="name" className="register-label">First Name:</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="register-input" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="surname" className="register-label">Last Name:</label>
                    <input 
                        type="text" 
                        id="surname" 
                        name="surname" 
                        className="register-input" 
                        value={formData.surname}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="phone" className="register-label">Phone number:</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        className="register-input" 
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="email" className="register-label">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        className="register-input" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="password" className="register-label">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        className="register-input" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="confirmPassword" className="register-label">Confirm password:</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        className="register-input" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required 
                    />
                    <button type="submit" className="register-button">Register</button>
                    <p className="register-text">
                        Already have an account? <Link to="/login" className="register-link">Log in</Link>
                    </p>
                </form>
            </div>

            <Popup 
                isOpen={showPopup}
                title="Registration successful"
                message={popupMessage}
                onConfirm={handleConfirmPopup}
                onCancel={() => setShowPopup(false)}
                confirmLabel="Go to login"
                cancelLabel="Close"
            />
        </div>
    );
}