# Guest Cart Implementation TODO

## Backend Changes

### 1. Modify Cart Model (cartModel.js)
- [x] Add optional `sessionId` field for guest carts
- [x] Make `userId` optional for guest carts
- [x] Add validation to ensure either `userId` or `sessionId` exists
- [x] Update discountType enum to match controller usage

### 2. Update Cart Routes (cartRoutes.js)
- [x] Create separate routes for guest operations (no auth required)
- [x] Keep existing authenticated routes
- [ ] Add middleware to handle session ID from headers/cookies

### 3. Update Cart Controller (cartController.js)
- [x] Modify all methods to handle both authenticated and guest carts
- [x] Add logic to identify cart by `userId` or `sessionId`
- [ ] Implement cart merging when guest logs in
- [x] Update addToCart, getCart, updateCartItemQuantity, removeItem, clearCart, applyPromo, removePromo

### 4. Update Order Controller (orderController.js)
- [ ] Modify placeOrder to accept guest orders
- [ ] Add validation for guest billing information
- [ ] Handle guest cart clearing after order placement

### 5. Update Order Routes (orderRoutes.js)
- [ ] Add guest order placement route without auth requirement

## Frontend Changes

### 6. Update AuthContext (AuthContext.jsx)
- [ ] Add guest cart management in localStorage
- [ ] Implement cart merging logic when user logs in
- [ ] Add methods for guest cart operations

### 7. Update CartPage (CartPage.jsx)
- [ ] Remove authentication redirect
- [ ] Add logic to handle both authenticated and guest carts
- [ ] Update API calls to use appropriate endpoints

### 8. Update ProductCard (ProductCard.jsx)
- [ ] Add add-to-cart functionality for guests
- [ ] Handle cart operations without authentication

### 9. Update API Service (api.jsx)
- [ ] Add guest cart API methods
- [ ] Add session ID handling for guest operations
- [ ] Update existing cart methods to support guests

### 10. Create Guest Checkout Flow
- [ ] Create guest checkout page/component
- [ ] Add billing address collection form
- [ ] Implement guest order placement

## Testing and Validation

### 11. Test Guest Cart Functionality
- [ ] Test adding items to cart as guest
- [ ] Test cart persistence across browser sessions
- [ ] Test cart merging when logging in

### 12. Test Guest Checkout
- [ ] Test guest order placement with billing info
- [ ] Verify order creation and cart clearing

### 13. Test Authenticated User Functionality
- [ ] Ensure existing authenticated cart functionality still works
- [ ] Test cart merging from guest to authenticated user
