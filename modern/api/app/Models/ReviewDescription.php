<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Legacy `reviews_description` table (composite key reviews_id +
 * languages_id — note the legacy plural column name); read only through
 * language-constrained relations.
 */
class ReviewDescription extends Model
{
    protected $table = 'reviews_description';

    protected $primaryKey = 'reviews_id';

    public $incrementing = false;

    public $timestamps = false;
}
