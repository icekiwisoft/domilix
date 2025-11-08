<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CategoryController extends Controller
{


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $validated = $request->validate([
            'search' => 'max:255',
            'type' => 'nullable|in:"furniture","house"',
        ]);

        $query = Category::query();

        if ($request->has('search')) {
            $query->where(function (Builder $query) {
                $query->where('name', 'like', '%' . request('search') . '%');
            });
        }

        // Filter by item type (furniture or real estate)
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('orderBy')) {
            $query->orderBy($request->orderBy);
        }
        $categories = $query->paginate(20);

        return CategoryResource::collection($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {

        $category = Category::create($request->validated());
        return new CategoryResource($category);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $Category)
    {
        return new CategoryResource($Category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return new CategoryResource($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(null, 304);
    }
}
