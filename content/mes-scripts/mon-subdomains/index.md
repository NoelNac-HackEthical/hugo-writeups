---
title: "Mon Subdomains"
slug: "mon-subdomains"
description: "Short one-line description du sript mon-subdomains"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
---

Short one-line description du sript mon-subdomains

## Présentation
Présentation de mon script (mon-subdomains).

## Usage
```text
Usage:
mon-subdomains <domaine.htb> [mode] [options]

Modes :
-f, --fast      1000 premières lignes de la master
-m, --medium    2000 premières lignes
-l, --large     5000 (entière)
--custom FILE   Wordlist personnalisée (ignore la master)

Options :
--master FILE     Chemin de la master 5000 (défaut: /usr/share/wordlists/htb-dns-vh-5000.txt)
-t N              Threads ffuf (défaut: 50)
--timeout S       Timeout curl (défaut: 8)
--https           Forcer HTTPS (sinon auto)
--strict          Codes restreints utiles (équiv. à --codes 200,401,403)
--codes LIST      Liste pour ffuf -mc (ex: "200,401,403"; prend le dessus sur --strict)
--save-hosts      Ajoute les vhosts trouvés dans /etc/hosts (backup, sans doublon)
--dry-run-hosts   Simule l’ajout dans /etc/hosts (n’écrit rien)
--debug           Affiche la commande ffuf et garde la sortie brute
-V, --version     Afficher la version et quitter
-h, --help        Aide

Exemples :
mon-subdomains site.htb --fast
mon-subdomains permx.htb --fast --strict
mon-subdomains target.htb --medium --codes 200,403 --save-hosts
```

## Téléchargements

La version courante du script est `mon-subdomains 1.0.4`.

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

