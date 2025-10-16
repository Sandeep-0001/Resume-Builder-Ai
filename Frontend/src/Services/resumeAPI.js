import axios from "axios";

// Use Vite environment variable directly
const API_BASE_URL = import.meta.env.VITE_APP_URL;

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}api/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // keep if backend uses cookies
});


const createNewResume = async (data) => {
  try {
    const response = await axiosInstance.post(
      "resumes/createResume",
      data.data
    );
    return response.data;
  } catch (error) {
    // console.log("Eroor in getting all the resumes ",error);
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getAllResumeData = async () => {
  try {
    const response = await axiosInstance.get("resumes/getAllResume");
    return response.data;
  } catch (error) {
    // console.log("Eroor in getting all the resumes ",error);
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getResumeData = async (resumeID) => {
  try {
    const response = await axiosInstance.get(
      `resumes/getResume?id=${resumeID}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const updateThisResume = async (resumeID, data) => {
  try {
    const response = await axiosInstance.put(
      `resumes/updateResume?id=${resumeID}`,
      data.data
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const deleteThisResume = async (resumeID) => {
  try {
    const response = await axiosInstance.delete(
      `resumes/removeResume?id=${resumeID}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

export {
  getAllResumeData,
  deleteThisResume,
  getResumeData,
  updateThisResume,
  createNewResume,
};
