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
- Ajout d'un **avertissement** et **blocage** de la saisie de la prérelance après relance 1
- **Déplacement automatique** de la prérelance avant relance 1 pour limiter les erreurs

➡️ Désormais, une **notification d'erreur** est affichée si l'ordre est incorrect, et la prérelance est déplacée automatiquement.

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
- 10:22 : Relance 2 ❌
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
- **Déplacer le bouton pause/play dans la table**
  - `Play` en **orange** pour inciter à cliquer
  - `Pause` en **vert**

---
