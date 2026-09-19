---
title: "Mon Recoweb"
slug: "mon-recoweb"
description: "Reconnaissance web automatisée avec dirb et ffuf, détection des soft-404 et scans ciblés de répertoires avec extensions personnalisées."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb"
version: "mon-recoweb v3.0.0"
---

Reconnaissance web automatisée avec dirb et ffuf, détection des soft-404 et scans ciblés de répertoires avec extensions personnalisées.

## Présentation

**mon-recoweb — Reconnaissance web automatisée**

`mon-recoweb` automatise plusieurs étapes de reconnaissance web et regroupe
les résultats dans un seul fichier de synthèse.

Il combine trois phases basées sur des outils bien connus : `dirb` et `ffuf`.
Leur utilisation complémentaire permet d’obtenir une reconnaissance web
plus approfondie, avec une couverture optimisée des répertoires et fichiers.

Dans le cas le plus simple :

```bash
mon-recoweb cible.htb
```

Le script lance successivement :

1. `dirb` pour une première découverte ;
2. `ffuf` pour les répertoires ;
3. `ffuf` pour les fichiers.

Les résultats sont regroupés dans :

```text
RESULTS_SUMMARY.txt
```

## Scanner un répertoire précis

```bash
mon-recoweb cible.htb/cgi-bin/
```

Le scan reste alors limité à ce chemin.

## Tester des extensions

```bash
mon-recoweb cible.htb/cgi-bin/ --ext sh,cgi,pl
```

## Filtrer les résultats parasites des ffuf

Certaines applications renvoient beaucoup de réponses parasites.
Un filtre simple peut suffire, par exemple sur la taille :

```bash
mon-recoweb cible.htb \
  --ffuf-extra "-fs 1234"
```

ou sur le code HTTP :

```bash
mon-recoweb cible.htb \
  --ffuf-extra "-fc 302"
```

Pour un filtrage plus précis, tu peux combiner code HTTP et taille :

```bash
mon-recoweb cible.htb \
  --no-dirb \
  --no-ffuf-dirs \
  --ffuf-extra "-fc 302,401 -fs 97,49,125 -fmode and"
```

Avec `-fmode and`, les critères sont combinés.

Si `ffuf-files` et `ffuf-dirs` nécessitent des filtres différents, lance-les
séparément ou en parallèle. Les résultats sont fusionnés dans
`RESULTS_SUMMARY.txt`.

## Pour aller plus loin

```bash
mon-recoweb --help-advanced
```

## Usage

```
mon-recoweb  v3.0.0
Usage:
mon-recoweb <cible>
mon-recoweb <cible>/<répertoire>/
mon-recoweb <cible>/<répertoire>/ --ext <extensions>

Exemples:
mon-recoweb cible.htb
mon-recoweb cible.htb/cgi-bin/
mon-recoweb cible.htb/cgi-bin/ --ext sh,cgi,pl

Par défaut, mon-recoweb lance automatiquement :
1. dirb
2. ffuf directories
3. ffuf files

Les résultats sont regroupés dans :
RESULTS_SUMMARY.txt

Options courantes:
--ext <liste>          Extensions à tester avec ffuf-files
Exemple : --ext php,txt,bak

-h, --help             Afficher cette aide
--help-advanced        Afficher les options avancées
-V, --version          Afficher la version

Pour les filtres, les wordlists, le lancement séparé des phases
et les autres réglages :
mon-recoweb --help-advanced
```

## Code source Github

Tous les scripts HackEthical sont disponibles sur le dépôt GitHub `mes-scripts` :

https://github.com/NoelNac-HackEthical/mes-scripts

## Téléchargements

La version courante du script mon-recoweb est v3.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

