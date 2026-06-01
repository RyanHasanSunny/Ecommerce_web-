<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'guest_session_id',
        'order_number',
        'shipping_address',
        'subtotal',
        'delivery_charge',
        'extra_charge',
        'discount_amount',
        'discount_type',
        'applied_promo',
        'total_amount',
        'paid_amount',
        'due_amount',
        'total_unit_price',
        'total_profit',
        'net_profit',
        'payment_method',
        'payment_status',
        'payment_details',
        'status',
        'tracking_number',
        'estimated_delivery_at',
        'delivered_at',
        'notes',
        'cancel_reason',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'payment_details' => 'array',
        'estimated_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'extra_charge' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'total_unit_price' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'net_profit' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
