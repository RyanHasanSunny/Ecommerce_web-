import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: {
            'x-auth-token': localStorage.getItem('adminToken'), // JWT for authentication
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Handle mark product as sold
  const handleMarkSold = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/product/sold/${productId}`,
        {},
        {
          headers: {
            'x-auth-token': localStorage.getItem('adminToken'), // JWT for authentication
          },
        }
      );
      // Refresh products after marking as sold
      setProducts(products.map((product) =>
        product._id === productId ? { ...product, soldCount: product.soldCount + 1 } : product
      ));
      alert('Product marked as sold');
    } catch (error) {
      console.error('Error marking product as sold:', error);
      alert('Error marking product as sold');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Product List</Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.title}</Typography>
                <Typography>Price: ${product.price}</Typography>
                <Typography>Sold Count: {product.soldCount}</Typography>
                <Typography>Specifications:</Typography>
                <ul>
                  {product.specifications.map((spec, index) => (
                    <li key={index}>{spec.title}: {spec.details}</li>
                  ))}
                </ul>
                <Button variant="contained" onClick={() => handleMarkSold(product._id)}>
                  Mark as Sold
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ProductList;
