<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Read-only mapping of the legacy osCommerce `specials` (offers) table. */
class Special extends Model
{
    protected $table = 'specials';

    protected $primaryKey = 'specials_id';

    public $timestamps = false;
}
