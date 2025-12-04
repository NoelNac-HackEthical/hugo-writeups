---
title: "Mon Nouveau Recoweb"
slug: "mon-nouveau-recoweb"
description: "Automatise la découverte web (whatweb + ffuf + dirsearch) et agrège les résultats dans mes_scans/scan_repertoires.txt (ou un fichier spécifique si un chemin est fourni)."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nouveau-recoweb"
version: "v1.1.1"
---

Automatise la découverte web (whatweb + ffuf + dirsearch) et agrège les résultats dans mes_scans/scan_repertoires.txt (ou un fichier spécifique si un chemin est fourni).

## Présentation

**mon-recoweb — Découverte web ciblée pour CTF / pentest (version simplifiée)**

Ce script automatise la reconnaissance web d'une cible (ex. mon-site.htb) :
- Résolution de l'IP et vérification via ping (cohérence /etc/hosts).
- Scan interne Nmap (-Pn -sV -p-) pour détecter tous les ports HTTP/HTTPS.
- Pour chaque port HTTP/HTTPS :
    * Analyse de surface via whatweb (sur DOMAIN:PORT[/PATH]).
    * Fuzzing de répertoires/fichiers via ffuf, avec Host: DOMAIN.
    * Scan complémentaire via dirsearch (si installé).
    * Baseline anti-404 (fs/fw) pour limiter le bruit (ffuf).
- Wordlist par défaut :
    /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt
- Résultats :
    * Affichage à l'écran avec sections séparées (Résumé global, WHATWEB, FFUF, DIRSEARCH)
    * Agrégation dans :
        mes_scans/scan_repertoires.txt
      ou, si un chemin est fourni (ex: /cgi-bin/), dans :
        mes_scans/scan_repertoires_<chemin>.txt

## Usage

```
Usage:
mon-recoweb <domaine.htb> [options]

Options :
--master FILE     Wordlist (défaut: /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt)
-t N              Threads ffuf (défaut: 50)
--timeout S       Timeout curl/whatweb (défaut: 8)
--strict          Mode strict (déjà activé par défaut : 200,301,302,403)
--codes LIST      Liste pour ffuf -mc (ex: "200,301,302,403"; priorité sur --strict)
--ext LIST        Extensions ffuf (ex: ".php,.txt,.sh,.cgi,.pl"). Vide = désactivé.
--debug           Affiche les commandes ffuf et conserve les fichiers /tmp
-V, --version     Afficher la version et quitter
-h, --help        Aide

Exemples :
mon-recoweb target.htb
mon-recoweb target.htb --strict
mon-recoweb target.htb/cgi-bin/ --ext ".sh,.cgi,.pl"
```

## Téléchargements

La version courante du script mon-nouveau-recoweb est v1.1.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

