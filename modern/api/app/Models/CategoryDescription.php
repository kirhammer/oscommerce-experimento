<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Legacy `categories_description` table (composite key categories_id +
 * language_id); read only through language-constrained relations.
 */
class CategoryDescription extends Model
{
    protected $table = 'categories_description';

    protected $primaryKey = 'categories_id';

    public $incrementing = false;

    public $timestamps = false;
}
