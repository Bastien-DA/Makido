# Makido

## Resumé
L’objectif est de mettre en place un kit complet de gestion de commande de restaurant.
Ce kit possède, une interface de gestion de commande et d’une interface permettant de voir en temps réel les commande à réaliser et le temps depuis la commande et en extraire des tickets de caisse

## Contexte
Roger souhaite moderniser son système de commande a son business de fast food en rajoutant des bornes intéractives en magasin.

## Features

Listez les besoins fonctionnels et non-fonctionnels nécessaires avant la validation.

Borne

- [ ]  Liste de burger (article)
- [ ]  Ajouter un article à la commande
- [ ]  Validation/Paiement de la commande
- [ ]  Export d’un ticket de caisse à la fin de validation de la commande

Cuisine

- [ ]  File de commandes à afficher avec ancienneté
- [ ]  Export des commandes de la journée avec stats de vitesse (.xlsx)

## Stack Technique:

- [ ]  Front Cuisine
- [ ]  Front Borne
- [ ]  Gateway
- [ ]  Gestion des commandes → DB
- [ ]  Gestion des paiements → DB
- [ ]  Export du ticket [Runner]  ← Event NATS  ← Commande validée et payée
- [ ]  Export Historique [Runner]

Front en React

Back en NestJs
