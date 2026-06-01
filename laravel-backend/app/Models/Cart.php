<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'status',
        'applied_promo',
        'discount_type',
        'discount_amount',
        'total_amount',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function recalculate(): void
    {
        $this->total_amount = $this->items()->sum('total_price');
        $this->save();
    }
}
