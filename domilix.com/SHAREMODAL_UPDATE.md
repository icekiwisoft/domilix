# Mise à jour du ShareModal

## Modifications apportées

### 1. ShareModal.tsx
Le composant a été modernisé avec :
- **Header avec informations** : Image, titre, prix, localisation et type d'annonce
- **Design épuré** : Boutons en liste avec bordures au lieu de fonds colorés
- **Feedback visuel** : Icône de confirmation "Lien copié !" avec animation
- **Props ajoutées** :
  - `price` - Prix de l'annonce
  - `location` - Localisation
  - `image` - Image principale
  - `type` - Type d'annonce (Location/Vente)

### 2. Ad.tsx (Page détail)
Mise à jour de l'appel au ShareModal :
```tsx
<ShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  url={window.location.href}
  title={`${adInfo?.category?.name || 'Annonce'} • ${adInfo?.city || 'Localisation'}`}
  price={`${adInfo?.price?.toLocaleString()} ${adInfo?.devise || 'FCFA'}`}
  location={adInfo?.city || adInfo?.address}
  image={adInfo?.medias?.[0]?.file ? `http://localhost:8000${adInfo.medias[0].file}` : undefined}
  type={adInfo?.ad_type === 'location' ? 'Location' : 'Vente'}
/>
```

### 3. ProductCard.tsx (Carte d'annonce)
Mise à jour de l'appel au ShareModal :
```tsx
<ShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  url={`${window.location.origin}/houses/${id}`}
  title={category?.name || 'Annonce'}
  price={`${price?.toLocaleString()} ${devise || 'FCFA'}`}
  location={props.city || props.address}
  image={medias?.[0]?.file ? `http://localhost:8000${medias[0].file}` : undefined}
  type={ad_type === 'location' ? 'Location' : 'Vente'}
/>
```

## Résultat

Le ShareModal affiche maintenant :
- 🏠 Une miniature de l'annonce
- 📝 Le titre et type de bien
- 💰 Le prix formaté
- 📍 La localisation avec icône
- 🎨 Un design épuré et moderne
- ✅ Un feedback visuel lors de la copie du lien

## Compatibilité

Les props sont toutes optionnelles, donc le composant fonctionne même sans passer ces informations (affichage basique).
