import axios from "axios";

const API_URL = "https://cuvette-january-mern-final-evaluation.onrender.com";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getInvoices = async () => {
  const res = await axios.get(API_URL, { headers: authHeader() });
  return res.data;
};

export const markInvoicePaid = async (id) => {
  const res = await axios.put(
    `${API_URL}/${id}/status`,
    { status: "PAID" },
    { headers: authHeader() }
  );
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: authHeader(),
  });
  return res.data;
};

