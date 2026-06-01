<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function __invoke(Request $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        return response()->json([
            'total_products' => Product::count(),
            'total_sold' => Product::sum('sold_count'),
            'total_searches' => Product::sum('search_count'),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'total_due' => Order::sum('due_amount'),
        ]);
    }
}
