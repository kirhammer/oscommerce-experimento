<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Read-only mapping of the legacy osCommerce `categories` table. */
class Category extends Model
{
    protected $table = 'categories';

    protected $primaryKey = 'categories_id';

    public $timestamps = false;

    public function description(): HasOne
    {
        return $this->hasOne(CategoryDescription::class, 'categories_id', 'categories_id')
            ->where('language_id', config('catalog.language_id'));
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'products_to_categories',
            'categories_id',
            'products_id'
        );
    }
}
