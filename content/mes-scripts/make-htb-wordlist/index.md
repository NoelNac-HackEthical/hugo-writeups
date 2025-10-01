---
title: "Make Htb Wordlist"
slug: "make-htb-wordlist"
description: "Short one-line description du sript make-htb-wordlist"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
---

## Usage

```
Usage:
/work/make-htb-wordlist [--out FILE] [--no-install] [--no-medium] [--minlen N] [--maxlen N] [--allow-digit-start] [-V|--version] [-h|--help]

Par défaut : --out /usr/share/wordlists/htb-dns-vh-5000.txt

Options:
--out FILE           Chemin de sortie (défaut: /usr/share/wordlists/htb-dns-vh-5000.txt)
--no-install         Ne pas tenter d'installer seclists automatiquement
--no-medium          Ne pas inclure raft-medium-words.txt
--minlen N           Longueur minimale (défaut: 3)
--maxlen N           Longueur maximale (défaut: 24)
--allow-digit-start  Autoriser un début par chiffre
-V, --version        Afficher la version et quitter
-h, --help           Afficher cette aide et quitter
```

## Télécharger le script

<p class="version-line">
  La version courante du script est <code>make-htb-wordlist 1.0.1</code>
</p>

<div class="dl-row">
  <a href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist" class="he-btn he-btn--neutral">Télécharger la version courante</a>
  <a href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist.sha256" class="he-btn he-btn--sm he-btn--neutral">SHA256</a>
</div>

<p><a href="https://github.com/NoelNac-HackEthical/mes-scripts">Voir le dépôt mes-scripts sur GitHub</a></p>

> Cette page est générée automatiquement à partir des releases de **mes-scripts** (liens par défaut vers `latest`).
