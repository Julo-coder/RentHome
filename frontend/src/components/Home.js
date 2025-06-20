import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="center-content">
            <h1>RentHome</h1>
            <p>Automate and control your rental!</p>
            <div>
                <Link to="/login" className="btn">Login</Link>
                <Link to="/register" className="btn">Register</Link>
            </div>
        </div>
    );
}