# Fix FormData avec Laravel PUT

## Problème
Laravel ne parse pas automatiquement les données `multipart/form-data` pour les requêtes PUT/PATCH. Seules les requêtes POST sont correctement parsées.

## Solution implémentée

### 1. Frontend - Ajout de `_method`
Dans `ProfileDialog.tsx`, on ajoute `_method=PUT` au FormData :
```typescript
const formData = new FormData();
formData.append('_method', 'PUT'); // Laravel method spoofing
formData.append('company_name', announcerForm.company_name);
// ... autres champs
```

### 2. Frontend - Utilisation de POST
Dans `profileApi.ts`, on utilise POST au lieu de PUT :
```typescript
const response = await api.post('/auth/announcer-profile', data, {
  headers: data instanceof FormData 
    ? { 'Content-Type': 'multipart/form-data' } 
    : undefined,
});
```

### 3. Backend - Route POST supplémentaire
Dans `routes/api.php`, on ajoute une route POST qui pointe vers la même méthode :
```php
Route::put('announcer-profile', [AuthController::class, 'updateAnnouncerProfile']);
Route::post('announcer-profile', [AuthController::class, 'updateAnnouncerProfile']); // Support FormData
```

### 4. Backend - Logs de debug
Dans `AuthController.php`, ajout de logs pour faciliter le debug :
```php
\Log::info('Update Announcer Profile Request', [
    'all_data' => $request->all(),
    'has_file' => $request->hasFile('avatar'),
    'content_type' => $request->header('Content-Type')
]);
```

## Comment ça fonctionne

1. Le frontend envoie une requête **POST** avec `_method=PUT` dans le FormData
2. Laravel détecte `_method=PUT` et traite la requête comme un PUT
3. Les données multipart/form-data sont correctement parsées
4. Le fichier avatar est accessible via `$request->hasFile('avatar')`

## Vérification

Pour vérifier que ça fonctionne, consultez les logs Laravel :
```bash
tail -f storage/logs/laravel.log
```

Vous devriez voir :
```
Update Announcer Profile Request
{
  "all_data": {
    "_method": "PUT",
    "company_name": "...",
    "bio": "...",
    "professional_phone": "...",
    "avatar": "[uploaded file]"
  },
  "has_file": true,
  "content_type": "multipart/form-data; boundary=..."
}
```

## Alternative

Si vous préférez, vous pouvez aussi :
1. Garder PUT côté frontend
2. Ajouter un middleware pour parser FormData en PUT
3. Ou utiliser uniquement POST sans `_method`

La solution actuelle est la plus simple et la plus compatible.
