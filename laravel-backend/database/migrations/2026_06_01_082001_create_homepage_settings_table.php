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
        Schema::create('homepage_settings', function (Blueprint $table) {
            $table->id();
            $table->json('hero_panel')->nullable();
            $table->json('sliding_text')->nullable();
            $table->string('top_header_text')->nullable();
            $table->json('offer_panel')->nullable();
            $table->json('contact_info')->nullable();
            $table->json('payment_info')->nullable();
            $table->longText('terms_content')->nullable();
            $table->longText('privacy_content')->nullable();
            $table->boolean('promo_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_settings');
    }
};
