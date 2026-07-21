<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Read-only mapping of the legacy osCommerce `products` table. The legacy
 * schema has no created_at/updated_at columns and uses `products_id` as key.
 */
class Product extends Model
{
    protected $table = 'products';

    protected $primaryKey = 'products_id';

    public $timestamps = false;

    /** Description row for the configured catalog language. */
    public function description(): HasOne
    {
        return $this->hasOne(ProductDescription::class, 'products_id', 'products_id')
            ->where('language_id', config('catalog.language_id'));
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'products_to_categories',
            'products_id',
            'categories_id'
        );
    }

    /** Active special offer, if any (mirrors the legacy IF(s.status, ...) join). */
    public function special(): HasOne
    {
        return $this->hasOne(Special::class, 'products_id', 'products_id')
            ->where('status', 1);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'products_id', 'products_id')
            ->orderBy('sort_order');
    }

    public function manufacturer(): BelongsTo
    {
        return $this->belongsTo(Manufacturer::class, 'manufacturers_id', 'manufacturers_id');
    }

    /** Named productAttributes to avoid clashing with Eloquent's internal $attributes. */
    public function productAttributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class, 'products_id', 'products_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'products_id', 'products_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('products.products_status', 1);
    }

    /** Effective selling price: the active special price when present. */
    public function finalPrice(): float
    {
        return $this->special !== null
            ? (float) $this->special->specials_new_products_price
            : (float) $this->products_price;
    }
}
