---
title: "Mon Recoweb"
slug: "mon-recoweb"
description: "Reconnaissance web automatisée en 3 phases (dirb + ffuf directories + ffuf files) avec exports JSON ffuf fiables, détection soft-404 et résumé global agrégé. Supporte aussi <host>/<path>/ (scan "
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb"
version: "mon-recoweb v2.2.1"
---

Reconnaissance web automatisée en 3 phases (dirb + ffuf directories + ffuf files) avec exports JSON ffuf fiables, détection soft-404 et résumé global agrégé. Supporte aussi <host>/<path>/ (scan 

## Présentation

**mon-recoweb — Recon web en 3 phases (dirb + ffuf dirs + ffuf files)**

Objectif :
- Obtenir une cartographie exploitable des répertoires et fichiers HTTP d’une cible CTF.

Validation de l’accessibilité de la cible (sans ICMP) :
- Si la cible est une URL complète : test HTTP(S) HEAD via curl
- Si la cible est un host : test HTTP(S) sur la base URL via curl
- Fallback TCP via nc sur les ports 80 et 443

Phases d’énumération :
1) dirb (wordlist courte) → cartographie initiale + extraction des hits
2) ffuf directories (raft-medium-directories)
3) ffuf files (raft-medium-files) + option --ext

Scan ciblé d’un répertoire :
- La cible peut inclure un chemin : <host>/<path>/ (ex: cible.htb/cgi-bin/)
- Le script ne scanne alors QUE ce répertoire (BASE=/path)
- Les sorties sont écrites dans scans_recoweb/<vhost>/<dernier-segment>/ (ex: scans_recoweb/cible.htb/cgi-bin/)

Organisation des sorties par vhost :
- Si la cible est un host (non-IP), les sorties sont placées dans : scans_recoweb/<vhost>/
  (utile quand tu scannes plusieurs subdomains/vhosts sur la même machine)

Wordlist "files" par défaut en scan de répertoire :
- Si BASE != "/" ET que l’utilisateur n’a pas fourni --raft-files,
  alors la phase ffuf files utilise par défaut : /usr/share/wordlists/dirb/common.txt
  (utile pour les répertoires contenant des scripts / endpoints legacy).

Gestion des soft-404 :
- Détection automatique d’un HTTP 200 sur ressource inexistante
- Calcul de la taille de réponse et application de -fs <size> à ffuf

Sorties (dans --outdir, défaut : scans_recoweb) :
- dirb.log + dirb_hits.txt
- ffuf_dirs.json + ffuf_dirs.log
- ffuf_files.json + ffuf_files.log
- ffuf_dirs.txt / ffuf_dirs_hits.txt (si `jq` est disponible)
- ffuf_files.txt / ffuf_files_hits.txt (si `jq` est disponible)
- RESULTS_SUMMARY.txt : résumé global (URLs complètes + CODE/SIZE quand possible)

Alertes (si `jq` est disponible) :
- ffuf directories = 0 résultat
- ffuf files = 0 résultat
- dirb a trouvé des fichiers mais ffuf files = 0 (wildcard, soft-404 variable, filtres trop stricts)

Usage typique :
- Scan de base : ${_self_base} cible.htb
- Scan ciblé répertoire + extensions : ${_self_base} cible.htb/chemin/ --ext ".sh,.cgi,.pl"

## Usage

```
mon-recoweb  v2.2.1
Usage: mon-recoweb [OPTIONS] <target>
mon-recoweb [OPTIONS] -t <target>

Description:
Recon web KISS en 3 phases (dirb + ffuf dirs + ffuf files), avec exports JSON fiables et résumé global.

Target:
<target>                  Host (ex: dog.htb) OU URL complète (ex: http://10.10.10.10)
Supporte aussi host/path (ex: cible.htb/cgi-bin/)
-t, --target <target>     (Optionnel) même chose, pour compatibilité

Options:
-s, --scheme <http|https> Scheme si target est un host (défaut: http)
--base <path>             Base path prefix (défaut: /) ex: /app => http://t/app/FUZZ
--ext <list>              Extensions pour ffuf files (ex: ".sh,.cgi,.pl" ou "sh,cgi,pl")
-T, --threads <n>         Threads ffuf (défaut: 30)
--rate <n>                Limite le débit ffuf (req/s). Ex: 40, 100, 200 (défaut: none)
--timeout <sec>           Timeout ffuf en secondes (défaut: 10)
--fc <codes>              Filtre codes status ffuf (défaut: 404)
--ffuf-extra <opts>       Options supplémentaires passées telles quelles à ffuf (dirs ET files)
Ex: --ffuf-extra "-fs 612"  ou  --ffuf-extra "-fs 612 -fw 10"
--dirb-wordlist <path>    Wordlist dirb (défaut: /usr/share/wordlists/dirb/common.txt)
--raft-dirs <path>        Wordlist ffuf dirs (défaut: /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt)
--raft-files <path>       Wordlist ffuf files (défaut: /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt)
Note: en scan ciblé de répertoire (BASE != /) et si --raft-files n'est pas fourni,
la wordlist par défaut bascule automatiquement vers /usr/share/wordlists/dirb/common.txt
-o, --outdir <dir>        Dossier de sortie (défaut: scans_recoweb)
--no-dirb                 Skip dirb
--no-ffuf-dirs            Skip ffuf directories
--no-ffuf-files           Skip ffuf files
--debug                   Debug (set -x)
-h, --help                Help
-V, --version             Version
```

## Téléchargements

La version courante du script mon-recoweb est v2.2.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

