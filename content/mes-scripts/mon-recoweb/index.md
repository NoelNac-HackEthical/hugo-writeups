---
title: "Mon Recoweb.bak"
slug: "mon-recoweb.bak"
description: "Automatise la découverte de répertoires et fichiers web (whatweb + ffuf) et génère des résumés structurés pour les writeups."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb.bak"
version: "mon-recoweb.bak 1.0.0"
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
- sorties : tout est écrit dans un dossier dédié `mon-recoweb_<cible>` (ex. mon-recoweb_mon-site.htb)
  avec au minimum : whatweb.txt, summary_dirs.txt, summary_files.txt ;
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
Usage: mon-recoweb <IP|HOST|URL> [options]
-x <exts>       Extensions (def: php,html,txt)
-w <wordlist>   Wordlist (def: /usr/share/wordlists/dirb/common.txt)
-T <threads>    Threads ffuf (def: 40)
-p <rate>       Tempo ffuf (ex: 50ms)
-o <outdir>     Dossier de sortie (def: mon-recoweb_<target>)
--http | --https
--no-filters    Désactive -fs auto et -fc 404
-V, --version   Afficher la version et quitter
-h, --help      Afficher cette aide et quitter
```

## Téléchargements

La version courante du script mon-recoweb est 1.0.0

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.bak" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.bak.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

