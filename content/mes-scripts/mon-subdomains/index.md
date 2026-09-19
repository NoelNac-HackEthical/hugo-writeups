---
title: "Mon Subdomains"
slug: "mon-subdomains"
description: "Découverte de vhosts et sous-domaines avec ffuf, modes fast/medium/large ou wordlist personnalisée, baselines robustes, contrôle anti-wildcard et filtres HTTP."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-subdomains"
version: "2.0.1"
---

Découverte de vhosts et sous-domaines avec ffuf, modes fast/medium/large ou wordlist personnalisée, baselines robustes, contrôle anti-wildcard et filtres HTTP.

## Présentation

**mon-subdomains — Découverte de vhosts pour CTF / pentest**

Ce script automatise la recherche de vhosts (Host: FUZZ.domaine) en interrogeant
l'IP cible et en extrayant les hôtes valides (ex. api.domaine.htb, admin.domaine.htb).

Fonctionnement (résumé fidèle au code) :
- Résout l'IP de la cible (getent, puis fallback dig).
- Pré-check canonique HTB : validation TCP rapide sur 80/443 (sans ICMP).
- Scan Nmap interne (-Pn -sV -p-) pour détecter les ports HTTP/HTTPS exposés.
- Pour chaque port web :
  - Calcule 3 baselines (code/size/words) avec un Host aléatoire.
  - Si baseline 3xx stable : baselines après redirection (curl -L) + fuzzing avec ffuf -r.
  - Si wildcard probable : fuzzing sauté pour éviter les faux positifs.
  - Sinon : ffuf avec filtres -fs/-fw (et -ac si baseline instable), sortie JSON puis parsing jq.
- Agrège les vhosts uniques et écrit un bloc remplacé à chaque run dans :
  scans_subdomains/scan_vhosts.txt

Wordlists :
- Master par défaut : /usr/share/wordlists/htb-dns-vh-5000.txt
- Modes : fast (1000), medium (2000), large (5000)
- --custom FILE : utilise une wordlist personnalisée.
- Si la master est absente : installe/régénère via ton script make-htb-wordlist.

Options utiles :
- --save-hosts / --dry-run-hosts : ajout contrôlé des vhosts trouvés dans /etc/hosts.
- --debug : affiche la commande ffuf et conserve les fichiers temporaires /tmp.

## Code source Github

Tous les scripts HackEthical sont disponibles sur le dépôt GitHub `mes-scripts` :

https://github.com/NoelNac-HackEthical/mes-scripts

## Téléchargements

La version courante du script mon-subdomains est 2.0.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

