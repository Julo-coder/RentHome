import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const authNav = [
    { label: "Home", to: "/" },
    { label: "Rejestracja", to: "/register" },
    { label: "Logowanie", to: "/login" },
  ];


export default function Header() {
    return(
        <header className="main-header">
            <h1><Link to="/">RentHome</Link></h1>
            <Navbar items={authNav}/>
        </header>
    )
}