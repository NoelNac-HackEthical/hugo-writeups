---
title: "Make Htb Wordlist"
slug: "make-htb-wordlist"
description: "Résumé court de l'outil."
date: 2025-09-24T18:33:01+02:00
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true

# Aide/usage affiché dans le bloc encadré (coller la vraie sortie -h du script)
usage: |
  make-htb-wordlist -h
  # Remplace par la sortie réelle du -h de ton script

repo: "NoelNac-HackEthical/mes-scripts"
asset_name: "make-htb-wordlist.sh"
binary_name: "make-htb-wordlist"

---

**Outil** : courte phrase décrivant l'objectif principal du script (remplace par ta description).

**Description** : une phrase ou deux sur l'objectif du script.

<!-- USAGE -->

## Télécharger le script

<p class="version-line">
  La version courante du script est
  {{< script_version repo="NoelNac-HackEthical/mes-scripts" script="make-htb-wordlist" >}}
</p>

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

## Installation

1. Copier le script dans `~/bin` (ou un dossier du `$PATH`) puis le rendre exécutable :

```bash
install -m 0755 make-htb-wordlist ~/bin/make-htb-wordlist
```

2. Prérequis : liste les dépendances (ex: `whatweb`, `ffuf`, etc).

## Utilisation rapide

- Exemple simple :

```bash
make-htb-wordlist -u https://target.tld --ext php,html,txt
```

- Exemple avancé :

```bash
make-htb-wordlist --target example.htb --output out/example
```

## Sorties

- `report.txt` — description brève (adapter selon le script).  
- `wordlist.txt` — si applicable.

## Astuces

- Ajuster les options `--rate` / `--threads` selon ton environnement.  
- Exemples d’usage fréquents et conseils d’exploitation.

