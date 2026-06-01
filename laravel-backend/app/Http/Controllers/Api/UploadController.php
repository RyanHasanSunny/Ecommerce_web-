<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UploadedImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return UploadedImage::latest()->paginate(30);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $file = $data['image'];
        $path = $file->store('products', 'public');

        $image = UploadedImage::create([
            'uploaded_by' => $request->user()->id,
            'disk' => 'public',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json([
            'image' => $image,
            'url' => Storage::disk('public')->url($path),
        ], 201);
    }

    public function destroy(Request $request, UploadedImage $uploadedImage)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        Storage::disk($uploadedImage->disk)->delete([$uploadedImage->path, $uploadedImage->thumbnail_path]);
        $uploadedImage->delete();

        return response()->noContent();
    }
}
