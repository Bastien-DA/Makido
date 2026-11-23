# MS Paiement

Adapter vers un prestataire de paiement externe (Stripe aujourd'hui).

- Crée les transactions à la demande des autres services (gRPC, contrat `payment.proto`).
- Reçoit le callback du prestataire, vérifie sa signature et met à jour le statut en base (MongoDB).
- Prévient le MS Commande par un webhook signé quand un paiement réussit ou échoue.

Les variables d'environnement sont lues depuis le `.env` à la racine du monorepo (voir `.env.example`).
