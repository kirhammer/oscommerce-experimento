<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepositoryInterface;
use App\Support\ListOptions;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Catalog business logic. Replaces the legacy global tep_* functions with an
 * injectable service that depends only on the repository abstraction.
 */
class ProductService
{
    public function __construct(
        private readonly ProductRepositoryInterface $products,
    ) {
    }

    public function listByCategory(int $categoryId, ListOptions $options): LengthAwarePaginator
    {
        return $this->products->findActiveByCategory($categoryId, $options);
    }

    public function getById(int $productId): ?Product
    {
        return $this->products->findActiveById($productId);
    }

    /** Approved reviews of an active product; null when the product is missing/inactive. */
    public function reviewsFor(int $productId): ?LengthAwarePaginator
    {
        if ($this->products->findActiveById($productId) === null) {
            return null;
        }

        return $this->products->findApprovedReviews($productId);
    }
}
