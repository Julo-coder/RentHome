import Header from "./Header";
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <div className="login-setction">
            <Header />
            <div className="login-container">
                <h1 className="login-title">Logowanie</h1>
                <form className="login-form">
                    <label htmlFor="email" className="login-label">Email:</label>
                    <input type="email" id="email" name="email" className="login-input" required />
                    <label htmlFor="password" className="login-label">Hasło:</label>
                    <input type="password" id="password" name="password" className="login-input" required />
                    <button type="submit" className="login-button">Zaloguj</button>
                    <p className="login-text">
                        Nie masz konta? <Link to="/register" className="login-link">Zarejestruj się</Link>
                    </p>
                    <p className="login-text">
                        Zapomniałeś hasła? <Link to="/reset" className="login-link">Resetuj hasło</Link>
                    </p>
                </form>
            </div>
        </div>
        
    );
}