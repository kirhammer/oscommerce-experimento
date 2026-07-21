<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Legacy `products_attributes` table: one row per (product, option, value)
 * with the price adjustment the value adds to the base price.
 */
class ProductAttribute extends Model
{
    protected $table = 'products_attributes';

    protected $primaryKey = 'products_attributes_id';

    public $timestamps = false;

    public function option(): BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'options_id', 'products_options_id')
            ->where('products_options.language_id', config('catalog.language_id'));
    }

    public function value(): BelongsTo
    {
        return $this->belongsTo(ProductOptionValue::class, 'options_values_id', 'products_options_values_id')
            ->where('products_options_values.language_id', config('catalog.language_id'));
    }
}
