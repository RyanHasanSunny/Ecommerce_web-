<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'title',
        'thumbnail_path',
        'quantity',
        'unit_price',
        'expected_profit',
        'delivery_charge',
        'selling_price',
        'offer_value',
        'final_price',
        'total_price',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'expected_profit' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'offer_value' => 'decimal:2',
        'final_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
