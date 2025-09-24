---
title: "mon-recoweb"
description: "Outil d’énumération Web : fingerprint (WhatWeb) + fuzz de répertoires (FFUF) avec filtrage par extensions."
draft: false
tags: ["scripts","recon","web","ffuf","whatweb"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true

# Aide/usage affiché dans le bloc encadré (coller la vraie sortie -h de ton script si différent)
usage: |
  mon-recoweb -u <URL> [options]

  Options:
    -u, --url <URL>           Cible (ex: https://target.tld)
    -w, --wordlist <FILE>     Wordlist FFUF (défaut: /usr/share/wordlists/dirb/common.txt)
    --ext php,html,txt        Extensions à tester (CSV)
    --rate 50                 Limite de requêtes/s (throttle)
    --proxy http://127.0.0.1:8080   Proxy (ex: Burp)
    -o, --output <DIR>        Dossier de sortie (rapports)
    -t, --threads 40          Threads pour FFUF (défaut: 40)
    -H, --header "K: V"       En-tête HTTP supplémentaire (répétable)
    -k, --insecure            Ignorer erreurs TLS
    -h, --help                Afficher cette aide

  Exemples:
    mon-recoweb -u https://target.tld --ext php,txt
    mon-recoweb -u https://target.tld -w ./lists/dirs.txt --rate 30 -o out/target


---

**Outil d’énumération Web** : fingerprint rapide (WhatWeb) + fuzzing de répertoires (FFUF) avec filtres par extensions pour réduire le bruit.

<!-- USAGE -->

## Télécharger le script

<p class="version-line">
  La version courante du script est
  {{< script_version repo="NoelNac-HackEthical/mes-scripts" script="mon-recoweb" >}}
</p>

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/download/v1.0.1/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>





## Installation

1. Copier le script dans `~/bin` (ou un dossier du `$PATH`) puis le rendre exécutable :

   ```bash
   install -m 0755 mon-recoweb ~/bin/mon-recoweb
   ```

2. Prérequis : `whatweb`, `ffuf`.  
   Sous Debian/Kali :

   ```bash
   sudo apt install whatweb ffuf
   ```

## Utilisation rapide

- Cible simple :

  ```bash
  mon-recoweb -u https://target.tld --ext php,html,txt
  ```

- Avec wordlist et proxy Burp :

  ```bash
  mon-recoweb -u https://target.tld -w /usr/share/wordlists/dirb/common.txt --proxy http://127.0.0.1:8080
  ```

- Throttle + export :

  ```bash
  mon-recoweb -u https://target.tld --rate 30 -o out/target
  ```

## Sorties

- Résumé WhatWeb (versions/CMS/plugins)  
- FFUF : chemins découverts, codes HTTP, tailles, éventuellement sauvegardés dans `-o/--output`.

## Astuces

- Ajuster `--ext` selon le contexte (ex : `php,asp,aspx,txt`).
- Utiliser `--rate` pour limiter le bruit et rester discret.
- Ajouter des en-têtes avec `-H "Cookie: …"` si la cible requiert une session.
- 