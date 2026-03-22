import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { ADMIN_API_END_POINT } from "../utils/constant";
import { setLoading } from "../redux/authSlice";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, admin } = useSelector((store) => store.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${ADMIN_API_END_POINT}/register`, form, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (admin) {
      navigate("/");
    }
  }, [admin, navigate]);

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4
    bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200"
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 md:p-8
        rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-600">
          Admin Signup
        </h2>

        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={form.fullname}
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {loading ? (
          <button className="bg-purple-500 text-white w-full py-3 rounded-lg flex justify-center">
            <Loader2 className="animate-spin" />
          </button>
        ) : (
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500
          text-white w-full py-3 rounded-lg hover:scale-105 transition duration-300"
          >
            Signup
          </button>
        )}

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 font-medium">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
