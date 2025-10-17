---
title: "Mon Nmap"
slug: "mon-nmap"
description: "Automatise une série de scans Nmap (TCP full, scan agressif, UDP) et génère des résumés texte et Markdown prêts pour les writeups CTF."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap"
version: "mon-nmap 1.0.0"
---

Automatise une série de scans Nmap (TCP full, scan agressif, UDP) et génère des résumés texte et Markdown prêts pour les writeups CTF.

## Présentation

**Mon-Nmap — Outil d'énumération Nmap pour CTF / pentest**

Ce script automatise la séquence de scans que j'exécute systématiquement en phase
d'énumération d'un challenge HTB : scan TCP complet (1-65535), scan "aggressif" (-A)
sur les ports détectés, et scan UDP (top-20 ou complet via --udp-all).

Objectifs pédagogiques et pratiques :
- standardiser la collecte d'informations initiale afin d'avoir des résultats comparables
  d'une machine à l'autre ;
- produire des sorties synthétiques prêtes à être insérées dans un writeup
  (`summary.txt` brut + `summary.md` épuré pour Hugo) ;
- comportement conservateur : le script crée un dossier de résultats `nmap_<cible>`
  (ex. `nmap_mon-site.htb`) et y place tous les fichiers de sortie — il n'écrase
  rien en dehors de ce dossier.

Points notables :
- option `--udp-all` : lance un scan UDP complet (-p-) au lieu du top 20 ;
- les fichiers produits : 1-port_scan.txt, 2-aggressive_scan.txt, 3-udp_scan.txt,
  summary.txt (brut), summary.md (version markdown et synthétique) ;
- usage type : `./mon-nmap mon-site.htb` ou `./mon-nmap --udp-all mon-site.htb`

## Usage

```
mon-nmap  v1.0.0
Usage: mon-nmap [--udp-all] <IP_CIBLE>

Options:
--udp-all     Scan UDP complet (-p-) au lieu du top 20
-V, --version Afficher la version
-h, --help    Afficher cette aide
```

## Téléchargements

La version courante du script mon-nmap est mon-nmap 1.0.0

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

