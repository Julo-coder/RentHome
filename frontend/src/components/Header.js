import Navbar from "./Navbar";
import { Link } from "react-router-dom";

export default function Header() {
    return(
        <header className="main-header">
            <h1><Link to="/">RentHome</Link></h1>
            <Navbar />
        </header>
    )
}