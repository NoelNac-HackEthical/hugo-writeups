---
title: "Mon Nmap"
slug: "mon-nmap"
description: "Automatise une série de scans Nmap (TCP complet, agressif, CMS, UDP) pour une cible CTF donnée."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap"
version: "mon-nmap v2.0.0"
---

Automatise une série de scans Nmap (TCP complet, agressif, CMS, UDP) pour une cible CTF donnée.

## Présentation

mon-nmap — Scan Nmap “tout-en-un” pour CTF / HTB

Objectif
  Obtenir rapidement une base d’énumération solide (ports/services + pistes “legacy” + indices CMS),
  en générant des fichiers de résultats prêts à relire, dans un dossier unique.

Ce que fait le script (ordre réel d’exécution)
  0) Pré-check canonique HTB (validation IP sans ICMP, via TCP 80/443/22)
  1) Scan TCP complet (1–65535) avec extraction des ports “open”
  2) Scan agressif sur les ports ouverts (détection services + scripts vulnérabilités “legacy”)
  3) Scan orienté CMS sur les mêmes ports (WordPress/Drupal/Joomla + scripts HTTP utiles)
  4) Scan UDP (top 20 ports)

Sortie
  Les résultats sont stockés dans le répertoire : scans_nmap/
    - full_tcp_scan.txt
    - aggressive_vuln_scan.txt
    - cms_vuln_scan.txt
    - udp_vuln_scan.txt

Options
  -h, --help       Affiche l’aide
  -V, --version    Affiche la version
  --debug          Active le mode debug (set -x)

Dépendances
  - nmap
  - nc (netcat-openbsd ou équivalent)

Remarques
  - Le pré-check peut demander confirmation si aucune réponse TCP immédiate n’est détectée
    (cas typique : IP HTB changée / /etc/hosts obsolète / ports filtrés).
  - Le scan agressif est écrit avec un en-tête rappelant la commande Nmap utilisée.

## Usage

```
mon-nmap  v2.0.0
Usage: mon-nmap [OPTIONS] <IP_OU_DOMAINE>

Lance une série de scans Nmap sur une cible (IP ou domaine) et enregistre
les résultats dans le répertoire scans_nmap/ :

1) Scan complet des ports TCP
2) Scan agressif orienté vulnérabilités (CTF-perfect LEGACY)
3) Scan orienté CMS (WordPress, Drupal, Joomla...)
4) Scan UDP (top 20 ports)

Fichiers produits :
scans_nmap/full_tcp_scan.txt
scans_nmap/aggressive_vuln_scan.txt
scans_nmap/cms_vuln_scan.txt
scans_nmap/udp_vuln_scan.txt

Options:
-h, --help       Affiche cette aide
-V, --version    Affiche la version
--debug          Active le mode debug (set -x, verbosité bash)

Exemple:
mon-nmap 10.10.10.14
mon-nmap target.htb
```

## Téléchargements

La version courante du script mon-nmap est v2.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

