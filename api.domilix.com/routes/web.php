<?php
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\HomeController;

Route::get("/about", [HomeController::class, "index"]);
