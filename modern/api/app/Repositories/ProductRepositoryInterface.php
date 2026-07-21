<?php

namespace App\Repositories;

use App\Models\Product;
use App\Support\ListOptions;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Data-access boundary for the catalog. Programming against this interface
 * lets the persistence implementation be replaced (modifiability tactic) and
 * enables unit testing of the service layer without a database.
 */
interface ProductRepositoryInterface
{
    /**
     * Active products of a category, paginated. Returns an empty page when
     * the category has no active products (or does not exist).
     */
    public function findActiveByCategory(int $categoryId, ListOptions $options): LengthAwarePaginator;

    /** An active product by id, or null when missing or inactive. */
    public function findActiveById(int $productId): ?Product;
}
