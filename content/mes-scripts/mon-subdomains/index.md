---
title: "Mon Subdomains"
slug: "mon-subdomains"
description: "Découverte automatisée de vhosts et sous-domaines avec ffuf, avec détection des hôtes valides et réduction des faux positifs."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-subdomains"
version: "mon-subdomains 2.1.0"
---

Découverte automatisée de vhosts et sous-domaines avec ffuf, avec détection des hôtes valides et réduction des faux positifs.

## Présentation

**mon-subdomains — Découverte de vhosts et sous-domaines pour CTF / pentest**

Ce script automatise la recherche de vhosts (Host: FUZZ.domaine) en interrogeant
l'IP cible et en extrayant les hôtes valides (ex. api.domaine.htb, admin.domaine.htb).

Fonctionnement :
- Résout l'IP de la cible (getent, puis fallback dig).
- Effectue un pré-check TCP rapide sur les ports 80/443, sans dépendre de l'ICMP.
- Scan Nmap interne (-Pn -sV -p-) pour détecter les ports HTTP/HTTPS exposés.
- Pour chaque port web :
  - Calcule 3 baselines (code/size/words) avec un Host aléatoire.
  - Si baseline 3xx stable : baselines après redirection (curl -L) + fuzzing avec ffuf -r.
  - Si wildcard probable : fuzzing sauté pour éviter les faux positifs.
  - Sinon : ffuf avec filtres -fs/-fw (et -ac si baseline instable), sortie JSON puis parsing jq.
- Agrège les vhosts uniques et écrit un bloc remplacé à chaque run dans :
  scans_subdomains/scan_vhosts.txt

Wordlists :
- Par défaut, le script utilise :
  /usr/share/wordlists/htb-dns-vh-5000.txt
- Cette wordlist est installée par le script make-htb-wordlist, qu'il faut exécuter
  au préalable.
- Modes : fast (1000), medium (2000), large (5000)
- --custom FILE : utilise une wordlist personnalisée.

Options utiles :
- --save-hosts / --dry-run-hosts : ajout contrôlé des vhosts trouvés dans /etc/hosts.
- --debug : affiche la commande ffuf et conserve les fichiers temporaires /tmp.

## Usage

```
Usage:
mon-subdomains <domaine.htb> [mode] [options]

Modes :
-f, --fast      1000 premières lignes de la wordlist master
-m, --medium    2000 premières lignes de la wordlist master
-l, --large     5000 lignes, wordlist complète (mode par défaut)
--custom FILE   Utilise une wordlist personnalisée à la place de la master

Options :
--master FILE     Chemin de la wordlist master
(défaut: /usr/share/wordlists/htb-dns-vh-5000.txt)
-t N              Threads ffuf (défaut: 50)
--timeout S       Timeout curl en secondes (défaut: 8)
--strict          Restreint les codes HTTP à 200,401,403
--codes LIST      Codes HTTP transmis à ffuf -mc
(ex: "200,401,403"; prioritaire sur --strict)
--save-hosts      Ajoute les vhosts trouvés dans /etc/hosts
(backup, sans doublon)
--dry-run-hosts   Simule l’ajout dans /etc/hosts sans écrire le fichier
--debug           Affiche la commande ffuf et conserve les fichiers /tmp
-V, --version     Affiche la version et quitte
-h, --help        Affiche cette aide
```

## Code source Github

Tous les scripts HackEthical sont disponibles sur le dépôt GitHub `mes-scripts` :

https://github.com/NoelNac-HackEthical/mes-scripts

## Téléchargements

La version courante du script mon-subdomains est 2.1.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

