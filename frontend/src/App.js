import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Reset from "./components/Reset";
import Estate from "./components/Estate";
import Details from "./components/Details";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/estate" element={<Estate />} />
      <Route path="/estate-details/:estateId" element={<Details />} />
    </Routes>
  );
}