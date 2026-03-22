import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAdmin, setLoading, setAuthenticated } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { ADMIN_API_END_POINT } from "../utils/constant";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { loading, admin } = useSelector((store) => store.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${ADMIN_API_END_POINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAdmin(res.data.user));
        dispatch(setAuthenticated(true));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (admin) navigate("/");
  }, [admin]);

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4
     bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200"
    >
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        onSubmit={submitHandler}
        className="bg-white w-full max-w-md p-6 md:p-8
        rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center text-indigo-600">
          Admin Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={input.email}
          onChange={changeHandler}
          className="border p-3 w-full rounded-lg
          focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Password with eye */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={input.password}
            onChange={changeHandler}
            className="border p-3 w-full rounded-lg
            focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {loading ? (
          <button className="bg-indigo-500 text-white w-full py-3 rounded-lg flex justify-center">
            <Loader2 className="animate-spin" />
          </button>
        ) : (
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-500
          text-white w-full py-3 rounded-lg hover:scale-105 transition"
          >
            Login
          </button>
        )}

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium">
            Signup
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
