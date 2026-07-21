<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Legacy `products_description` table. Its real primary key is composite
 * (products_id, language_id), which Eloquent does not support; the model is
 * only ever read through language-constrained relations, never saved.
 */
class ProductDescription extends Model
{
    protected $table = 'products_description';

    protected $primaryKey = 'products_id';

    public $incrementing = false;

    public $timestamps = false;
}
