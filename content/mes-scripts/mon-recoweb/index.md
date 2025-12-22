---
title: "Mon Recoweb"
slug: "mon-recoweb"
description: "Automatise la découverte de répertoires et fichiers web (whatweb + ffuf) et agrège les résultats dans mes_scans/scan_repertoires.txt (ou un fichier spécifique si un chemin est fourni)."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb"
version: "2.1.6"
---

Automatise la découverte de répertoires et fichiers web (whatweb + ffuf) et agrège les résultats dans mes_scans/scan_repertoires.txt (ou un fichier spécifique si un chemin est fourni).

## Présentation

**mon-recoweb — Découverte web ciblée pour CTF / pentest**

Ce script automatise la reconnaissance web d'une cible (ex. mon-site.htb) :
- Résolution de l'IP et vérification via ping (cohérence /etc/hosts).
- Scan interne Nmap (-Pn -sV -p-) pour détecter tous les ports HTTP/HTTPS.
- Pour chaque port HTTP/HTTPS :
    * Analyse de surface via whatweb (sur DOMAIN:PORT).
    * Fuzzing de répertoires/fichiers via ffuf, avec Host: DOMAIN.
    * Baseline anti-404 (fs/fw) pour limiter le bruit.
- Résultats agrégés dans un fichier :
    mes_scans/scan_repertoires.txt
  avec un bloc START/END par domaine.
  Si un chemin est fourni (ex: /cgi-bin/), l’agrégation se fait dans :
    mes_scans/scan_repertoires_<chemin>.txt  (ex: scan_repertoires_cgi-bin.txt)

## Téléchargements

La version courante du script mon-recoweb est 2.1.6

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

