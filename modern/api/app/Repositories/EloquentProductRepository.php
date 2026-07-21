<?php

namespace App\Repositories;

use App\Models\Product;
use App\Support\ListOptions;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;

/**
 * Eloquent implementation over the legacy osCommerce tables. Every query is
 * built through the query builder, so all values travel as PDO bindings —
 * no string-concatenated SQL.
 */
class EloquentProductRepository implements ProductRepositoryInterface
{
    /**
     * Sortable keys exposed by the API mapped to the columns the legacy
     * listing sorts by (name/model/manufacturer come from joined tables;
     * price sorts by the special-aware final price).
     */
    private const SORT_COLUMNS = [
        'name' => 'products_description.products_name',
        'model' => 'products.products_model',
        'price' => 'final_price',
        'quantity' => 'products.products_quantity',
        'weight' => 'products.products_weight',
        'manufacturer' => 'manufacturers.manufacturers_name',
    ];

    public function findActiveByCategory(int $categoryId, ListOptions $options): LengthAwarePaginator
    {
        $query = Product::query()
            ->active()
            ->whereHas('categories', fn (Builder $q) => $q->where('categories.categories_id', $categoryId))
            ->leftJoin('specials', function (JoinClause $join) {
                $join->on('specials.products_id', '=', 'products.products_id')
                    ->where('specials.status', 1);
            })
            ->leftJoin('products_description', function (JoinClause $join) {
                $join->on('products_description.products_id', '=', 'products.products_id')
                    ->where('products_description.language_id', config('catalog.language_id'));
            })
            ->leftJoin('manufacturers', 'manufacturers.manufacturers_id', '=', 'products.manufacturers_id')
            ->select('products.*')
            ->selectRaw(
                'IF(specials.status = 1, specials.specials_new_products_price, products.products_price) as final_price'
            )
            ->with(['description', 'special', 'manufacturer']);

        if ($options->manufacturerId !== null) {
            $query->where('products.manufacturers_id', $options->manufacturerId);
        }

        $query->orderBy(self::SORT_COLUMNS[$options->sort], $options->order)
            ->orderBy('products.products_id');

        return $query->paginate(config('catalog.page_size'))->withQueryString();
    }

    public function findActiveById(int $productId): ?Product
    {
        return Product::query()
            ->active()
            ->with([
                'description',
                'special',
                'images',
                'manufacturer',
                'productAttributes.option',
                'productAttributes.value',
            ])
            ->withCount(['reviews' => fn (Builder $q) => $q->where('reviews_status', 1)])
            ->find($productId);
    }
}
