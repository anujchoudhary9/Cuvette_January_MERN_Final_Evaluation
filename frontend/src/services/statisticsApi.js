import axios from "axios";

const API_URL = "https://cuvette-january-mern-final-evaluation.onrender.com";

export const getStatistics = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/api/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
