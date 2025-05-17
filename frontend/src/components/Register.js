import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import { Link } from "react-router-dom";

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
            setError('Wszystkie pola są wymagane');
            return false;
        }
        
        if (formData.password.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków');
            return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie pasują do siebie');
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
            console.log('Registration response:', data); // Debug log

            if (response.ok) {
                alert('Registration successful!');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
        }
    };

    return (
        <div className="register-section">
            <Header />
            <div className="register-container">
                <h1 className="register-title">Rejestracja</h1>
                {error && <p className="error-message">{error}</p>}
                <form className="register-form" onSubmit={handleSubmit}>
                    <label htmlFor="name" className="register-label">Imię:</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="register-input" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="surname" className="register-label">Nazwisko:</label>
                    <input 
                        type="text" 
                        id="surname" 
                        name="surname" 
                        className="register-input" 
                        value={formData.surname}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="phone" className="register-label">Numer telefonu:</label>
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
                    <label htmlFor="password" className="register-label">Hasło:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        className="register-input" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                    />
                    <label htmlFor="confirmPassword" className="register-label">Potwierdź hasło:</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        className="register-input" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required 
                    />
                    <button type="submit" className="register-button">Zarejestruj</button>
                    <p className="register-text">
                        Masz już konto? <Link to="/login" className="register-link">Zaloguj się</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}