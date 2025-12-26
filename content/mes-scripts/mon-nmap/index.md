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
version: "2.0.0"
---

Automatise une série de scans Nmap (TCP complet, agressif, CMS, UDP) pour une cible CTF donnée.

## Présentation

mon-nouveau-nmap — Scan Nmap “tout-en-un” pour CTF

Ce script lance automatiquement plusieurs passes Nmap sur une cible (IP ou domaine) :

- Scan TCP complet sur tous les ports (1-65535)
- Scan agressif ciblé sur les ports ouverts (détection de services + scripts vulnérabilités “legacy”)
- Scan orienté CMS (WordPress, Drupal, Joomla, etc.) sur les mêmes ports
- Scan UDP rapide (top 20 ports)

Tous les résultats sont stockés dans le répertoire `mes_scans/` :
- full_tcp_scan.txt
- aggressive_vuln_scan.txt
- cms_vuln_scan.txt
- udp_vuln_scan.txt

L’objectif est d’obtenir rapidement une base solide pour l’énumération et
l’analyse des pistes d’exploitation sur une machine CTF.

## Téléchargements

La version courante du script mon-nmap est 2.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

