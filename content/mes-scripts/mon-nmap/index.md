---
title: "Mon Nmap"
slug: "mon-nmap"
description: "Automatise une série de scans Nmap (TCP complet, agressif, CMS, UDP, FTP/SMB) pour une cible CTF donnée."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap"
version: "2.1.3"
---

Automatise une série de scans Nmap (TCP complet, agressif, CMS, UDP, FTP/SMB) pour une cible CTF donnée.

## Présentation

mon-nmap — Scan Nmap “tout-en-un” pour CTF / HTB

Objectif
  Obtenir rapidement une base d’énumération solide (ports/services + pistes “legacy” + indices CMS),
  en générant des fichiers de résultats prêts à relire, dans un dossier unique.

Ce que fait le script (ordre réel d’exécution)
  0) Pré-check canonique HTB (validation IP sans ICMP, via TCP 80/443/22)
  1) Scan TCP complet (1–65535) avec extraction des ports “open”
  2) Enumération ciblée FTP / SMB (si services détectés)
     - FTP : ftp-anon, ftp-syst
     - SMB : smb-os-discovery, smb-enum-shares, smb-enum-users
     - Le fichier de sortie est toujours créé, même si l’énumération est ignorée
  3) Scan agressif sur les ports ouverts (détection services + scripts vulnérabilités “legacy”)
  4) Scan orienté CMS sur les mêmes ports (WordPress/Drupal/Joomla + scripts HTTP utiles)
  5) Scan UDP (top 20 ports)

Sortie
  Les résultats sont stockés dans le répertoire : scans_nmap/<cible>/
    - full_tcp_scan.txt
    - enum_ftp_smb_scan.txt
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
  - L’énumération FTP / SMB est volontairement ciblée et non exhaustive.
  - Le scan agressif est écrit avec un en-tête rappelant la commande Nmap utilisée.

## Code source Github

Tous les scripts HackEthical sont disponibles sur le dépôt GitHub `mes-scripts` :

https://github.com/NoelNac-HackEthical/mes-scripts

## Téléchargements

La version courante du script mon-nmap est 2.1.3

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

