---
title: "Mon New Recoweb"
slug: "mon-new-recoweb"
description: "Recon web stable multi-vhosts: watchdog ferox fiabilisé (idle effectif loggué + clamp TIMEOUT*10 explicite), aperçus deep-scan toujours remplis, nettoyage du bruit (/%%3Fq), anti-orphelins PGID, an"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-new-recoweb"
version: "1.0.12"
---

Recon web stable multi-vhosts: watchdog ferox fiabilisé (idle effectif loggué + clamp TIMEOUT*10 explicite), aperçus deep-scan toujours remplis, nettoyage du bruit (/%%3Fq), anti-orphelins PGID, an

## Présentation

**mon-new-recoweb — Recon web stable (CTF/HTB)**

v1.0.12 :
- Watchdog ferox : idle réellement explicité (idle demandé vs idle effectif, clamp TIMEOUT*10 visible)
- Deep-scan : aperçus “top /path” corrigés (plus jamais vides)
- Nettoyage du bruit Drupal (/%%3Fq) dans les résultats ferox
- Comportement idle cohérent entre global / deep / override CLI
- Aucune régression sur ffuf silencieux, anti-orphelins (PGID) et anti-double-run

## Téléchargements

La version courante du script mon-new-recoweb est 1.0.12

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-new-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-new-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

