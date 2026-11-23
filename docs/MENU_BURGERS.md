# Catalogue de burgers sushi

Le MS Commande expose le catalogue avec le RPC gRPC `CommandService.GetArticles`. La requête accepte `onlyAvailable` et `category`, combinables : si `onlyAvailable` est omis, seuls les articles disponibles sont renvoyés ; si `category` est omis, toutes les catégories sont incluses. Utiliser `onlyAvailable: false` pour inclure les articles indisponibles.

Les anciennes méthodes `FindArticlesKiosk` et `FindArticlesByCategory` sont supprimées : les clients doivent utiliser `GetArticles` avec les filtres correspondants. Chaque article peut inclure des groupes de personnalisations avec un minimum, un maximum, une quantité déjà comprise dans le prix et les options proposées.

Le prix de l'article inclut les sélections indiquées par `includedSelections`. Chaque unité sélectionnée au-delà de cette quantité ajoute le `additionalPrice` de l'option. Les groupes de sauces et de suppléments ont zéro sélection incluse : toute option choisie est donc facturée.

## Burgers proposés

| Burger        | Prix de base | Personnalisations principales                                                                                                                   |
| ------------- | -----------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokyo Saumon  |      11,90 € | De 1 à 3 morceaux de saumon, dont 1 inclus ; sauces ponzu-yuzu, mayonnaise sésame ou épicée ; avocat, cream cheese ou oignons croustillants.    |
| Thon Épicé    |      10,90 € | De 1 à 3 morceaux de thon, dont 1 inclus ; sauces mayonnaise épicée, teriyaki ou ponzu-yuzu ; avocat, œufs de poisson ou oignons croustillants. |
| Ebi Tempura   |      10,50 € | De 1 à 3 crevettes tempura, dont 1 incluse ; sauces mayonnaise yuzu, teriyaki ou épicée ; avocat, cream cheese ou edamame.                      |
| Umami Végétal |       9,90 € | Sauces mayonnaise yuzu, teriyaki ou ponzu-yuzu ; avocat, shiitakés, cream cheese ou edamame.                                                    |

Les groupes de sauces autorisent jusqu'à deux sélections et les groupes de suppléments jusqu'à trois. Les tarifs et options détaillés sont stockés avec les articles dans [01-seed-articles.sql](../apps/command/fixtures/01-seed-articles.sql).

Les anciens burgers proposent une portion supplémentaire de garniture et des sauces ; les menus permettent de choisir un accompagnement et une boisson. Les accompagnements, boissons, desserts et la sauce possèdent également des options adaptées. Ces données sont des exemples : les allergènes de chaque option doivent être vérifiés avant une utilisation réelle.

## Chargement des données de démonstration

Depuis la racine du dépôt, attendre que le MS Commande ait démarré et que TypeORM ait créé le schéma, puis charger les fixtures manuellement :

```bash
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U command_user -d command_db < apps/command/fixtures/01-seed-articles.sql
```

Cette commande de développement est idempotente. Pour les articles existants, elle ajoute les personnalisations des fixtures uniquement si la liste est vide ; les autres champs et les personnalisations non vides sont conservés. Ne l'exécutez pas sur une base de production.
