---
title: "Mon Nmap"
slug: "mon-nmap"
description: "Automatise scans Nmap (TCP full, -A, UDP) + passes NSE (web/ssl/vuln/smb) avec affichage de progression ; lance mon-nmap-analyze si demandé ; affiche toujours summary.txt en fin."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap"
version: "1.2.0"
---

Automatise scans Nmap (TCP full, -A, UDP) + passes NSE (web/ssl/vuln/smb) avec affichage de progression ; lance mon-nmap-analyze si demandé ; affiche toujours summary.txt en fin.

## Présentation

Mon-Nmap — Outil d’énumération Nmap pour CTF / pentest

Ce script automatise la séquence de scans systématiques en phase
d’énumération : scan TCP complet (1-65535), scan "agressif" (-A)
sur les ports détectés, scan UDP (top-20 ou complet), et passes NSE
ciblées (web/ssl/vuln/smb) avec affichage de la progression.

- Génère des sorties prêtes pour les writeups : summary.txt et summary.md
- Peut lancer une analyse post-scan (mon-nmap-analyze) et injecter le
  résumé des vulnérabilités HIGH dans les summaries
- Comportement conservateur : résultats isolés dans nmap_<cible>/

1. Lancer un scan complet : `mon-nmap target.htb`
2. Ajouter tous les NSE et l’analyse : `mon-nmap --nse-all --analyze target.htb`
3. Forcer l’UDP complet : `mon-nmap --udp-all target.htb`

Exemple rapide :
`mon-nmap --nse-all --analyze 10.10.10.10`

Astuce : adapter les passes NSE selon le contexte pour gagner du temps.

## Téléchargements

La version courante du script mon-nmap est 1.2.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

