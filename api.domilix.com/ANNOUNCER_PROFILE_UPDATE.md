# Mise à jour du profil annonceur

## Problème
La mise à jour du profil annonceur retourne un message de succès mais les données ne sont pas sauvegardées.

## Cause
Les colonnes `bio` et `contact` n'existent pas encore dans la table `announcers` de la base de données.

## Solution

### Option 1 : Exécuter la migration (Recommandé)
```bash
cd api.domilix.com
php artisan migrate
```

### Option 2 : Exécuter le SQL manuellement
Si la migration ne fonctionne pas, exécutez le fichier SQL :
```bash
mysql -u votre_utilisateur -p domilix < add_announcer_columns.sql
```

Ou connectez-vous à MySQL et exécutez :
```sql
ALTER TABLE `announcers` 
ADD COLUMN `bio` TEXT NULL AFTER `presentation`,
ADD COLUMN `contact` VARCHAR(255) NULL AFTER `bio`;
```

## Vérification
Après avoir ajouté les colonnes, vérifiez la structure de la table :
```sql
DESCRIBE announcers;
```

Vous devriez voir :
- `bio` (TEXT, NULL)
- `contact` (VARCHAR(255), NULL)

## Fichiers modifiés

### Backend
1. **AuthController.php** : Méthode `updateAnnouncerProfile` avec gestion de l'avatar
2. **Announcer.php** : Ajout de `bio` et `contact` dans `$fillable`
3. **Migration** : `2025_11_30_225907_add_bio_and_contact_to_announcers_table.php`

### Frontend
1. **ProfileDialog.tsx** : Interface d'upload d'avatar et formulaire de mise à jour
2. **profileApi.ts** : Support de FormData pour l'upload de fichiers

## Test
1. Connectez-vous en tant qu'annonceur
2. Ouvrez le profil (icône utilisateur > Paramètres)
3. Allez dans l'onglet "Annonceur"
4. Modifiez les informations et uploadez un avatar
5. Cliquez sur "Mettre à jour le profil annonceur"
6. Vérifiez que les données sont bien sauvegardées en rechargeant la page
