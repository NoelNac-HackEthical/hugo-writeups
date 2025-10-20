---
title: "Mon Recoweb Analyze"
slug: "mon-recoweb-analyze"
description: "Analyse les sorties de mon-recoweb et produit summary.txt et summary.md"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-recoweb-analyze"
version: "mon-recoweb-analyze v1.0.1"
---

Analyse les sorties de mon-recoweb et produit summary.txt et summary.md

## Présentation

mon-recoweb-analyse — Agrège whatweb.txt + summary_dirs.txt + summary_files.txt
Produit deux fichiers lisibles pour inclusion dans un writeup :
 - summary.txt (plain text, compact)
 - summary.md  (markdown, structuré pour Hugo)
Usage:
  mon-recoweb-analyze <outdir>
  mon-recoweb-analyze --target <outdir>
  mon-recoweb-analyze            # tente d'inférer le dernier mon-recoweb_* dans PWD
Intégration rapide : appeler 'mon-recoweb-analyze "${OUTDIR}"' depuis mon-recoweb lorsque
l'utilisateur passe l'option --analyze.

## Usage

```
mon-recoweb-analyze  v1.0.1
/work/mon-recoweb-analyze: line 37: usage: command not found
mon-recoweb-analyze v1.0.1
/work/mon-recoweb-analyze: line 37: usage: command not found
```

## Téléchargements

La version courante du script mon-recoweb-analyze est v1.0.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb-analyze" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb-analyze.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

