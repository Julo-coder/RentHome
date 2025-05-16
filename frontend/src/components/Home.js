import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="center-content">
            <h1>RentHome</h1>
            <p>Automatyzuj i kontroluj swój wynajem!</p>
            <div>
                <Link to="/login" className="btn">Logowanie</Link>
                <Link to="/register" className="btn">Rejestracja</Link>
            </div>
        </div>
    );
}