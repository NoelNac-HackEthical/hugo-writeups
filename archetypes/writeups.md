---
title: "{{ replace .Name "-" " " | title }}"
slug: "{{ .Name }}"
description: "Résumé court de l'outil."
date: {{ .Date }}
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true

# Colle ici la vraie sortie du -h du script (multi‑ligne)
usage: |
  {{ .Name }} -h
  # Remplace ce bloc par la sortie réelle de --help

# Optionnels (override au cas par cas dans chaque page)
# repo: "NoelNac-HackEthical/mes-scripts"   # si différent un jour
# asset_name: "{{ .Name }}"                  # ex: "make-htb-wordlist.sh"
# binary_name: "{{ .Name }}"                 # ex: "make-htb-wordlist" (sans extension)
version: "0.0.1"
---

**Description** : une phrase ou deux sur l'objectif du script.

<p class="version-line">
  La version courante du script est
  {{< script_version repo="NoelNac-HackEthical/mes-scripts" script="{{ .Name }}" >}}
</p>

## Télécharger le script

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/{{ .Params.asset_name | default .Name }}" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/{{ .Params.asset_name | default .Name }}.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

## Installation

1. Copier le script dans `~/bin` (ou tout dossier du `$PATH`) puis le rendre exécutable :
```bash
install -m 0755 {{ .Params.asset_name | default .Name }} ~/bin/{{ .Params.binary_name | default .Name }}
```

2. (Optionnel) vérifier la version :
```bash
{{ .Params.binary_name | default .Name }} --version
```

## Utilisation rapide

<!-- USAGE -->

## Sorties

- Décris brièvement les fichiers produits par le script (ex.: `report.txt`, `wordlist.txt`, etc.).

## Astuces

- Conseils d'utilisation (flags importants, limites, bonnes pratiques).
