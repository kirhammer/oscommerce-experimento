<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use App\Support\ListOptions;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * HTTP boundary of the catalog: translates requests into service calls and
 * serializes results as JSON resources. No business logic and no data
 * access happen here.
 */
class CatalogController extends Controller
{
    public function __construct(
        private readonly ProductService $products,
    ) {
    }

    /** R1 — list the active products of a category. */
    public function categoryProducts(Request $request, int $id): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'sort' => 'sometimes|string|in:name,model,price,quantity,weight,manufacturer',
            'order' => 'sometimes|string|in:asc,desc',
            'manufacturer' => 'sometimes|integer|min:1',
            'page' => 'sometimes|integer|min:1',
        ]);

        $options = new ListOptions(
            sort: $validated['sort'] ?? 'name',
            order: $validated['order'] ?? 'asc',
            manufacturerId: isset($validated['manufacturer']) ? (int) $validated['manufacturer'] : null,
        );

        return ProductResource::collection($this->products->listByCategory($id, $options));
    }

    /** R2 — product detail by id; 404 when missing or inactive. */
    public function show(int $id): ProductDetailResource
    {
        $product = $this->products->getById($id);

        abort_if($product === null, 404, 'Product not found');

        return new ProductDetailResource($product);
    }
}
