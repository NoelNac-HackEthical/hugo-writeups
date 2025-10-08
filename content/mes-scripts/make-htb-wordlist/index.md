---
title: "make-htb-wordlist"
description: "Short one-line description du sript make-htb-wordlist"
tags: ["scripts","tools"]
script_file: "make-htb-wordlist"
version: "make-htb-wordlist 1.0.4"
---

Short one-line description du sript make-htb-wordlist

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

```
Usage:
/work/make-htb-wordlist [--out FILE] [--no-install] [--no-medium] [--minlen N] [--maxlen N] [--allow-digit-start] [-V|--version] [-h|--help]

Par défaut : --out /usr/share/wordlists/htb-dns-vh-5000.txt

Options:
--out FILE           Chemin de sortie (défaut: /usr/share/wordlists/htb-dns-vh-5000.txt)
--no-install         Ne pas tenter d'installer seclists automatiquement
--no-medium          Ne pas inclure raft-medium-words.txt
--minlen N           Longueur minimale (défaut: 3)
--maxlen N           Longueur maximale (défaut: 24)
--allow-digit-start  Autoriser un début par chiffre
-V, --version        Afficher la version et quitter
-h, --help           Afficher cette aide et quitter
```

## Téléchargements

La version courante du script est make-htb-wordlist 1.0.4

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/make-htb-wordlist.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

