<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;


class StoreAdRequest extends FormRequest
{

    protected $stopOnFirstFailure = true;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the logged-in user has the 'announcer' role
        return auth()->check() && auth()->user()->announcer != null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|string|in:realestate,furniture', // Ensure it's  realestate or furniture
            'price' => 'required|numeric|min:0', // Positive real
            'ad_type' => 'required|string|in:location,sale', // Ensure it's 0 or 1
            'category_id' => 'required|string', // Cannot be empty

            // Conditional rules based on type using required_if
            'bedroom' => 'required_if:type,realestate|integer|min:0',
            'mainroom' => 'required_if:type,realestate|integer|min:0',
            'localization' => 'required_if:type,realestate|array|size:2',
            'toilet' => 'required_if:type,realestate|integer|min:0',
            'kitchen' => 'integer|min:0',
            'garden' => 'boolean',
            'caution' => 'nullable|integer',
            'gate' => 'required_if:type,realestate|boolean',
            'pool' => 'required_if:type,realestate|boolean',
            'garage' => 'required_if:type,realestate|boolean',
            'furnitured' => 'required_if:type,realestate|boolean',

            // Furniture information
            'height' => 'required_if:type,furniture|integer|min:0',
            'width' => 'required_if:type,furniture|integer|min:0',
            'length' => 'required_if:type,furniture|integer|min:0',
            'weight' => 'required_if:type,furniture|integer|min:0',

            'period' => 'nullable|string', // between month (M), day(d), and year (y)
            'devise' => 'nullable|string',

            // Address fields
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',

            // Additional data constraints
            'description' => 'nullable|string|max:255', // Set text length limit (if applicable)

            // Media constraints
            'medias' => 'nullable|array', // Array for media files
            'medias.*' => 'image|mimes:jpg,jpeg,png|max:2048', // Each media file must be an image and not exceed 2MB
            'filesid' => 'nullable|array', // Array for media IDs
            'filesid.*' => 'integer|distinct' // Each ID should be unique if applicable
        ];
    }


    /**
     * Custom validation logic for additional conditions.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                // Check if the combined count of medias and mediasId exceeds 5
                $totalMediaCount = count($this->file("medias", [])) + count($this->input("filesid", []));
                if ($totalMediaCount > 5) {
                    $validator->errors()->add(
                        'medias',
                        'The combined total of medias and mediasId must not exceed 5.'
                    );
                }
                if ($totalMediaCount == 0) {
                    $validator->errors()->add(
                        'medias',
                        'At least one media file is required.'
                    );
                }
            }
        ];
    }
}
