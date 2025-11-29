import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL

export const getCourses = async () => {
  const res = await axios.get(`{BASE_URL}/`);
  return res.data;
};

export const createCourse = async (data, token) => {
  const res = await axios.post(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateCourse = async (id, data, token) => {
  const res = await axios.put(`${BASE_URL}/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteCourse = async (id, token) => {
  await axios.delete(`${BASE_URL}/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
