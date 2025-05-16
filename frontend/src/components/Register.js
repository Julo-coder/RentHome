import Header from "./Header";
import { Link } from "react-router-dom";

export default function Register(){
    return (
        <div className="register-section">
            <Header />
            <div className="register-container">
                <h1 className="register-title">Rejestracja</h1>
                <form className="register-form">
                    <label htmlFor="name" className="register-label">Imię:</label>
                    <input type="text" id="name" name="name" className="register-input" required />
                    <label htmlFor="surname" className="register-label">Nazwisko:</label>
                    <input type="text" id="surname" name="surname" className="register-input" required />
                    <label htmlFor="phone" className="register-label">Numer telefonu:</label>
                    <input type="tel" id="phone" name="phone" className="register-input" required />
                    <label htmlFor="email" className="register-label">Email:</label>
                    <input type="email" id="email" name="email" className="register-input" required />
                    <label htmlFor="password" className="register-label">Hasło:</label>
                    <input type="password" id="password" name="password" className="register-input" required />
                    <label htmlFor="confirm-password" className="register-label">Potwierdź hasło:</label>
                    <input type="password" id="confirm-password" name="confirm-password" className="register-input" required />
                    <button type="submit" className="register-button">Zarejestruj</button>
                    <p className="register-text">
                        Masz już konto? <Link to="/login" className="register-link">Zaloguj się</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}