import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import { Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            try {
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/estate');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setError('Unable to connect to server. Please check your connection.');
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="login-setction">
            <Header/>
            <div className="login-container">
                <h1 className="login-title">Login</h1>
                {error && <p className="error-message">{error}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email" className="login-label">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input" 
                        required 
                    />
                    <label htmlFor="password" className="login-label">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input" 
                        required 
                    />
                    <button type="submit" className="login-button">Log in</button>
                    <p className="login-text">
                        Don't have an account? <Link to="/register" className="login-link">Register</Link>
                    </p>
                    <p className="login-text">
                        Forgot your password? <Link to="/reset" className="login-link">Reset password</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}