import { NavLink } from "react-router-dom";

export default function Navbar({ items }) {
    return (
        <nav className="logreg-site-navbar">
            <ul className="navbar-list">
                {items.map(({ label, to }) => (
                    <li key={to}>
                        <NavLink to={to}>{label}</NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}