<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSetting extends Model
{
    protected $fillable = [
        'hero_panel',
        'sliding_text',
        'top_header_text',
        'offer_panel',
        'contact_info',
        'payment_info',
        'terms_content',
        'privacy_content',
        'promo_enabled',
    ];

    protected $casts = [
        'hero_panel' => 'array',
        'sliding_text' => 'array',
        'offer_panel' => 'array',
        'contact_info' => 'array',
        'payment_info' => 'array',
        'promo_enabled' => 'boolean',
    ];
}
