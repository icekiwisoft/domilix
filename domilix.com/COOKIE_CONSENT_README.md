# 🍪 Implémentation du Cookie Consent RGPD

## Fonctionnalités

✅ **Conformité RGPD complète**
- Banner de consentement avec animation fade-in
- Gestion des préférences de cookies
- Politique de confidentialité détaillée
- Stockage local du consentement

✅ **Animations fluides**
- Overlay avec fade-in (opacity transition)
- Dialog avec slide-up et fade-in combinés
- Transitions de 300-500ms pour une expérience douce

## Fichiers créés

### 1. Composant CookieConsent
**Fichier:** `src/components/CookieConsent/CookieConsent.tsx`

- Affiche un banner en bas de page
- Overlay semi-transparent avec fade-in
- 3 boutons : Personnaliser, Refuser, Tout accepter
- Animation slide-up + fade-in
- Stockage dans localStorage

### 2. Hook useCookieConsent
**Fichier:** `src/hooks/useCookieConsent.ts`

- Gestion du statut de consentement
- Vérification du consentement
- Reset du consentement

### 3. Page de paramètres
**Fichier:** `src/pages/CookieSettings/CookieSettings.tsx`

- Gestion granulaire des cookies :
  - Cookies nécessaires (toujours actifs)
  - Cookies analytiques
  - Cookies marketing
  - Cookies de préférences
- Toggle switches pour chaque catégorie

### 4. Politique de confidentialité
**Fichier:** `src/pages/PrivacyPolicy/PrivacyPolicy.tsx`

- Informations RGPD complètes
- Droits des utilisateurs
- Types de données collectées
- Utilisation des cookies

## Routes ajoutées

```tsx
/cookie-settings    → Page de paramètres des cookies
/privacy-policy     → Politique de confidentialité
```

## Utilisation

### Vérifier le consentement dans votre code

```tsx
import { useCookieConsent } from '@hooks/useCookieConsent';

function MyComponent() {
  const { hasConsent, consent } = useCookieConsent();

  useEffect(() => {
    if (hasConsent()) {
      // Charger Google Analytics, etc.
      console.log('Consentement accepté');
    }
  }, [consent]);
}
```

### Vérifier les préférences spécifiques

```tsx
const preferences = JSON.parse(
  localStorage.getItem('cookiePreferences') || '{}'
);

if (preferences.analytics) {
  // Charger les scripts analytics
}

if (preferences.marketing) {
  // Charger les scripts marketing
}
```

## Animations

### Overlay
- Transition: `opacity 300ms`
- De: `opacity-0`
- Vers: `opacity-50`

### Dialog
- Transition: `transform + opacity 500ms ease-out`
- De: `translate-y-full opacity-0`
- Vers: `translate-y-0 opacity-100`

## Personnalisation

### Modifier les couleurs
Dans `CookieConsent.tsx`, ajustez les classes Tailwind :
```tsx
className="bg-indigo-600 hover:bg-indigo-700"
```

### Modifier les durées d'animation
```tsx
// Délai avant affichage
setTimeout(() => setIsVisible(true), 500);

// Durée de l'animation
className="transition-all duration-500"
```

### Ajouter des catégories de cookies
Dans `CookieSettings.tsx`, ajoutez de nouvelles sections avec toggles.

## Conformité RGPD

✅ Consentement explicite requis
✅ Possibilité de refuser
✅ Gestion granulaire des préférences
✅ Accès facile aux paramètres
✅ Politique de confidentialité accessible
✅ Stockage local du consentement avec date

## Notes importantes

1. Le banner s'affiche automatiquement si aucun consentement n'est enregistré
2. Le consentement est stocké dans localStorage avec la date
3. Les cookies nécessaires sont toujours actifs (conformité RGPD)
4. L'utilisateur peut modifier ses préférences à tout moment

## Prochaines étapes recommandées

1. Intégrer avec Google Analytics / Tag Manager
2. Ajouter un lien "Gérer les cookies" dans le footer
3. Implémenter le blocage réel des scripts selon les préférences
4. Ajouter des traductions si nécessaire
5. Tester sur différents navigateurs et appareils
