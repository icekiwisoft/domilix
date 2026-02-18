<?php
/**
 * Script de vérification de la structure de la table announcers
 * 
 * Usage: php check_announcer_table.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== Vérification de la table announcers ===\n\n";

try {
    // Vérifier si la table existe
    if (!Schema::hasTable('announcers')) {
        echo "❌ La table 'announcers' n'existe pas!\n";
        exit(1);
    }
    
    echo "✅ La table 'announcers' existe\n\n";
    
    // Lister toutes les colonnes
    $columns = Schema::getColumnListing('announcers');
    echo "Colonnes présentes:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    echo "\n";
    
    // Vérifier les colonnes requises
    $requiredColumns = ['bio', 'contact', 'avatar', 'presentation'];
    $missingColumns = [];
    
    foreach ($requiredColumns as $column) {
        if (Schema::hasColumn('announcers', $column)) {
            echo "✅ Colonne '$column' existe\n";
        } else {
            echo "❌ Colonne '$column' manquante\n";
            $missingColumns[] = $column;
        }
    }
    
    if (!empty($missingColumns)) {
        echo "\n⚠️  Colonnes manquantes: " . implode(', ', $missingColumns) . "\n";
        echo "\nPour ajouter les colonnes manquantes, exécutez:\n";
        echo "php artisan migrate\n";
        echo "\nOu exécutez le SQL suivant:\n";
        echo "ALTER TABLE `announcers`\n";
        if (in_array('bio', $missingColumns)) {
            echo "ADD COLUMN `bio` TEXT NULL,\n";
        }
        if (in_array('contact', $missingColumns)) {
            echo "ADD COLUMN `contact` VARCHAR(255) NULL;\n";
        }
    } else {
        echo "\n✅ Toutes les colonnes requises sont présentes!\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
