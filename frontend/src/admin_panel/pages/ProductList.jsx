// src/admincomponents/ProductList.jsx
import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Typography, Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAdminProducts,
  deleteProduct,
  getCategories,
} from "../../user-panel/api/api";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // load products
  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // load categories
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // filter logic
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.productId.toLowerCase().includes(q);

    // parentCategory might be an ObjectId or populated object
    const rawParent = p.category.parentCategory;
    const parentId  = rawParent?._id || rawParent;

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === p.category._id ||
      selectedCategory === parentId;

    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = (id) => navigate(`/admin/products/edit/${id}`);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      alert(`Error deleting product: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="admin-products flex text-left justify-center">
    <Box >
      {/* header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/products/add")}
        >
          + Add Product
        </Button>
      </Box>

      {/* filters */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={4}>
        <input
          type="text"
          placeholder="Search by Name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Categories</option>
          {categories
            .filter((c) => c.isParent)
            .map((parent) => (
              <optgroup key={parent._id} label={parent.name}>
                <option value={parent._id}>{parent.name}</option>
                {categories
                  .filter(
                    (ch) =>
                      !ch.isParent &&
                      String(ch.parentCategory?._id || ch.parentCategory) ===
                        parent._id
                  )
                  .map((child) => (
                    <option key={child._id} value={child._id}>
                      ↳ {child.name}
                    </option>
                  ))}
              </optgroup>
            ))}
        </select>
      </Box>

      {/* table */}
      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                "Product ID",
                "Name",
                "Category",
                "Stock",
                "Last Modified",
                "Price",
                "Profit",
                "Selling Price",
                "Offer Price",
                "Actions",
              ].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.productId}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{p.price} BDT</TableCell>
                  <TableCell>{p.profit} BDT</TableCell>
                  <TableCell>{p.sellingPrice} BDT</TableCell>
                  <TableCell>
                    {p.offerPrice ? `${p.offerPrice} BDT` : "N/A"}
                    </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProduct(p._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProduct(p._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    </div>
  );
};

export default ProductList;
