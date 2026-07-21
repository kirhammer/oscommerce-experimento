<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Legacy `products_options_values` table (composite key
 * products_options_values_id + language_id); read only through
 * language-constrained relations.
 */
class ProductOptionValue extends Model
{
    protected $table = 'products_options_values';

    protected $primaryKey = 'products_options_values_id';

    public $incrementing = false;

    public $timestamps = false;
}
