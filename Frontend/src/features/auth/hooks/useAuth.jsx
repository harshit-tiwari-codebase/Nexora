import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { login, register, getMe, logout } from "../services/auth.api";
import { setUser, setLoading, setError, setInitialized, clearAuth } from "../services/auth.slice";

const useAuth = () => {
  const dispatch = useDispatch();

  const loginUser = async (payload) => {
    dispatch(setLoading(true));

    try {
      const data = await login(payload);

      dispatch(setUser(data.user));
      dispatch(setError(null));

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";

      dispatch(setError(message));

      return {
        success: false,
        message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const registerUser = async (payload) => {
    dispatch(setLoading(true));

    try {
      const data = await register(payload);

      dispatch(setUser(null));
      dispatch(setError(null));

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";

      dispatch(setError(message));

      return {
        success: false,
        message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getCurrentUser = useCallback(async () => {
    dispatch(setLoading(true));

    try {
      const data = await getMe();

      dispatch(setUser(data.user));
      dispatch(setError(null));

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      dispatch(setUser(null));

      if (error.response?.status !== 401) {
        dispatch(
          setError(error.response?.data?.message || "Something went wrong")
        );
      }

      return {
        success: false,
      };
    } finally {
      dispatch(setLoading(false));
      dispatch(setInitialized(true));
    }
  }, [dispatch]);

  const logoutUser = async () => {
    dispatch(setLoading(true));

    try {
      await logout();
      dispatch(clearAuth());
      dispatch(setInitialized(true));

      return {
        success: true,
      };
    } catch (error) {
      dispatch(setUser(null));
      dispatch(setError(error.response?.data?.message || "Something went wrong"));

      return {
        success: false,
        message: error.response?.data?.message || "Something went wrong",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
  };
};

export default useAuth;