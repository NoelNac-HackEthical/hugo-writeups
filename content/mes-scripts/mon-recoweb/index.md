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

Short one-line description du sript mon-recoweb

## Présentation
Titre court de présentation (facultatif)

Un paragraphe d’introduction sur ce que fait le script.
Tu peux laisser des lignes vides pour aérer.

- Points principaux en liste à puces
- Chaque point commence par un tiret `-`
- Pas besoin d’indentation spéciale

1. Tu peux aussi faire des listes numérotées
2. Il suffit de commencer la ligne par `1.`, `2.`, etc.

Exemple rapide d’usage en texte :
`mon-script --option valeur`

Astuce : on peut mettre un mot en *italique* ou en **gras** si ton rendu Hugo l’autorise.

## Usage
```text
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

La version courante du script est `mon-recoweb 1.0.4`.

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-recoweb.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

