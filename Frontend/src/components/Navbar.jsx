import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAdmin, setAuthenticated } from "../redux/authSlice";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import logo from "../assets/logo.jpg";
import { ADMIN_API_END_POINT } from "../utils/constant.js";

export default function Navbar() {
  const { isAuthenticated } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await axios.get(`${ADMIN_API_END_POINT}/logout`, {
        withCredentials: true,
      });

      dispatch(setAdmin(null));
      dispatch(setAuthenticated(false));

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" width={40} />
          <h1 className="text-xl md:text-2xl font-bold text-indigo-600">
            PlateRental
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/">Dashboard</Link>
          <Link to="/plates">Plates Inventory</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/rentals">Rentals</Link>
          <Link to="/messages">Messages</Link>

          {!isAuthenticated ? (
            <>
              <Link
                className="bg-indigo-500 text-white px-4 py-1 rounded"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="bg-green-500 text-white px-4 py-1 rounded"
                to="/signup"
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={logoutHandler}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 px-6 pb-4 md:hidden">
          <Link to="/">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/rentals">Rentals</Link>

          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      )}
    </nav>
  );
}
