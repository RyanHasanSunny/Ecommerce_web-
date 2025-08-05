// src/user-panel/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});


// ✅ Named export

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};
export const addCategory = async (categoryData) => {
  const res = await api.post("/category", categoryData);
    return res.data;
};
export const addProduct = async (productData) => {
  const res = await api.post("/product", productData);
  return res.data;
};
export const getProductById = async (productId) => {
  const res = await api.get(`/product/${productId}`);
  return res.data;
};
export const updateProduct = async (productId, productData) => {
  const res = await api.put(`/product/${productId}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
    const res = await api.delete(`/product/${productId}`);
    return res.data;
};   

export const getStats = async () => {
  const res = await api.get("/stats");
  // res.data is { totalProducts, totalSold, totalSearches }
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { token, role }
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data; // { name, email, ... }
}
export const updatePassword = async (currentPassword, newPassword) => {
  const res = await api.put("/auth/password", { currentPassword, newPassword });
  return res.data; // { message: "Password updated successfully" }
}
export const getUserAddresses = async () => {

  const res = await api.get("/user/addresses");
  return res.data; // [{ id, address }, ...]  
}
export const addAddress = async (addressData) => {
  const res = await api.post("/user/address", addressData);
  return res.data; // { id, address }
}
export const getUserProducts = async () => {
  const res = await api.get("/user/products");
  return res.data; // [{ id, name, ... }, ...]
}

export const getAdminProducts = async () => (await api.get("/products")).data;

// ✅ Export default axios instance if needed
export default api;
