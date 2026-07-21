<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Read-only mapping of the legacy osCommerce `currencies` table (exchange
 * rate and formatting rules per currency).
 */
class Currency extends Model
{
    protected $table = 'currencies';

    protected $primaryKey = 'currencies_id';

    public $timestamps = false;

    /** Converts a base (default-currency) amount into this currency. */
    public function convert(float $amount): float
    {
        return round($amount * (float) $this->value, (int) $this->decimal_places);
    }

    /** Formatting metadata exposed to API clients. */
    public function toPayload(): array
    {
        return [
            'code' => $this->code,
            'title' => $this->title,
            'symbol_left' => $this->symbol_left,
            'symbol_right' => $this->symbol_right,
            'decimal_point' => $this->decimal_point,
            'thousands_point' => $this->thousands_point,
            'decimal_places' => (int) $this->decimal_places,
            'value' => (float) $this->value,
        ];
    }
}
