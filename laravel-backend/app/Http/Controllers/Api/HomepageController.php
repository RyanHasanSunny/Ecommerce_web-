<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageSetting;
use Illuminate\Http\Request;

class HomepageController extends Controller
{
    public function show()
    {
        return HomepageSetting::firstOrCreate([]);
    }

    public function update(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'hero_panel' => ['nullable', 'array'],
            'sliding_text' => ['nullable', 'array'],
            'top_header_text' => ['nullable', 'string', 'max:255'],
            'offer_panel' => ['nullable', 'array'],
            'contact_info' => ['nullable', 'array'],
            'payment_info' => ['nullable', 'array'],
            'terms_content' => ['nullable', 'string'],
            'privacy_content' => ['nullable', 'string'],
            'promo_enabled' => ['boolean'],
        ]);

        $setting = HomepageSetting::firstOrCreate([]);
        $setting->update($data);

        return $setting->fresh();
    }
}
