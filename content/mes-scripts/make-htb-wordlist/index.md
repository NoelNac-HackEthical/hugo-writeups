---
title: "make-htb-wordlist"
slug: "make-htb-wordlist"
draft: false
---

> Short one-line description du sript make-htb-wordlist

<!--more-->

## Version
`make-htb-wordlist 1.0.4`

```text
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

