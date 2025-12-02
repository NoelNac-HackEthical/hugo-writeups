---
title: "Mon Nouveau Recoweb"
slug: "mon-nouveau-recoweb"
description: "Scan HTTP/HTTPS (nmap) + ffuf + whatweb + dirsearch sur une cible"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nouveau-recoweb"
version: "mon-nouveau-recoweb v1.0.0"
---

Scan HTTP/HTTPS (nmap) + ffuf + whatweb + dirsearch sur une cible

## Présentation

Outil d’énumération Web complet :

- Ping + résolution IP
- Détection des ports HTTP/HTTPS via Nmap (-sV)
- ffuf (répertoires + extensions .php,.txt)
- whatweb (fingerprinting rapide)
- dirsearch (capturé via script(1), parsing stable)

Résumé final ajouté dans mes_scans/scan_repertoires.txt

## Usage

```
mon-nouveau-recoweb  v1.0.0
Usage: mon-nouveau-recoweb <cible>
```

## Téléchargements

La version courante du script mon-nouveau-recoweb est v1.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nouveau-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

