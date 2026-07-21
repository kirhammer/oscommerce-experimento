<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Read-only mapping of the legacy osCommerce `products_images` gallery table. */
class ProductImage extends Model
{
    protected $table = 'products_images';

    public $timestamps = false;
}
