<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\HomepageSetting;
use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '01700000001',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('admin');

        $customer = User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Demo Customer',
                'phone' => '01700000002',
                'password' => Hash::make('Password1!'),
            ]
        );
        $customer->assignRole('customer');

        Address::updateOrCreate(
            ['user_id' => $customer->id, 'label' => 'Home'],
            [
                'full_name' => 'Demo Customer',
                'phone' => '01700000002',
                'address' => 'House 24, Road 7, Dhanmondi',
                'city' => 'Dhaka',
                'postal_code' => '1209',
                'country' => 'Bangladesh',
                'is_default' => true,
            ]
        );

        $categories = $this->seedCategories();
        $products = $this->seedProducts($categories);
        $this->seedHomepage();
        $this->seedPromos($admin);
        $this->seedCart($customer, $products);
        $this->seedOrders($customer, $products);
    }

    private function seedCategories(): array
    {
        $tree = [
            'Electronics' => [
                'description' => 'Phones, audio, gadgets, and everyday electronics.',
                'children' => ['Smartphones', 'Audio', 'Accessories'],
            ],
            'Fashion' => [
                'description' => 'Clothing and lifestyle essentials.',
                'children' => ['Men', 'Women', 'Bags'],
            ],
            'Home & Living' => [
                'description' => 'Useful products for a better home.',
                'children' => ['Kitchen', 'Decor', 'Cleaning'],
            ],
            'Beauty & Care' => [
                'description' => 'Personal care, skincare, and grooming items.',
                'children' => ['Skincare', 'Hair Care', 'Fragrance'],
            ],
        ];

        $categories = [];
        foreach ($tree as $name => $data) {
            $parent = Category::updateOrCreate(
                ['name' => $name],
                [
                    'parent_id' => null,
                    'slug' => Str::slug($name),
                    'description' => $data['description'],
                    'is_active' => true,
                ]
            );
            $categories[$name] = $parent;

            foreach ($data['children'] as $childName) {
                $child = Category::updateOrCreate(
                    ['name' => $childName],
                    [
                        'parent_id' => $parent->id,
                        'slug' => Str::slug($childName),
                        'description' => "Shop {$childName} products.",
                        'is_active' => true,
                    ]
                );
                $categories[$childName] = $child;
            }
        }

        return $categories;
    }

    private function seedProducts(array $categories): array
    {
        $items = [
            ['Smartphones', 'MM-1001', 'Nova X1 Smartphone', 'NovaTech', 18500, 2500, 80, 1000, 22, '6.6 inch display, 8GB RAM, 128GB storage, 50MP camera.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'],
            ['Smartphones', 'MM-1002', 'Aero Mini Smartphone', 'Aero Mobile', 12900, 1800, 80, 500, 18, 'Compact Android phone with long battery life and dual SIM support.', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80'],
            ['Audio', 'MM-2001', 'Pulse Wireless Earbuds', 'Pulse Audio', 1450, 450, 40, 150, 60, 'Bluetooth earbuds with clear calls, deep bass, and charging case.', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'],
            ['Audio', 'MM-2002', 'Studio Max Headphones', 'SoundPeak', 3200, 700, 60, 300, 35, 'Over-ear wireless headphones with soft cushions and rich stereo sound.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
            ['Accessories', 'MM-3001', 'FastCharge 20W Adapter', 'Voltix', 650, 250, 30, 50, 85, 'Compact USB-C fast charger for phones, earbuds, and tablets.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80'],
            ['Accessories', 'MM-3002', 'Braided USB-C Cable', 'Voltix', 220, 100, 20, 20, 120, 'Durable 1 meter braided cable for charging and data transfer.', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80'],
            ['Men', 'MM-4001', 'Classic Cotton Polo', 'Urban Thread', 780, 220, 60, 100, 42, 'Breathable cotton polo shirt for daily casual wear.', 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80'],
            ['Women', 'MM-4002', 'Everyday Kurti Set', 'Nila Fashion', 1250, 350, 70, 150, 28, 'Comfortable printed kurti set with soft fabric and modern fit.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'],
            ['Bags', 'MM-4003', 'City Travel Backpack', 'CarryPro', 1750, 500, 80, 200, 24, 'Water-resistant backpack with laptop compartment and organizer pockets.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],
            ['Kitchen', 'MM-5001', 'Stainless Steel Bottle', 'HomeEase', 520, 180, 40, 40, 55, 'Leak-proof insulated bottle for hot and cold drinks.', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],
            ['Decor', 'MM-5002', 'Minimal Desk Lamp', 'HomeEase', 1150, 350, 70, 100, 20, 'Adjustable LED desk lamp with warm and cool light modes.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'],
            ['Cleaning', 'MM-5003', 'Microfiber Cleaning Set', 'CleanMate', 360, 140, 30, 30, 90, 'Reusable microfiber cloth set for kitchen, glass, and electronics.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'],
            ['Skincare', 'MM-6001', 'Hydra Glow Face Serum', 'GlowCare', 890, 310, 40, 90, 45, 'Lightweight serum for hydration and daily skin glow.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80'],
            ['Hair Care', 'MM-6002', 'Argan Hair Oil', 'GlowCare', 620, 230, 40, 50, 38, 'Nourishing hair oil for smoother, shinier hair.', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
            ['Fragrance', 'MM-6003', 'Fresh Oud Perfume', 'Aroma House', 1450, 500, 50, 150, 30, 'Long-lasting fragrance with fresh, woody, and warm notes.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80'],
        ];

        $products = [];
        foreach ($items as [$categoryName, $sku, $title, $company, $unitPrice, $profit, $delivery, $offer, $stock, $description, $image]) {
            $product = Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $categories[$categoryName]->id,
                    'title' => $title,
                    'slug' => Str::slug($title),
                    'company_name' => $company,
                    'description' => $description,
                    'specifications' => [
                        ['title' => 'Warranty', 'details' => '7 days replacement support'],
                        ['title' => 'Delivery', 'details' => 'Inside Dhaka 1-2 days, outside Dhaka 3-5 days'],
                        ['title' => 'Condition', 'details' => 'Brand new'],
                    ],
                    'unit_price' => $unitPrice,
                    'expected_profit' => $profit,
                    'delivery_charge' => $delivery,
                    'offer_value' => $offer,
                    'stock' => $stock,
                    'thumbnail_path' => $image,
                    'image_paths' => [$image],
                    'sold_count' => fake()->numberBetween(2, 80),
                    'search_count' => fake()->numberBetween(10, 250),
                    'is_active' => true,
                ]
            );
            $products[$sku] = $product;
        }

        return $products;
    }

    private function seedHomepage(): void
    {
        HomepageSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'hero_panel' => [
                    ['imageUrl' => 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1600&q=80', 'altText' => 'Shop new arrivals'],
                    ['imageUrl' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80', 'altText' => 'Fast online shopping'],
                    ['imageUrl' => 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80', 'altText' => 'Daily deals'],
                ],
                'sliding_text' => [
                    ['text' => 'Free delivery inside Dhaka on selected campaigns'],
                    ['text' => 'Cash on delivery available across Bangladesh'],
                    ['text' => 'Use code WELCOME10 for your first order'],
                ],
                'top_header_text' => '24/7 support available - call 01700000000',
                'offer_panel' => [
                    'isEnabled' => true,
                    'title' => 'New Client Demo Sale',
                    'description' => 'Fresh products, promo codes, checkout, COD, and admin order management are ready to test.',
                ],
                'contact_info' => [
                    'email' => 'support@magicmart.test',
                    'contactNumber' => '+8801700000000',
                    'location' => 'Dhanmondi, Dhaka, Bangladesh',
                    'socialLinks' => [
                        ['platform' => 'facebook', 'url' => 'https://facebook.com/magicmart'],
                        ['platform' => 'instagram', 'url' => 'https://instagram.com/magicmart'],
                        ['platform' => 'youtube', 'url' => 'https://youtube.com/@magicmart'],
                    ],
                    'socialmediaContact' => [
                        ['platform' => 'whatsapp', 'value' => '+8801700000000'],
                        ['platform' => 'messenger', 'value' => 'magicmart'],
                    ],
                ],
                'payment_info' => [
                    'method' => [
                        ['getway' => 'bkash', 'getwaynumber' => '01711111111', 'imageUrl' => ''],
                        ['getway' => 'nagad', 'getwaynumber' => '01722222222', 'imageUrl' => ''],
                        ['getway' => 'rocket', 'getwaynumber' => '01733333333', 'imageUrl' => ''],
                        ['getway' => 'bank_transfer', 'getwaynumber' => 'MagicMart Demo Bank A/C 123456789', 'imageUrl' => ''],
                    ],
                ],
                'terms_content' => 'Orders are subject to stock availability. Customers must provide accurate delivery information. Returned items must be unused and in original packaging.',
                'privacy_content' => 'We use customer information only to process orders, provide support, and improve the shopping experience.',
                'promo_enabled' => true,
            ]
        );
    }

    private function seedPromos(User $admin): void
    {
        $promos = [
            ['WELCOME10', 'percentage', 10, 500, 200, 8],
            ['SAVE100', 'fixed', 100, 1000, 150, 5],
            ['FREESHIP', 'fixed', 60, 700, 100, 3],
        ];

        foreach ($promos as [$code, $type, $value, $minimum, $limit, $months]) {
            PromoCode::updateOrCreate(
                ['code' => $code],
                [
                    'created_by' => $admin->id,
                    'discount_type' => $type,
                    'discount_value' => $value,
                    'minimum_order_amount' => $minimum,
                    'usage_limit' => $limit,
                    'used_count' => 0,
                    'expires_at' => now()->addMonths($months),
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedCart(User $customer, array $products): void
    {
        $cart = Cart::firstOrCreate(['user_id' => $customer->id, 'status' => 'active']);
        foreach (['MM-2001' => 2, 'MM-5001' => 1] as $sku => $quantity) {
            $product = $products[$sku];
            CartItem::updateOrCreate(
                ['cart_id' => $cart->id, 'product_id' => $product->id],
                [
                    'quantity' => $quantity,
                    'unit_price' => $product->final_price,
                    'total_price' => $product->final_price * $quantity,
                ]
            );
        }
        $cart->recalculate();
    }

    private function seedOrders(User $customer, array $products): void
    {
        $samples = [
            ['ORD-DEMO-1001', 'delivered', 'paid', 'bkash', 0, ['MM-1001' => 1, 'MM-3002' => 2], now()->subDays(12), now()->subDays(9)],
            ['ORD-DEMO-1002', 'processing', 'partial', 'cod', 500, ['MM-4003' => 1, 'MM-6001' => 1], now()->subDays(2), null],
            ['ORD-DEMO-1003', 'pending', 'cod', 'cod', 0, ['MM-2002' => 1], now()->subHours(8), null],
        ];

        foreach ($samples as [$number, $status, $paymentStatus, $method, $paid, $lines, $createdAt, $deliveredAt]) {
            if (Order::where('order_number', $number)->exists()) {
                continue;
            }

            $subtotal = 0;
            $unitTotal = 0;
            $profitTotal = 0;
            $items = [];

            foreach ($lines as $sku => $quantity) {
                $product = $products[$sku];
                $lineTotal = $product->final_price * $quantity;
                $subtotal += $lineTotal;
                $unitTotal += $product->unit_price * $quantity;
                $profitTotal += $product->expected_profit * $quantity;
                $items[] = [
                    'product_id' => $product->id,
                    'title' => $product->title,
                    'thumbnail_path' => $product->thumbnail_path,
                    'quantity' => $quantity,
                    'unit_price' => $product->unit_price,
                    'expected_profit' => $product->expected_profit,
                    'delivery_charge' => $product->delivery_charge,
                    'selling_price' => $product->selling_price,
                    'offer_value' => $product->offer_value,
                    'final_price' => $product->final_price,
                    'total_price' => $lineTotal,
                ];
            }

            $delivery = 60;
            $discount = $number === 'ORD-DEMO-1001' ? 100 : 0;
            $total = max(0, $subtotal + $delivery - $discount);
            $paidAmount = $paid ?: ($paymentStatus === 'paid' ? $total : 0);

            $order = Order::create([
                'user_id' => $customer->id,
                'order_number' => $number,
                'shipping_address' => [
                    'full_name' => 'Demo Customer',
                    'phone' => '01700000002',
                    'address' => 'House 24, Road 7, Dhanmondi',
                    'city' => 'Dhaka',
                    'postal_code' => '1209',
                    'country' => 'Bangladesh',
                ],
                'subtotal' => $subtotal,
                'delivery_charge' => $delivery,
                'discount_amount' => $discount,
                'discount_type' => $discount > 0 ? 'fixed' : null,
                'applied_promo' => $discount > 0 ? 'SAVE100' : null,
                'total_amount' => $total,
                'paid_amount' => $paidAmount,
                'due_amount' => max(0, $total - $paidAmount),
                'total_unit_price' => $unitTotal,
                'total_profit' => $profitTotal,
                'net_profit' => $profitTotal - $discount,
                'payment_method' => $method,
                'payment_status' => $paymentStatus,
                'payment_details' => ['transaction_id' => $paymentStatus === 'paid' ? 'TXN-DEMO-'.$number : null],
                'status' => $status,
                'tracking_number' => $status !== 'pending' ? 'TRK-'.$number : null,
                'estimated_delivery_at' => $status !== 'delivered' ? now()->addDays(3) : null,
                'delivered_at' => $deliveredAt,
                'notes' => 'Demo seeded order',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $order->items()->createMany($items);
        }
    }
}
