---
title: "Mon Recoweb"
slug: "mon-recoweb"
description: "Automatise la découverte de répertoires et fichiers web (whatweb + ffuf) et génère des résumés structurés pour les writeups."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb"
version: "/work/mon-recoweb: line 170: syntax error near unexpected token `('"
---

Automatise la découverte de répertoires et fichiers web (whatweb + ffuf) et génère des résumés structurés pour les writeups.

## Présentation

**mon-recoweb — Découverte web ciblée pour CTF / pentest**

Ce script automatise la reconnaissance web d'une cible (ex. mon-site.htb) : il lance
d'abord une identification de surface avec WhatWeb, puis plusieurs passes de fuzzing
avec ffuf pour détecter répertoires et fichiers intéressants (par extension).

Principes et usages (tutoriel succinct) :
- passe 1 : identification rapide (WhatWeb) pour orienter les tests ;
- passe 2 : fuzzing "common" (wordlist courte) pour trouver rapidement les chemins fréquents ;
- passe 3 : tests par extension (ex. .php, .html, .txt) pour capturer fichiers référencés ;
- optionnel : passe étendue (wordlist exhaustive) — à réserver au lab car elle est
  plus lente et bruyante (risque de bannissement / WAF).

Comportement concret :
- filtres automatiques : le script essaie de déduire des tailles de pages d'erreur et
  applique -fs / -fc 404 par défaut ; tu peux désactiver via --no-filters ;
- sorties : un fichier unique `mes_scans/scan_repertoires.txt` contient la synthèse complète
  (WhatWeb, répertoires, fichiers) pour la dernière cible analysée ;
- options usuelles : changer la wordlist (-w), limiter la vitesse (-p), définir les extensions (-x),
  forcer http/https (--http / --https) ou ajuster le nombre de threads (-T).

Bonnes pratiques :
- commencer toujours par la passe courte, trier/valider manuellement les résultats,
  puis lancer une passe étendue uniquement si le contexte le permet (lab, autorisation, etc.) ;
- adapter la tempo et le nombre de threads en fonction de la cible pour éviter les blocages.

Exemple d'usage :
  ./mon-recoweb mon-site.htb
  ./mon-recoweb --no-filters -w /chemin/ma-liste.txt -x php,html -T 60 mon-site.htb

Présentation concise : outil de reconnaissance web conçu pour produire des résultats
exploitables immédiatement et faciles à inclure dans un writeup.

## Usage

```
/work/mon-recoweb: line 170: syntax error near unexpected token `('
/work/mon-recoweb: line 170: syntax error near unexpected token `('
```

## Téléchargements

La version courante du script mon-recoweb est `('

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

