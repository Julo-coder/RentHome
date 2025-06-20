import { NavLink } from "react-router-dom";

export default function Navbar({ items }) {
    return (
        <nav className="navbar">
            <ul className="nav-list">
                {items.map((item, index) => (
                    <li key={index}>
                        <NavLink
                            to={item.to}
                            onClick={item.onClick}
                            className={({ isActive }) => 
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}