<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Listing representation: every piece of product information the legacy
 * category listing can display (name, model, image, base/special/final
 * price, quantity, weight, manufacturer).
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $special = $this->special;

        return [
            'id' => $this->products_id,
            'name' => $this->description?->products_name,
            'model' => $this->products_model,
            'image' => $this->products_image,
            'price' => (float) $this->products_price,
            'special_price' => $special !== null ? (float) $special->specials_new_products_price : null,
            'final_price' => $this->finalPrice(),
            'tax_class_id' => (int) $this->products_tax_class_id,
            'quantity' => (int) $this->products_quantity,
            'weight' => (float) $this->products_weight,
            'manufacturer' => $this->manufacturer !== null ? [
                'id' => $this->manufacturer->manufacturers_id,
                'name' => $this->manufacturer->manufacturers_name,
            ] : null,
        ];
    }
}
