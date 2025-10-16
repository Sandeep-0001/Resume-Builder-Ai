import axios from "axios";

// Use Vite environment variable directly
const API_BASE_URL = import.meta.env.VITE_APP_URL;

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}api/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // include cookies if needed
});

const startUser = async () => {
  try {
    const response = await axiosInstance.get("users/");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const registerUser = async (data) => {
  try {
    const response = await axiosInstance.post("users/register/", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const loginUser = async (data) => {
  try {
    const response = await axiosInstance.post("users/login/", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const logoutUser = async () => {
  try {
    const response = await axiosInstance.get("users/logout/");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

export { startUser, registerUser, loginUser, logoutUser };
