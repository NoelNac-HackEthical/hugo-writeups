---
title: "Mon Recoweb"
slug: "mon-recoweb"
description: "Short one-line description du sript mon-recoweb"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
---

## Usage

```
  cat <<EOF
${C_B}Usage:${C_RST} mon-recoweb <IP|HOST|URL> [options]
  -x <exts>       Extensions (def: ${EXTS})
  -w <wordlist>   Wordlist (def: ${WORDLIST})
  -T <threads>    Threads ffuf (def: ${THREADS})
  -p <rate>       Tempo ffuf (ex: 50ms)
  -o <outdir>     Dossier de sortie (def: mon-recoweb_<target>)
  --http | --https
  --no-filters    Désactive -fs auto et -fc 404
  -V, --version   Afficher la version et quitter
  -h, --help      Afficher cette aide et quitter
EOF
```

## Télécharger le script

<p class="version-line">
  La version courante du script est <code>1.0.1</code>
</p>

<div class="dl-row">
  <a href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" class="he-btn he-btn--neutral">Télécharger la version courante</a>
  <a href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" class="he-btn he-btn--sm he-btn--neutral">SHA256</a>
</div>

<p><a href="https://github.com/NoelNac-HackEthical/mes-scripts">Voir le dépôt mes-scripts sur GitHub</a></p>

> Cette page est générée automatiquement à partir des releases de **mes-scripts** (liens par défaut vers `latest`).
