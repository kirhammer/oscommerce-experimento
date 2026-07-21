<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Services\CurrencyService;
use App\Services\ProductService;
use App\Support\ListOptions;
use Illuminate\Http\JsonResponse;
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
        private readonly CurrencyService $currencies,
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
            'currency' => 'sometimes|string|size:3',
        ]);

        $currency = $this->currencies->resolve($validated['currency'] ?? null);
        $request->attributes->set('catalog_currency', $currency);

        $options = new ListOptions(
            sort: $validated['sort'] ?? 'name',
            order: $validated['order'] ?? 'asc',
            manufacturerId: isset($validated['manufacturer']) ? (int) $validated['manufacturer'] : null,
        );

        return ProductResource::collection($this->products->listByCategory($id, $options))
            ->additional(['currency' => $currency->toPayload()]);
    }

    /** R2 — product detail by id; 404 when missing or inactive. */
    public function show(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'currency' => 'sometimes|string|size:3',
        ]);

        $currency = $this->currencies->resolve($validated['currency'] ?? null);
        $request->attributes->set('catalog_currency', $currency);

        $product = $this->products->getById($id);

        abort_if($product === null, 404, 'Product not found');

        return (new ProductDetailResource($product))
            ->additional(['currency' => $currency->toPayload()])
            ->response();
    }

    /** Approved reviews of a product; 404 when the product is missing or inactive. */
    public function reviews(int $id): AnonymousResourceCollection
    {
        $reviews = $this->products->reviewsFor($id);

        abort_if($reviews === null, 404, 'Product not found');

        return ReviewResource::collection($reviews);
    }

    /** Store currencies available for price display. */
    public function currencies(): JsonResponse
    {
        return response()->json([
            'data' => $this->currencies->list()->map->toPayload()->values(),
        ]);
    }
}
