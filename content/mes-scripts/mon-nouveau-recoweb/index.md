---
title: "Mon Nouveau Recoweb"
slug: "mon-nouveau-recoweb"
description: "Découverte web automatisée via ffuf avec heuristique de bruit et agrégation des chemins filtrés."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nouveau-recoweb"
version: "v1.4.1"
---

Découverte web automatisée via ffuf avec heuristique de bruit et agrégation des chemins filtrés.

## Présentation

**mon-nouveau-recoweb — Découverte web ciblée pour CTF / pentest (ffuf + filtrage de bruit)**

Ce script automatise la reconnaissance web d'une cible (ex. mon-site.htb) en se concentrant
sur ffuf, avec une gestion avancée du “bruit de fond” (404/403 génériques) pour ne conserver
que les chemins intéressants.

Principales étapes :
- Résolution du domaine vers une IP + vérification par ping (cohérence /etc/hosts).
- Scan Nmap interne (-Pn -sV -p-) pour détecter tous les ports TCP exposant du HTTP/HTTPS.
- Pour chaque port HTTP/HTTPS détecté :
    1) Calcul d’une baseline HTTP sur un chemin aléatoire :
       - Requête vers http(s)://IP:PORT/<random> avec en-tête Host: domaine.
       - Récupération du triplet : code HTTP, taille de réponse, nombre de mots.
       - Utilisation de cette baseline pour paramétrer les filtres ffuf (-fs / -fw) contre les faux positifs.

    2) Phase d’échantillonnage (détection du bruit de fond) :
       - Construction d’une mini-wordlist (~10 000 premières entrées de la wordlist principale).
       - Lancement d’un ffuf “échantillon” sur cette mini-wordlist, avec les filtres de baseline.
       - Analyse des résultats CSV pour détecter les combos (status:size) récurrents typiques du bruit
         (ex. 403:199 renvoyé massivement par le serveur).
       - Affichage des combos de bruit détectés pour le port concerné.

    3) Scan ffuf complet (sur la wordlist principale) :
       - Lancement d’un ffuf sur l’ensemble de la wordlist fournie en argument (--master),
         en appliquant :
           * les filtres de baseline (-fs, -fw) issus du chemin aléatoire,
           * les filtres supplémentaires (-fs, -fw) dérivés des combos de bruit détectés à l’étape 2.
       - Export des résultats en CSV par port.

    4) Post-traitement et agrégation :
       - Lecture des CSV ffuf par port.
       - Filtrage logique supplémentaire côté script : exclusion explicite des combos (status:size)
         identifiés comme bruit (ex. 403:199), même s’ils apparaissaient encore dans le CSV.
       - Extraction et normalisation des chemins :
           * Suppression des éventuelles séquences ANSI.
           * Réduction des URL complètes au chemin (/path).
           * Normalisation (lowercase, suppression des / finaux, déduplication).
       - Calcul :
           * du nombre total de chemins bruts (ffuf, après filtrage bruit),
           * du nombre de chemins uniques normalisés.

Wordlist par défaut :
  /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt

Résultats :
  - Affichage à l’écran avec sections détaillées :
      * Résumé global (ports HTTP/HTTPS, compteurs de chemins bruts / uniques).
      * Résultats FFUF par port (baseline utilisée, combos de bruit ignorés, chemins trouvés).
  - Agrégation dans un fichier dans le répertoire mes_scans/ :
      * Si on lance : mon-nouveau-recoweb target.htb
          → mes_scans/scan_repertoires.txt
      * Si on cible un sous-chemin : mon-nouveau-recoweb target.htb/cgi-bin/
          → mes_scans/scan_repertoires_cgi-bin.txt

À propos de dirsearch :
  - Le script détecte la présence de dirsearch, mais dans cette version le lancement de dirsearch
    est volontairement désactivé : seul ffuf est exécuté.
  - Le code est structuré de façon à pouvoir réactiver dirsearch ultérieurement (par exemple pour
    faire un second passage récursif sur les chemins déjà filtrés par ffuf).

## Usage

```
Usage:
mon-nouveau-recoweb <domaine.htb> [options]

Options :
--master FILE     Wordlist (défaut: /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt)
-t N              Threads ffuf (défaut: 50)
--timeout S       Timeout curl (défaut: 8)
--strict          Mode strict (déjà activé par défaut : 200,301,302,403)
--codes LIST      Liste pour ffuf -mc (ex: "200,301,302,403"; priorité sur --strict)
--ext LIST        Extensions ffuf (ex: ".php,.txt,.sh,.cgi,.pl"). Vide = désactivé.
--debug           Affiche les commandes ffuf et conserve les fichiers /tmp
-V, --version     Afficher la version et quitter
-h, --help        Aide

Exemples :
mon-nouveau-recoweb target.htb
mon-nouveau-recoweb target.htb --strict
mon-nouveau-recoweb target.htb/cgi-bin/ --ext ".sh,.cgi,.pl"
```

## Téléchargements

La version courante du script mon-nouveau-recoweb est v1.4.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

