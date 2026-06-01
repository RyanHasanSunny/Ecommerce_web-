<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('sku')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('company_name')->nullable();
            $table->text('description');
            $table->json('specifications')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('expected_profit', 12, 2)->default(0);
            $table->decimal('delivery_charge', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2);
            $table->decimal('offer_value', 12, 2)->default(0);
            $table->decimal('final_price', 12, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->string('thumbnail_path')->nullable();
            $table->json('image_paths')->nullable();
            $table->unsignedInteger('sold_count')->default(0);
            $table->unsignedInteger('search_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
