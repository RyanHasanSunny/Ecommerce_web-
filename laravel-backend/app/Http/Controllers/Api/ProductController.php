<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        return Product::with('category')
            ->when($request->query('category_id'), fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($request->query('search'), fn ($query, $search) => $query->where('title', 'like', "%{$search}%"))
            ->where('is_active', true)
            ->latest()
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['title']);
        $data['sku'] = $data['sku'] ?? now()->format('ym').str_pad((string) (Product::count() + 1), 4, '0', STR_PAD_LEFT);

        return response()->json(Product::create($data), 201);
    }

    public function show(Product $product)
    {
        $product->increment('search_count');

        return $product->load('category');
    }

    public function update(Request $request, Product $product)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $this->validated($request, $product);
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $product->update($data);

        return $product->fresh('category');
    }

    public function destroy(Request $request, Product $product)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $product->delete();

        return response()->noContent();
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        $required = $product ? 'sometimes' : 'required';

        return $request->validate([
            'category_id' => [$required, 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku,'.($product?->id ?? 'NULL')],
            'title' => [$required, 'string', 'max:200'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'description' => [$required, 'string', 'max:10000'],
            'specifications' => ['nullable', 'array'],
            'unit_price' => [$required, 'numeric', 'min:0'],
            'expected_profit' => [$required, 'numeric', 'min:0'],
            'delivery_charge' => ['nullable', 'numeric', 'min:0'],
            'offer_value' => ['nullable', 'numeric', 'min:0'],
            'stock' => [$required, 'integer', 'min:0'],
            'thumbnail_path' => ['nullable', 'string', 'max:500'],
            'image_paths' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);
    }
}
