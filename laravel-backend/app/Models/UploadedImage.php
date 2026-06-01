<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadedImage extends Model
{
    protected $fillable = [
        'uploaded_by',
        'disk',
        'path',
        'thumbnail_path',
        'original_name',
        'mime_type',
        'size',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
