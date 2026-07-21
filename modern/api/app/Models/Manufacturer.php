<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Read-only mapping of the legacy osCommerce `manufacturers` table. */
class Manufacturer extends Model
{
    protected $table = 'manufacturers';

    protected $primaryKey = 'manufacturers_id';

    public $timestamps = false;
}
