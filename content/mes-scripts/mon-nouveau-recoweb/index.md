---
title: "Mon Nouveau Recoweb"
slug: "mon-nouveau-recoweb"
description: "Découverte web automatisée via feroxbuster + ffuf + dirsearch avec heuristique de bruit (ffuf) et agrégation des chemins filtrés."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nouveau-recoweb"
version: "v1.7.0"
---

Découverte web automatisée via feroxbuster + ffuf + dirsearch avec heuristique de bruit (ffuf) et agrégation des chemins filtrés.

## Présentation

mon-nouveau-recoweb — Découverte web ciblée pour CTF / pentest (feroxbuster + ffuf + dirsearch)

Ce script automatise la reconnaissance web d'une cible (ex. mon-site.htb) en combinant :
  - feroxbuster : scan récursif en premier, avec ses mécanismes internes (auto-filter, recursion, etc.),
  - ffuf        : scan guidé par baseline + heuristique de bruit (404/403 génériques),
  - dirsearch   : scan supplémentaire après ffuf, basé sur sa propre wordlist et sa config.

Principales étapes :
- Résolution du domaine vers une IP + vérification par ping (cohérence /etc/hosts).
- Scan Nmap interne (-Pn -sV -p-) pour détecter tous les ports TCP exposant du HTTP/HTTPS.
- Pour chaque port HTTP/HTTPS détecté :

  1) Scan feroxbuster (en premier) :
     - Lancement de feroxbuster sur l’URL basée sur le domaine (http(s)://domaine[:port]/chemin).
     - Utilisation d’une wordlist dédiée (--ferox-master, défaut : big.txt).
     - Aucune modification des paramètres internes de ferox (filtres, recursion, auto-filter).
     - Conservation de la sortie dans un fichier pour extraction des chemins (/path).

  2) Baseline + ffuf (en second) :
     a) Calcul d’une baseline HTTP sur un chemin aléatoire :
        - Requête vers http(s)://IP:PORT/<random> avec en-tête Host: domaine.
        - Récupération du triplet : code HTTP, taille de réponse, nombre de mots.
        - Utilisation de cette baseline pour paramétrer les filtres ffuf (-fs / -fw)
          contre les faux positifs (404 génériques).

     b) Phase d’échantillonnage (détection du bruit de fond) — ffuf uniquement :
        - Construction d’une mini-wordlist (~10 000 premières entrées de la wordlist ffuf).
        - Lancement d’un ffuf échantillon sur cette mini-wordlist, avec les filtres de baseline.
        - Analyse des résultats CSV pour détecter les combos (status:size) récurrents typiques du bruit
          (ex. 403:199 renvoyé massivement par le serveur).

     c) Scan ffuf complet (sur la wordlist ffuf principale) :
        - Lancement d’un ffuf sur l’ensemble de la wordlist ffuf (--ffuf-master),
          en appliquant :
            * les filtres de baseline (-fs, -fw),
            * les filtres supplémentaires (-fs, -fw) dérivés des combos de bruit détectés à l’étape b).
        - Export des résultats en CSV par port.
        - Post-traitement côté script pour exclure explicitement les combos (status:size) identifiés comme bruit.

  3) dirsearch (après ffuf) :
     - Lancement de dirsearch sur l’URL basée sur le domaine.
     - Utilisation de la configuration / wordlist par défaut de dirsearch.
     - Extraction des chemins depuis le rapport texte.

  4) Post-traitement et agrégation globale :
     - Lecture de tous les chemins trouvés par feroxbuster, ffuf et dirsearch.
     - Nettoyage :
         * suppression des séquences ANSI,
         * réduction des URLs complètes au chemin (/path),
         * normalisation (suppression des / finaux, déduplication),
         * conservation de la casse (LICENSE, README.md, etc.).
     - Calcul :
         * du nombre total de chemins bruts (ferox + ffuf + dirsearch, après filtrage),
         * du nombre de chemins uniques normalisés.

Wordlists par défaut :
  - ffuf  : /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt
  - ferox : /usr/share/seclists/Discovery/Web-Content/big.txt

Résultats :
  - Affichage à l’écran avec sections détaillées :
      * Résumé global (ports HTTP/HTTPS, compteurs de chemins bruts / uniques).
      * Résultats feroxbuster (par port).
      * Résultats FFUF (par port).
      * Résultats dirsearch (par port).
  - Agrégation dans un fichier dans le répertoire mes_scans/ :
      * Si on lance : mon-nouveau-recoweb target.htb
          → mes_scans/scan_repertoires.txt
      * Si on cible un sous-chemin : mon-nouveau-recoweb target.htb/cgi-bin/
          → mes_scans/scan_repertoires_cgi-bin.txt

## Usage

```
Usage:
mon-nouveau-recoweb <domaine.htb> [options]

Options :
--ffuf-master FILE    Wordlist ffuf (défaut: /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt)
--ferox-master FILE   Wordlist feroxbuster (défaut: /usr/share/seclists/Discovery/Web-Content/big.txt)
-t N                  Threads ffuf (défaut: 50)
--timeout S           Timeout curl pour la baseline (défaut: 8)
--strict              Mode strict (déjà activé par défaut : 200,301,302,403)
--codes LIST          Liste pour ffuf -mc (ex: "200,301,302,403"; priorité sur --strict)
--ext LIST            Extensions ffuf (ex: ".php,.txt,.sh,.cgi,.pl"). Vide = désactivé.
--no-ferox            Désactiver feroxbuster pour ce run
--no-ffuf             Désactiver ffuf pour ce run
--no-dirsearch        Désactiver dirsearch pour ce run
--debug               Affiche les commandes ffuf/ferox/dirsearch et conserve les fichiers /tmp
-V, --version         Afficher la version et quitter
-h, --help            Aide

Exemples :
mon-nouveau-recoweb target.htb
mon-nouveau-recoweb target.htb/cgi-bin/ --ext ".sh,.cgi,.pl"
mon-nouveau-recoweb target.htb --ffuf-master raft-large-directories.txt --ferox-master big.txt
mon-nouveau-recoweb target.htb --no-ferox --no-dirsearch
```

## Téléchargements

La version courante du script mon-nouveau-recoweb est v1.7.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

