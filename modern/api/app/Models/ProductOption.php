<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Legacy `products_options` table (composite key products_options_id +
 * language_id); read only through language-constrained relations.
 */
class ProductOption extends Model
{
    protected $table = 'products_options';

    protected $primaryKey = 'products_options_id';

    public $incrementing = false;

    public $timestamps = false;
}
