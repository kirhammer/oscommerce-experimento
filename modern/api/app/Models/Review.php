<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Read-only mapping of the legacy osCommerce `reviews` table (used for counts). */
class Review extends Model
{
    protected $table = 'reviews';

    protected $primaryKey = 'reviews_id';

    public $timestamps = false;
}
