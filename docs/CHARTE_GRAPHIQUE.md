# MAKIDO — Kit de marque

Kit de départ de l'identité visuelle de **MAKIDO**, marque de fast-food spécialisée dans les burgers à inspiration asiatique.

> Direction artistique : Japanese Street Food — énergique, gourmande, moderne et accessible.

## Contenu

```text
assets/
├── logos/
│   ├── makido-logo-primary.svg   # Logo principal sur fond sombre
│   ├── makido-wordmark.svg       # Wordmark seul
│   └── makido-logo-light.svg     # Version pour fond clair
├── icons/
│   ├── makido-app-icon.svg       # Icône carrée
│   ├── icon-torii.svg
│   ├── icon-chopsticks.svg
│   └── icon-sakura.svg
└── patterns/
    ├── seigaiha.svg              # Motif de vagues japonais
    └── enso.svg                  # Cercle brush / enso
```

Tous les fichiers sont des SVG éditables : ils peuvent être ouverts dans Figma, Illustrator, Inkscape ou un éditeur de texte.

## Palette officielle

| Nom | HEX | RGB | Rôle |
|---|---|---|---|
| Rouge Makido | `#E63946` | 230, 57, 70 | Accent principal, promotions, signatures |
| Noir Onyx | `#1A1A1A` | 26, 26, 26 | Fonds sombres, textes, contraste |
| Orange Satsuma | `#F59E0B` | 245, 158, 11 | Gourmandise, burger, accents chauds |
| Crème Wasabi | `#F8F1E4` | 248, 241, 228 | Fonds clairs, textes sur fond sombre |
| Or Kyoto | `#D4AF37` | 212, 175, 55 | Détails premium, motifs |

### Variables CSS

```css
:root {
  --makido-red: #E63946;
  --makido-onyx: #1A1A1A;
  --makido-satsuma: #F59E0B;
  --makido-cream: #F8F1E4;
  --makido-gold: #D4AF37;
}
```

## Typographies recommandées

Les SVG utilisent des polices système de substitution pour rester autonomes. Pour les supports de communication, voici les choix recommandés :

- **Logo / accroches :** style brush ou lettering expressif. Le mot-symbole SVG peut être converti en tracés dans un outil vectoriel pour figer son apparence.
- **Titres :** Anton ou Bebas Neue — capitales compactes et impactantes.
- **Textes :** Montserrat ou Poppins — lisibles et contemporaines.
- **Prix / promotions :** Anton ou Bebas Neue.

Google Fonts :
- Anton : https://fonts.google.com/specimen/Anton
- Bebas Neue : https://fonts.google.com/specimen/Bebas+Neue
- Montserrat : https://fonts.google.com/specimen/Montserrat
- Poppins : https://fonts.google.com/specimen/Poppins

## Règles d'utilisation

1. Privilégier le logo principal sur un fond Noir Onyx.
2. Utiliser la version claire sur un fond Crème Wasabi ou blanc.
3. Garder le Rouge Makido comme accent fort ; éviter de l'utiliser en grandes surfaces partout.
4. Réserver l'Or Kyoto aux détails et motifs, pas aux textes longs.
5. Laisser une marge de respiration autour du logo au moins égale à la hauteur du « M ».
6. Ne pas étirer, incliner ou recolorer arbitrairement le logo.
7. Éviter les petits détails décoratifs sur les usages très réduits ; utiliser l'icône app.

## Ambiance et vocabulaire

**Mots-clés :** japonais, street-food, généreux, épicé, convivial, urbain, gourmand.

Le vocabulaire visuel s'appuie sur le soleil rouge, le cercle enso, les fleurs de sakura, les baguettes et le motif Seigaiha. Ces éléments sont des clins d'œil graphiques : ils doivent rester secondaires par rapport au burger et au nom MAKIDO.

## Notes techniques

- Les fichiers sont fournis en SVG vectoriel.
- Les textes des logos sont des éléments texte et peuvent dépendre des polices disponibles sur la machine.
- Pour une impression professionnelle, ouvrir le SVG dans un logiciel vectoriel, installer les polices choisies puis convertir les textes en tracés avant export PDF/SVG final.
- Les visuels sont une base de marque à affiner ; faire valider le logo final et sa lisibilité à petite taille avant production.
