# Système de Notifications

## Vue d'ensemble
Système complet de notifications en temps réel pour informer les utilisateurs des événements importants.

## Backend

### Migration
```bash
php artisan migrate
```

Crée la table `notifications` avec :
- `user_id` : Utilisateur destinataire
- `type` : Type de notification (info, success, warning, error)
- `title` : Titre de la notification
- `message` : Message détaillé
- `link` : URL optionnelle
- `read` : Statut de lecture
- `read_at` : Date de lecture

### Routes API
```
GET    /notifications              - Liste des notifications
GET    /notifications/unread-count - Nombre de non lues
POST   /notifications/{id}/read    - Marquer comme lue
POST   /notifications/mark-all-read - Tout marquer comme lu
DELETE /notifications/{id}          - Supprimer
DELETE /notifications/read/all      - Supprimer toutes les lues
```

### Créer une notification (exemple)
```php
use App\Models\Notification;

Notification::create([
    'user_id' => $user->id,
    'type' => 'success',
    'title' => 'Bienvenue !',
    'message' => 'Votre compte a été créé avec succès',
    'link' => '/profile',
]);
```

## Frontend

### Composants
1. **NotificationPopup** : Popup des notifications
2. **Nav2** : Icône cloche avec badge

### Fonctionnalités
- Badge avec nombre de notifications non lues
- Popup avec liste des notifications
- Marquer comme lu (individuellement ou toutes)
- Supprimer les notifications
- Navigation vers les liens
- Polling automatique toutes les 30 secondes
- Icônes selon le type (success, error, warning, info)

### Utilisation
Le système est automatiquement intégré dans la navigation. Les utilisateurs connectés voient :
- Icône cloche dans le header
- Badge orange avec le nombre de notifications non lues
- Popup au clic avec toutes les notifications

## Types de notifications

### Success (Vert)
```php
'type' => 'success',
'title' => 'Action réussie',
'message' => 'Votre profil a été mis à jour'
```

### Error (Rouge)
```php
'type' => 'error',
'title' => 'Erreur',
'message' => 'Une erreur est survenue'
```

### Warning (Orange)
```php
'type' => 'warning',
'title' => 'Attention',
'message' => 'Votre abonnement expire bientôt'
```

### Info (Bleu)
```php
'type' => 'info',
'title' => 'Information',
'message' => 'Nouvelle fonctionnalité disponible'
```

## Exemples d'utilisation

### Notification après inscription
```php
// Dans AuthController::register()
Notification::create([
    'user_id' => $user->id,
    'type' => 'success',
    'title' => 'Bienvenue sur Domilix !',
    'message' => 'Votre compte a été créé avec succès. Explorez nos annonces.',
    'link' => '/houses',
]);
```

### Notification d'abonnement
```php
// Après achat d'abonnement
Notification::create([
    'user_id' => $user->id,
    'type' => 'success',
    'title' => 'Abonnement activé',
    'message' => "Vous avez {$credits} crédits disponibles",
    'link' => '/subscriptions',
]);
```

### Notification d'expiration
```php
// Cron job quotidien
Notification::create([
    'user_id' => $user->id,
    'type' => 'warning',
    'title' => 'Abonnement bientôt expiré',
    'message' => 'Votre abonnement expire dans 3 jours',
    'link' => '/subscriptions',
]);
```

## Personnalisation

### Couleurs
Modifiez dans `NotificationPopup.tsx` :
```typescript
const getBgColor = (type, read) => {
  // Personnalisez les couleurs de fond
}
```

### Polling
Changez l'intervalle dans `Nav2.tsx` :
```typescript
const interval = setInterval(loadUnreadCount, 30000); // 30 secondes
```

## Sécurité
- Toutes les routes sont protégées par `auth:api`
- Les utilisateurs ne peuvent voir que leurs propres notifications
- Validation des données côté backend

## Performance
- Index sur `user_id` et `read` pour requêtes rapides
- Pagination des notifications (20 par page)
- Polling léger (seulement le compteur)
