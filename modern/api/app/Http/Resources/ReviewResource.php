<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** One approved product review, matching the info the legacy reviews page shows. */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->reviews_id,
            'author' => $this->customers_name,
            'rating' => (int) $this->reviews_rating,
            'text' => $this->description?->reviews_text,
            'date_added' => $this->date_added,
        ];
    }
}
