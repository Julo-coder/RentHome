import Navbar from "./Navbar";
import { Link } from "react-router-dom";

export default function Header({ navItems }) {
    // Check if user is logged in by checking if navItems are passed
    const isLoggedIn = !!navItems;
    
    const defaultNav = [
        { label: "Home", to: "/" },
        { label: "Rejestracja", to: "/register" },
        { label: "Logowanie", to: "/login" },
    ];

    return (
        <header className="main-header">
            <h1>
                <Link to={isLoggedIn ? "/estate" : "/"}>
                    RentHome
                </Link>
            </h1>
            <Navbar items={navItems || defaultNav} />
        </header>
    );
}