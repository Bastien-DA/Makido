# Makido

## Resumé
L’objectif est de mettre en place un kit complet de gestion de commande de restaurant.
Ce kit possède, une interface de gestion de commande et d’une interface permettant de voir en temps réel les commande à réaliser et le temps depuis la commande et en extraire des tickets de caisse

## Contexte
 full nest avec microservice :

 - MS ticket (en charge de la generation du ticket client)
 - MS Export comptable (appelle le MS de commande pour generer l'export)
 - MS Commande (en charge du dycle de vie de la commande)
 - MS Paiement (en charge d'initialer une transaction vers un service externe ex: stripe, d'enregistrer les infos et de renvoyer un statut)
 - Gateway (seul point d'entrée, encharge de convertir lkes requette http du front en grpc, les microserfvice coimmunique entre eux en grpc)

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
- [ ]  Gestion des commandes → DB (postgres)
- [ ]  Gestion des paiements → DB (mongo)
- [ ]  Export du ticket ← Commande validée et payée
- [ ]  Export Historique [Runner]

Front en React

Back en NestJs
