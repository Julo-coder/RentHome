import Header from "./Header";
import { Link } from "react-router-dom";

export default function Reset(){
    return (
        <div className="reset-section">
            <Header />
            <div className="reset-container">
                <h1 className="reset-title">Resetowanie hasła</h1>
                <form className="reset-form">
                    <label htmlFor="email" className="reset-label">Email:</label>
                    <input type="email" id="email" name="email" className="reset-input" required />
                    <button type="submit" className="reset-button">Resetuj hasło</button>
                    <p className="reset-text">
                        Masz już konto? <Link to="/login" className="reset-link">Zaloguj się</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}