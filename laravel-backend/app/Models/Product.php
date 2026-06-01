<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'sku',
        'title',
        'slug',
        'company_name',
        'description',
        'specifications',
        'unit_price',
        'expected_profit',
        'delivery_charge',
        'selling_price',
        'offer_value',
        'final_price',
        'stock',
        'thumbnail_path',
        'image_paths',
        'sold_count',
        'search_count',
        'is_active',
    ];

    protected $casts = [
        'specifications' => 'array',
        'image_paths' => 'array',
        'unit_price' => 'decimal:2',
        'expected_profit' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'offer_value' => 'decimal:2',
        'final_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            $product->selling_price = $product->unit_price + $product->expected_profit + $product->delivery_charge;
            $product->final_price = max(0, $product->selling_price - $product->offer_value);
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
