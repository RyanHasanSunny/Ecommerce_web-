import React from "react";
import { Card, CardContent, Typography, CardMedia, Box } from "@mui/material";

const ProductCard = ({ thumbnail, title, sellingPrice, offerPrice, onClick }) => {
  return (
    <Card sx={{ width: 280, borderRadius: 2, boxShadow: 3 }} onClick={onClick}>  {/* Make card clickable */}
      <CardMedia
        component="img"
        alt={title}
        height="180"
        image={thumbnail}
        sx={{ objectFit: "cover", borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
      />
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" sx={{ textDecoration: offerPrice ? "line-through" : "none", color: "gray" }}>
            ${sellingPrice}
          </Typography>
          {offerPrice && (
            <Typography variant="body1" color="primary" sx={{ fontWeight: "bold" }}>
              ${offerPrice}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
