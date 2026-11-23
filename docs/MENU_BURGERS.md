# Catalogue de burgers sushi

Le MS Commande expose le catalogue avec le RPC gRPC `CommandService.GetArticles`. La requête accepte `onlyAvailable` ; s'il est omis, seuls les articles disponibles sont renvoyés. Chaque article peut inclure des groupes de personnalisations avec un minimum, un maximum, une quantité déjà comprise dans le prix et les options proposées.

Le prix de l'article inclut les sélections indiquées par `includedSelections`. Chaque unité sélectionnée au-delà de cette quantité ajoute le `additionalPrice` de l'option. Les groupes de sauces et de suppléments ont zéro sélection incluse : toute option choisie est donc facturée.

## Burgers proposés

| Burger        | Prix de base | Personnalisations principales                                                                                                                   |
| ------------- | -----------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokyo Saumon  |      11,90 € | De 1 à 3 morceaux de saumon, dont 1 inclus ; sauces ponzu-yuzu, mayonnaise sésame ou épicée ; avocat, cream cheese ou oignons croustillants.    |
| Thon Épicé    |      10,90 € | De 1 à 3 morceaux de thon, dont 1 inclus ; sauces mayonnaise épicée, teriyaki ou ponzu-yuzu ; avocat, œufs de poisson ou oignons croustillants. |
| Ebi Tempura   |      10,50 € | De 1 à 3 crevettes tempura, dont 1 incluse ; sauces mayonnaise yuzu, teriyaki ou épicée ; avocat, cream cheese ou edamame.                      |
| Umami Végétal |       9,90 € | Sauces mayonnaise yuzu, teriyaki ou ponzu-yuzu ; avocat, shiitakés, cream cheese ou edamame.                                                    |

Les groupes de sauces autorisent jusqu'à deux sélections et les groupes de suppléments jusqu'à trois. Les tarifs et options détaillés sont stockés avec les articles dans [01-seed-articles.sql](../apps/command/fixtures/01-seed-articles.sql).

## Mise à jour d'une base existante

L'initialisation automatique de PostgreSQL ne s'exécute que sur un volume neuf. Après le démarrage du service avec la nouvelle colonne de personnalisations, relancer le seed pour ajouter les quatre burgers à une base déjà initialisée :

```bash
pnpm --filter @makido/command seed
```
