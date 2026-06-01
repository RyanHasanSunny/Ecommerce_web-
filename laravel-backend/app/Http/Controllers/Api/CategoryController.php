<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::with('children')->whereNull('parent_id')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'parent_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        return response()->json(Category::create($data), 201);
    }

    public function show(Category $category)
    {
        return $category->load('parent', 'children', 'products');
    }

    public function update(Request $request, Category $category)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'parent_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:100', 'unique:categories,name,'.$category->id],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ]);

        if (($data['parent_id'] ?? null) === $category->id) {
            return response()->json(['message' => 'Category cannot be its own parent'], 422);
        }

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $category->fresh('parent', 'children');
    }

    public function destroy(Request $request, Category $category)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        if ($category->children()->exists() || $category->products()->exists()) {
            return response()->json(['message' => 'Category has child categories or products'], 422);
        }

        $category->delete();

        return response()->noContent();
    }
}
