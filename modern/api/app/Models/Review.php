<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Read-only mapping of the legacy osCommerce `reviews` table. */
class Review extends Model
{
    protected $table = 'reviews';

    protected $primaryKey = 'reviews_id';

    public $timestamps = false;

    /** Review text for the configured catalog language. */
    public function description(): HasOne
    {
        return $this->hasOne(ReviewDescription::class, 'reviews_id', 'reviews_id')
            ->where('languages_id', config('catalog.language_id'));
    }
}
