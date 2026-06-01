<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromoCodeController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return PromoCode::latest()->paginate(20);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $this->validated($request);
        $data['code'] = Str::upper($data['code']);
        $data['created_by'] = $request->user()->id;

        return response()->json(PromoCode::create($data), 201);
    }

    public function show(Request $request, PromoCode $promo)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return $promo;
    }

    public function update(Request $request, PromoCode $promo)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $this->validated($request, $promo);
        if (isset($data['code'])) {
            $data['code'] = Str::upper($data['code']);
        }

        $promo->update($data);

        return $promo->fresh();
    }

    public function destroy(Request $request, PromoCode $promo)
    {
        abort_unless($request->user()->hasRole('admin'), 403);
        $promo->delete();

        return response()->noContent();
    }

    private function validated(Request $request, ?PromoCode $promoCode = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code,'.($promoCode?->id ?? 'NULL')],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['required', 'date', 'after:now'],
            'is_active' => ['boolean'],
        ]);
    }
}
