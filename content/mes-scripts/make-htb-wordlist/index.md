---
title: "Make Htb Wordlist"
slug: "make-htb-wordlist"
description: "Construit et installe une wordlist orientée HTB (vhost/subdomains) à partir de SecLists (+ seed FAST), normalisée et limitée à 5000 entrées."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "make-htb-wordlist"
version: "make-htb-wordlist 1.0.4"
---

Construit et installe une wordlist orientée HTB (vhost/subdomains) à partir de SecLists (+ seed FAST), normalisée et limitée à 5000 entrées.

## Présentation

**make-htb-wordlist — Master DNS/VHOST orientée HTB (5000 entrées)**

Ce script assemble une wordlist « maison » optimisée pour les CTF HTB afin d’alimenter
le vhost-fuzzing (ex. avec mon-subdomains). Il combine plusieurs sources SecLists et
une petite liste « FAST » prioritaire, applique des règles de normalisation strictes,
déduplique/ordonne, puis tronque proprement à 5000 lignes.

Sources et pipeline :
- SecLists : DNS top1million-5000 + Web-Content raft-small (+ raft-medium si non désactivé) ;
- seed « FAST » (admin, dev, api, staging, …) placée en tête pour prioriser les hits ;
- normalisation : minuscules, charset [a-z0-9-], pas de « -- », ni tiret en début/fin,
  longueur 3..24 (paramétrable), optionnelle autorisation de début par chiffre ;
- déduplication ordonnée, puis coupe à 5000 entrées max.

Sortie et installation :
- chemin par défaut : /usr/share/wordlists/htb-dns-vh-5000.txt (droits 644) ;
- tentative d’installation de SecLists via apt (désactivable avec --no-install) ;
- affichage d’un aperçu (Top 10) pour vérification rapide.

Options utiles :
- --out FILE            : fichier de sortie personnalisé ;
- --no-install          : n’installe pas SecLists automatiquement ;
- --no-medium           : exclut raft-medium pour une liste plus compacte ;
- --minlen / --maxlen   : borne la longueur des tokens ;
- --allow-digit-start   : autorise un début par chiffre.

Exemples :
  ./make-htb-wordlist
  ./make-htb-wordlist --no-medium --out /tmp/htb-5000.txt
  ./make-htb-wordlist --minlen 2 --maxlen 20 --allow-digit-start

Usage recommandé :
- générer/mettre à jour la master une fois sur la machine de lab ;
- l’utiliser ensuite dans mon-subdomains (modes fast/medium/large via head) ;
- conserver le fichier versionné/packagé si besoin pour reproductibilité.

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

## Téléchargements

La version courante du script est make-htb-wordlist 1.0.4

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

