# Rapport de Test — Bug 002 : Relance automatique/manuelle

## Teste 1
**Date :** 13/05/2025  
**Heures :**
- 09:06 : Prérelance
- 09:07 : Relance 1
- 09:08 : Relance 2
- 09:09 : Relance 3
- 09:10 : Relance finale

**Résultat :** Tout est correct ✅

---

## Teste 2
**Date :** 13/05/2025  
**Client :** Lomig GUEGUENIA  
**Numéro de facture :** 4  
**Heures attendues :**
- 09:19 : Prérelance
- 09:20 : Relance 1
- 09:21 : Relance 2
- 09:22 : Relance 3
- 09:23 : Relance 4

**Résultat du test :**  
Lors de ce test, une erreur a été commise : la **prérelance** a été saisie à **09:23** au lieu de 09:19.  
En conséquence :
- Prérelance envoyée à **09:23**
- Relances suivantes envoyées à **09:24, 09:25, 09:26, 09:27**

**Précautions prises :**
➡️ Désormais, une **notification d'erreur** est affichée si l'ordre est incorrect
---

## Teste 3
**Date :** 13/05/2025  
**Client :** Cldépde  
**Numéro de facture :** 4  
**Heures :**
- 10:20 : Prérelance
- 10:21 : Relance 1
- 10:22 : Relance 2
- 10:23 : Relance 3
- 10:24 : Relance 4

**Résultat :**  
Tout était correct **à l'exception de la prérelance**, qui est partie **1 minute plus tôt** que prévu.

---

## Teste 4 — Suppression de la créance et réinjection

**Date :** 13/05/2025  
**Client :** Cldépde  
**Numéro de facture :** 4  
**Heures :**
- 10:52 : Prérelance
- 10:53 : Relance 1
- 10:22 : Relance 2 
- 10:54 : Relance 3
- 10:55 : Relance 4

**Remarques :**
- Après réinjection, les anciennes dates configurées sont **restées sauvegardées**  
  → ❓ Est-ce le comportement souhaité ?
- En sauvegardant la configuration, **l'icône d'information** a **disparu** de la table créance
- Les relances ont été envoyées **rapidement**, sans laisser le temps à l’utilisateur de les configurer
- Seule la **relance finale** n’a pas été envoyée automatiquement

**Précautions prises :**
- **Mettre les relances en pause par défaut** après chargement
- **Réinitialiser les dates** avec des **valeurs par défaut** (date actuelle)
- **Déplacer le bouton pause/play dans la table** (ces modifications sera effectué dans 002-1 pour éviter des erreurs imprévues)
  - `Play` en **orange** pour inciter à cliquer
  - `Pause` en **vert**

## Teste 5- Lancement Play/pause
** Date:**13/05/2025
**Client :** Cldépde
**Numéro de facture :** 2
**Heures :**
- 13:57: Prérelance
- 13:58: Relance 1
- 13:59: Relance 2
- 14:00: Relance 3
- 14:01: Relance 4

**Remarques:**
- Toute a été envoyée correctement

## Teste 6- Désactivation relance finale
**Date: **13/05/2025
**Client:**Lomig GUEGUENIA
**Numéro de facture:**4
**Heure :**
-14:15: Prérelance  
-14:17: Relance 1 (oui 14:17)
-14:18: Relance 2
-14:19: Relance 3
-14:20: Relance 4 (décoché)

**Remarques:**
- La relance finale n'a pas été envoyée


## Teste 7- Décochage croisée
**Date: ** 13/05/2025
**Client :** Beriz Jazz
**Numéro de facture:**3
**Heure:**
-14:25: Prérelance (désactivé)
-14:26: Relance 1 (activé)
-14:27: Relance 2 (désactivé)
-14:28: Relance 3 (activé)
-14:29: Relance finale(activé)

**Remarques:**
- La relance 3 et la prérelance n'a pas été envoyés (positif)
- La prérelance et relance2 n'a pas été sauvegardés dans historique de relance (positif)
- Pendant un la période d'attente de relance 3 , relance 2  s'affiche dans status si on actualise la page (négatif)
**Précaution prise**
- Il faut mettre un condition dans la table pour que pendant la période de transition la relance désactivé ne s'affiche pas dans le statut
## Teste 8- Décochage croisée (sans réimportation du créance cible)
**Date: ** 13/05/2025
**Client :** Lomig GUEGUENIA
**Numéro de facture:**4
**Heure:**
-15:05: Prérelance (activé)
-15:06: Relance 1 (activé)
-15:07: Relance 2 (désactivé)
-15:08: Relance 3 (désactivé)
-15:09: Relance finale(activé)

**Remarques: **
- J'ai oublié d'appuyer sur play 
- Et dès que j'ai appuyer dessus, seules relances finale a été envoyés
- La cause à mon avis est que je n'ai pas supprimés l'anciens configuration mais j'ai juste modifiés les configurations précédentes 
- Des données de l'anciens process reperturbe le process modifiés
- Des précautions sont disponible mais avant, il faut vérifier si c'est vraiment la cause en supprimant totalement la créances avant de modifié le process
**Précautions à prendre: **
- Supprimer les données de l'anciens process à modifier
- Message de confirmation: "vous risquez d' écraser les anciens configurations de cette relance?Voulez-vous continuez?"
## Test 9- Décochage croisée (avec réimportation du créance cible)
**Date: ** 13/05/2025
**Client :** Lomig GUEGUENIA
**Numéro de facture:**4
**Heure:**
-15:28: Prérelance (activé)
-15:29: Relance 1 (activé)
-15:30: Relance 2 (désactivé)
-15:31: Relance 3 (désactivé)
-15:32: Relance finale(activé)

** Remarques: **
- Toute a été fonctionnelle à un détails pré, vu que les paramètres utilise par défaut les anciens dates, lorsqu'on a changer Prérelance et
Relance1 on a un erreur "Relance 2 doit-être avant relance 1", relance 2 pourtant a été désactivé du coup il faut que l'erreur ne s'affiche que si et seulement si la relance est activé.

- Vu la comportement correcte lorsqu'on a fait une réimportation il est nécessaire comme cité dans la test 8 de vidé les anciens données lors des modifications


## Test 10- Modification de relance déjà en cours

Actuellement si on modifie des relances déjà en cours, il demande des validations,
Si certains dates sont passés alors que le status d'un relance est actif il affiches un erreurs
Le dernier problème c'est que parfois la vérification des anciens dates prends 2 secondes et si on sauvegarde très rapidement le système n'a pas le temps de vérifié, il faut un petit mécanisme de await ou de loader

## Test 11- Test d'envoie de rappels manuels tous relance activés
**Date: ** 13/05/2025
**Client :** Beriz Jazz
**Numéro de facture:**3
**Heure:**
-11:05: Prérelance 
-11:08: Relance 1 
-11:09: Relance 2 
-11:10 Relance 3 
-11:11: Relance finale

**Remarques**
On a reparamétrée directement la relance, puis on a sauvegardé, on a envoyé la relance manuellement et çà a échouée,
la raison est que la statut de la relance était déjà en relance finale (anciens status).
Du coup on a supprimée la relance, et tous les relances sont de nouveau fonctionnels en envoie manuels

**Précautions prises**
Remettre la status de la relance en pending quand on enregistre
Intégrer cette logique à la confirmation d'écrasement de la configuration actuelles
## Test 12- Test d'envoie de rappels manuels tous relance activés après fix
**Date:** 15/05/2025
**Client :** Beriz Jazz
**Numéro de facture:**3
**Heure:**
- 19:30: Prérelance 
- 19:32: Relance 1 
- 19:33: Relance 2 
- 19:34 Relance 3 
- 19:35: Relance finale

**Remarques**
Tous les envoies manuels ce sont bien envoyés mais à la fin (relance finale), si on clique sur "envoyer une relance" la template se chargait encore alors qu'il a déjà été envoyer
La cause est le nonactualisation des données de la table (notamment la status des lignes)
**Précautions prises**
Rafraîchir la table après envoie
---