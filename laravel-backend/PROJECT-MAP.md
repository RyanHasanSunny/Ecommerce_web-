# Laravel Ecommerce Backend Map

This backend is a fresh Laravel rebuild of the old ecommerce API. It is not a line-by-line conversion; the security-sensitive flows were redesigned around Laravel conventions.

## Stack

- Laravel 12
- Laravel Sanctum personal access tokens for API auth
- Spatie Laravel Permission for `admin` and `customer` roles
- SQLite locally by default; switch `.env` to MySQL/PostgreSQL for production
- Public storage disk for product images

## Seeded Login

After `php artisan migrate:fresh --seed`, an admin user is created:

- Email: `admin@example.com`
- Password: `password`

Change this before production.

## Feature Map

- Auth: register, login, logout, profile, password update
- Roles: admin/customer; public registration always creates a customer
- User addresses: list and create addresses
- Products: public browse/detail, admin create/update/delete
- Categories: public hierarchy/detail, admin create/update/delete
- Cart: authenticated carts and guest carts via `X-Session-Id`
- Promos: admin CRUD, cart promo application
- Orders: authenticated and guest checkout, admin order/payment/status management
- Homepage content: public read, admin update
- Uploads: admin-only image uploads to Laravel storage
- Dashboard stats: admin totals for products, searches, sales, orders, revenue, due amount

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/products`
- `GET /api/categories`
- `GET /api/homepage`
- `POST /api/cart`
- `POST /api/guest/cart`
- `POST /api/orders`
- `POST /api/guest/orders`
- `GET /api/admin/stats`
- `GET /api/admin/orders`

Protected routes use:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Local Commands

```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

## Security Notes

- Admin role cannot be self-selected during registration.
- Admin-only actions check `hasRole('admin')` server-side.
- Uploads are authenticated and admin-only before file storage.
- Non-COD orders are marked `pending_verification`, not automatically paid.
- For production, add real payment gateway webhook verification before setting `payment_status = paid`.
