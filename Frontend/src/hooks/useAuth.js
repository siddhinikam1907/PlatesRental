import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAdmin, setAuthenticated } from "../redux/authSlice";
import { ADMIN_API_END_POINT } from "../utils/constant";

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${ADMIN_API_END_POINT}/profile`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setAdmin(res.data.admin));
          dispatch(setAuthenticated(true));
        } else {
          dispatch(setAdmin(null));
          dispatch(setAuthenticated(false));
        }
      } catch (err) {
        dispatch(setAdmin(null));
        dispatch(setAuthenticated(false));
      }
    };

    fetchProfile();
  }, [dispatch]);
};
