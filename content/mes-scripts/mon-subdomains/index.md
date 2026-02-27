---
title: "Mon Subdomains"
slug: "mon-subdomains"
description: "Découverte de vhosts/sous-domaines par vhost-fuzzing (ffuf) avec baselines robustes, détection anti-wildcard contrôlée, gestion des redirects 3xx (curl -L + ffuf -r), parsing fiable via JSON (jq),"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-subdomains"
version: "mon-subdomains 2.0.0"
---

Découverte de vhosts/sous-domaines par vhost-fuzzing (ffuf) avec baselines robustes, détection anti-wildcard contrôlée, gestion des redirects 3xx (curl -L + ffuf -r), parsing fiable via JSON (jq),

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

## Usage

```
Usage:
mon-subdomains <domaine.htb> [mode] [options]

Modes :
-f, --fast      1000 premières lignes de la master
-m, --medium    2000 premières lignes
-l, --large     5000 (entière)
--custom FILE   Wordlist personnalisée (ignore la master)

Options :
--master FILE     Chemin de la master 5000 (défaut: /usr/share/wordlists/htb-dns-vh-5000.txt)
-t N              Threads ffuf (défaut: 50)
--timeout S       Timeout curl (défaut: 8)
--strict          Codes restreints utiles (équiv. à --codes 200,401,403)
--codes LIST      Liste pour ffuf -mc (ex: "200,401,403"; prend le dessus sur --strict)
--save-hosts      Ajoute les vhosts trouvés dans /etc/hosts (backup, sans doublon)
--dry-run-hosts   Simule l’ajout dans /etc/hosts (n’écrit rien)
--debug           Affiche la commande ffuf et garde la sortie brute (fichiers /tmp)
-V, --version     Afficher la version et quitter
-h, --help        Aide
```

## Téléchargements

La version courante du script mon-subdomains est 2.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

