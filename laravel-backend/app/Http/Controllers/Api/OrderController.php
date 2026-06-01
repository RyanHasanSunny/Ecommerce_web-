<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_address.full_name' => ['required', 'string', 'max:100'],
            'shipping_address.phone' => ['required', 'string', 'max:30'],
            'shipping_address.address' => ['required', 'string', 'max:1000'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:20'],
            'payment_method' => ['required', 'in:cod,bkash,nagad,rocket,bank_transfer,card'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'session_id' => ['nullable', 'uuid'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $data) {
            $subtotal = 0;
            $totalUnitPrice = 0;
            $totalProfit = 0;
            $orderItems = [];

            foreach ($data['items'] as $requestedItem) {
                $product = Product::lockForUpdate()->findOrFail($requestedItem['product_id']);
                if ($product->stock < $requestedItem['quantity']) {
                    abort(422, "Insufficient stock for {$product->title}");
                }

                $lineTotal = (float) $product->final_price * $requestedItem['quantity'];
                $subtotal += $lineTotal;
                $totalUnitPrice += (float) $product->unit_price * $requestedItem['quantity'];
                $totalProfit += (float) $product->expected_profit * $requestedItem['quantity'];

                $orderItems[] = [
                    'product_id' => $product->id,
                    'title' => $product->title,
                    'thumbnail_path' => $product->thumbnail_path,
                    'quantity' => $requestedItem['quantity'],
                    'unit_price' => $product->unit_price,
                    'expected_profit' => $product->expected_profit,
                    'delivery_charge' => $product->delivery_charge,
                    'selling_price' => $product->selling_price,
                    'offer_value' => $product->offer_value,
                    'final_price' => $product->final_price,
                    'total_price' => $lineTotal,
                ];

                $product->decrement('stock', $requestedItem['quantity']);
                $product->increment('sold_count', $requestedItem['quantity']);
            }

            $cart = $request->user()
                ? Cart::where('user_id', $request->user()->id)->where('status', 'active')->first()
                : Cart::where('session_id', $data['session_id'] ?? null)->where('status', 'active')->first();

            $discount = (float) ($cart?->discount_amount ?? 0);
            $delivery = str_contains(strtolower($data['shipping_address']['city']), 'dhaka') ? 60 : 120;
            $total = max(0, $subtotal + $delivery - $discount);

            if ($data['payment_method'] === 'cod') {
                $paid = (float) ($data['paid_amount'] ?? 0);
                $paymentStatus = $paid > 0 ? 'partial' : 'cod';
            } else {
                if (empty($data['transaction_id'])) {
                    return response()->json(['message' => 'Transaction ID is required for prepaid orders'], 422);
                }
                $paid = $total;
                $paymentStatus = 'pending_verification';
            }

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'guest_session_id' => $data['session_id'] ?? null,
                'order_number' => 'ORD-'.now()->format('ymdHis').'-'.random_int(1000, 9999),
                'shipping_address' => $data['shipping_address'],
                'subtotal' => $subtotal,
                'delivery_charge' => $delivery,
                'discount_amount' => $discount,
                'discount_type' => $cart?->discount_type,
                'applied_promo' => $cart?->applied_promo,
                'total_amount' => $total,
                'paid_amount' => $paid,
                'due_amount' => max(0, $total - $paid),
                'total_unit_price' => $totalUnitPrice,
                'total_profit' => $totalProfit,
                'net_profit' => $totalProfit - $discount,
                'payment_method' => $data['payment_method'],
                'payment_status' => $paymentStatus,
                'payment_details' => ['transaction_id' => $data['transaction_id'] ?? null],
                'notes' => $data['notes'] ?? null,
            ]);

            $order->items()->createMany($orderItems);
            $cart?->update(['status' => 'completed']);

            return response()->json($order->load('items.product'), 201);
        });
    }

    public function mine(Request $request)
    {
        return $request->user()->orders()->with('items.product')->latest()->paginate(20);
    }

    public function showMine(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        return $order->load('items.product');
    }

    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return Order::with('user', 'items.product')->latest()->paginate((int) $request->query('per_page', 20));
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return $order->load('user', 'items.product');
    }

    public function updateStatus(Request $request, Order $order)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'estimated_delivery_at' => ['nullable', 'date'],
            'cancel_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($data['status'] === 'delivered') {
            $data['delivered_at'] = now();
        }

        $order->update($data);

        return $order->fresh('items.product');
    }

    public function updatePayment(Request $request, Order $order)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'payment_status' => ['required', 'in:cod,partial,unpaid,paid,refunded,failed,pending_verification'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'transaction_id' => ['nullable', 'string', 'max:100'],
        ]);

        $paid = $data['paid_amount'] ?? $order->paid_amount;
        $order->update([
            'payment_status' => $data['payment_status'],
            'paid_amount' => $paid,
            'due_amount' => max(0, (float) $order->total_amount - (float) $paid),
            'payment_details' => array_merge($order->payment_details ?? [], ['transaction_id' => $data['transaction_id'] ?? null]),
        ]);

        return $order->fresh('items.product');
    }
}
