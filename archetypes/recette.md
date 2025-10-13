---
title: "{{ replace .Name "-" " " | title }}"
description: "Mini-tuto : décris en une ligne ce que fait la recette."
tags: ["recettes","tools"]
categories: ["Mes recettes"]
date: {{ .Date }}
---

## Objectif
- Énonce brièvement ce que la recette permet de faire.
- Idéalement 2–3 puces max, concises.

---

## Prérequis (optionnel)
- Version/outils nécessaires (ex. Hugo, PaperMod, Bash, etc.).
- Lien(s) utile(s) si besoin.

---

## Étapes

### Préparer
Explique l’étape de préparation (fichiers/dossiers à créer, options à activer…).

```bash
# Exemple (remplace ou supprime)
echo "commande ou squelette" > chemin/fichier.ext
```

### Implémenter
Donne le contenu ou la modification principale (ex. shortcode, partial, script).

### Utiliser
Montre 1–2 usages concrets (ex. appel de shortcode, commande, paramètre).

### Résultat

- Ce que l’on obtient (comportement, rendu, vérification rapide).

- Si pertinent, note la différence onglet courant vs nouvel onglet, etc.

### Voir aussi

- Liens vers d’autres recettes liées ou références internes.

- Page “Recettes” : /recettes/

- Tags associés : /tags/recettes/, /tags/tools/
