<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\HomepageSetting;
use App\Models\Product;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function show(Request $request)
    {
        return $this->cart($request)->load('items.product');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'session_id' => ['nullable', 'uuid'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        if ($data['quantity'] > $product->stock) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $cart = $this->cart($request, $data['session_id'] ?? null);
        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = ($item->exists ? $item->quantity : 0) + $data['quantity'];
        $item->unit_price = $product->final_price;
        $item->total_price = $item->quantity * $product->final_price;
        $item->save();
        $cart->recalculate();

        return response()->json($cart->fresh('items.product'), 201);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $cart = $this->cart($request);
        abort_unless($item->cart_id === $cart->id, 404);

        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1']]);
        $product = $item->product;
        if ($data['quantity'] > $product->stock) {
            return response()->json(['message' => 'Insufficient stock'], 422);
        }

        $item->update([
            'quantity' => $data['quantity'],
            'unit_price' => $product->final_price,
            'total_price' => $data['quantity'] * $product->final_price,
        ]);
        $cart->recalculate();

        return $cart->fresh('items.product');
    }

    public function destroyItem(Request $request, CartItem $item)
    {
        $cart = $this->cart($request);
        abort_unless($item->cart_id === $cart->id, 404);

        $item->delete();
        $cart->recalculate();

        return response()->noContent();
    }

    public function clear(Request $request)
    {
        $cart = $this->cart($request);
        $cart->items()->delete();
        $cart->update(['applied_promo' => null, 'discount_amount' => 0, 'discount_type' => null]);
        $cart->recalculate();

        return response()->json($cart->fresh('items.product'));
    }

    public function applyPromo(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'session_id' => ['nullable', 'uuid'],
        ]);

        $setting = HomepageSetting::first();
        if (! $setting?->promo_enabled) {
            return response()->json(['message' => 'Promo codes are disabled'], 422);
        }

        $cart = $this->cart($request, $data['session_id'] ?? null);
        $subtotal = (float) $cart->items()->sum('total_price');
        $promo = PromoCode::where('code', Str::upper($data['code']))->first();

        if (! $promo || ! $promo->isUsableFor($subtotal)) {
            return response()->json(['message' => 'Invalid or expired promo code'], 422);
        }

        $cart->update([
            'applied_promo' => $promo->code,
            'discount_type' => $promo->discount_type,
            'discount_amount' => $promo->discountFor($subtotal),
        ]);

        return $cart->fresh('items.product');
    }

    public function removePromo(Request $request)
    {
        $cart = $this->cart($request);
        $cart->update(['applied_promo' => null, 'discount_amount' => 0, 'discount_type' => null]);

        return $cart->fresh('items.product');
    }

    private function cart(Request $request, ?string $sessionId = null): Cart
    {
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id, 'status' => 'active']);
        }

        $sessionId = $sessionId ?: $request->header('X-Session-Id') ?: (string) Str::uuid();

        return Cart::firstOrCreate(['session_id' => $sessionId, 'status' => 'active']);
    }
}
