---
title: "Mon New Recoweb"
slug: "mon-new-recoweb"
description: "Recon web "stable" multi-vhosts: garde-fous anti-explosion (CMS/.git/assets) + web-discovery nmap + listing-mode + watchdog ferox (heartbeat mono-ligne) + SUMMARY enrichi (discovered dirs/files) + no-"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-new-recoweb"
version: "mon-new-recoweb v1.1.6"
---

Recon web "stable" multi-vhosts: garde-fous anti-explosion (CMS/.git/assets) + web-discovery nmap + listing-mode + watchdog ferox (heartbeat mono-ligne) + SUMMARY enrichi (discovered dirs/files) + no-

## Présentation

**mon-new-recoweb — Recon web stable (CTF/HTB)**

Objectif : découvrir la structure d’un ou plusieurs vhosts/sous-domaines sans “exploser” (CMS, assets, .git),
tout en détectant des fichiers importants (robots.txt, sitemap.xml…) et en gardant des trouvailles utiles.

v1.1.6 :
- Dossier de sortie SANS timestamp : recoweb_<host> (écrasé à chaque run)
- FFUF hits => URLs complètes (05/06) => 08_all_urls.txt contient vraiment les URLs
- Exclusion deep-scan dédiée : NO_DEEP_DIR_REGEX inclut /docs (visible mais pas approfondi)
- Watchdog heartbeat mono-ligne (idle=XXs)
- SUMMARY : [DISCOVERED_DIRS] (max 50) + [DISCOVERED_FILES] (max 30)

Usage rapide :
`mon-new-recoweb -t manage.htb`
`mon-new-recoweb -t manage.htb:8080`

## Usage

```
mon-new-recoweb  v1.1.6
Usage: mon-new-recoweb [OPTIONS]

Short description:
Recon web stable multi-vhosts (ffuf + ferox) avec garde-fous anti-explosion.
Détecte les ports web (nmap web-only) et scanne ensuite par base URL.

Targets:
-t <target>           Single target (vhost or URL)  (ex: manage.htb, manage.htb:8080, http://manage.htb:8080)
-l <file>             File with targets (one per line)

Options:
-o <dir>              Output directory (default: mes_scans)
--http|--https        Default scheme if target is a bare vhost (default: http)

--threads <N>         Concurrency (default: 20)
--timeout <N>         Timeout seconds (default: 7)

--depth-global <N>        Ferox global depth (default: 2)
--depth-interesting <N>   Ferox targeted depth (default: 4)

--max-hits-dirs <N>   Safety cap for ffuf dirs hits (default: 120)
--max-hits-files <N>  Safety cap for ffuf files hits (default: 120)
--max-queue <N>       Max interesting bases to deep-scan (default: 40)

--wl-dirs <path>      Wordlist for directories
--wl-files <path>     Wordlist for files
--exts <csv>          Extensions list (CSV) used for ferox/ffuf files

--ferox-idle <sec>        Legacy: applique le même idle aux 2 phases (global+deep)
--ferox-idle-global <sec> Idle watchdog pour le ferox global (défaut: 30)
--ferox-idle-deep <sec>   Idle watchdog pour les deep-scans (défaut: 60)
--watchdog-heartbeat <sec> Heartbeat watchdog mono-ligne (défaut: 10 ; 0=off)
--no-watchdog         Disable ferox watchdog

--no-web-discovery    Disable nmap phase 0 (only use the provided URL/host)
--web-ports <csv>     Ports to probe in phase 0 (default: 80,443,8000,8080,8081,8443,8888,9000,9090,3000,5000)

-h, --help            Show this help
-V, --version         Show version
--debug               Debug mode (set -x)
```

## Téléchargements

La version courante du script mon-new-recoweb est v1.1.6

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-new-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-new-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

