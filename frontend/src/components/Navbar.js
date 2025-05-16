import { NavLink } from "react-router-dom";

export default function Navbar(){
    return (
        <nav className="logreg-site-navbar">
            <ul className="navbar-list">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/register">Rejestracja</NavLink></li>
                <li><NavLink to="/login">Logowanie</NavLink></li>
            </ul>
        </nav>
    )
}