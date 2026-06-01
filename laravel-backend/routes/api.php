<?php

use App\Http\Controllers\Api\AdminStatsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\HomepageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/homepage', [HomepageController::class, 'show']);

Route::prefix('guest')->group(function () {
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'destroyItem']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/promo', [CartController::class, 'applyPromo']);
    Route::delete('/cart/promo', [CartController::class, 'removePromo']);
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::get('/user/addresses', [AuthController::class, 'addresses']);
    Route::post('/user/addresses', [AuthController::class, 'storeAddress']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'destroyItem']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/promo', [CartController::class, 'applyPromo']);
    Route::delete('/cart/promo', [CartController::class, 'removePromo']);

    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/orders/my', [OrderController::class, 'mine']);
    Route::get('/orders/my/{order}', [OrderController::class, 'showMine']);

    Route::apiResource('/products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('/categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('/promos', PromoCodeController::class);
    Route::put('/homepage', [HomepageController::class, 'update']);
    Route::get('/uploads', [UploadController::class, 'index']);
    Route::post('/uploads', [UploadController::class, 'store']);
    Route::delete('/uploads/{uploadedImage}', [UploadController::class, 'destroy']);

    Route::get('/admin/stats', AdminStatsController::class);
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{order}', [OrderController::class, 'show']);
    Route::put('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::put('/admin/orders/{order}/payment', [OrderController::class, 'updatePayment']);
});
