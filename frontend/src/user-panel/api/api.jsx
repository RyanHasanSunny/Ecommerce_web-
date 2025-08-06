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

// ✅ Existing functions...
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

export const deleteProduct = async (productId) => {
  const res = await api.delete(`/product/${productId}`);
  return res.data;
};   

export const getStats = async () => {
  const res = await api.get("/stats");
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const res = await api.put("/auth/password", { currentPassword, newPassword });
  return res.data;
};

export const getUserAddresses = async () => {
  const res = await api.get("/user/addresses");
  return res.data;
}

export const addAddress = async (addressData) => {
  const res = await api.post("/user/address", addressData);
  return res.data;
}

export const getUserProducts = async () => {
  const res = await api.get("/user/products");
  return res.data;
}

export const getAdminProducts = async () => (await api.get("/products")).data;

// ✅ NEW IMAGE UPLOAD FUNCTIONS

// Create a separate axios instance for file uploads (multipart/form-data)
const createUploadApi = () => {
  const uploadApi = axios.create({
    baseURL: "http://localhost:8080/api/upload",
    // Don't set Content-Type header for FormData - axios will set it automatically
  });

  uploadApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) config.headers["x-auth-token"] = token;
    return config;
  });

  return uploadApi;
};

// Upload single image
export const uploadSingleImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const uploadApi = createUploadApi();
  const res = await uploadApi.post("/single", formData);
  return res.data;
};

// Upload multiple images
export const uploadMultipleImages = async (imageFiles) => {
  const formData = new FormData();
  
  // Add all files to FormData
  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  const uploadApi = createUploadApi();
  const res = await uploadApi.post("/multiple", formData);
  return res.data;
};

// Delete image
export const deleteImage = async (fileName) => {
  const uploadApi = createUploadApi();
  const encodedFileName = encodeURIComponent(fileName);
  const res = await uploadApi.delete(`/${encodedFileName}`);
  return res.data;
};

// Update/Replace image
export const updateImage = async (oldFileName, newImageFile) => {
  const formData = new FormData();
  formData.append('image', newImageFile);

  const uploadApi = createUploadApi();
  const encodedFileName = encodeURIComponent(oldFileName);
  const res = await uploadApi.put(`/update/${encodedFileName}`, formData);
  return res.data;
};

// List images
export const listImages = async (prefix = 'products/', maxKeys = 100) => {
  const uploadApi = createUploadApi();
  const res = await uploadApi.get(`/list?prefix=${prefix}&maxKeys=${maxKeys}`);
  return res.data;
};

// Get image details
export const getImageDetails = async (fileName) => {
  const uploadApi = createUploadApi();
  const encodedFileName = encodeURIComponent(fileName);
  const res = await uploadApi.get(`/details/${encodedFileName}`);
  return res.data;
};

// Test S3 connection
export const testS3Connection = async () => {
  const uploadApi = createUploadApi();
  const res = await uploadApi.get("/health");
  return res.data;
};

// ✅ Export default axios instance if needed
export default api;