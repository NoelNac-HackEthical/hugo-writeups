---
title: "Mon Subdomains"
slug: "mon-subdomains"
description: "Découverte de sous-domaines par vhost-fuzzing (ffuf) avec baseline anti-wildcard, modes fast/medium/large et options d'ajout dans /etc/hosts."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-subdomains"
version: "/work/mon-subdomains: line 13: syntax error near unexpected token `<<<'"
---

Découverte de sous-domaines par vhost-fuzzing (ffuf) avec baseline anti-wildcard, modes fast/medium/large et options d'ajout dans /etc/hosts.

## Présentation

**mon-subdomains — Découverte de vhosts pour CTF / pentest**

Ce script automatise la recherche de sous-domaines en se basant sur du vhost-fuzzing :
il teste des noms Host.FQDN en interrogeant l'IP cible via ffuf et extrait les hôtes
valides (ex. api.mon-site.htb, admin.mon-site.htb). La recherche se fait soit à partir
d'une "master" orientée HTB soit via une wordlist custom.

<<<<<<< HEAD
Principe de fonctionnement et sécurité :
- sampling master : le script propose trois modes (fast/medium/large) qui utilisent
  respectivement les 1000 / 2000 / 5000 premières lignes de la master (head) — rapide
  vs exhaustif selon le besoin ;
- anti-wildcard / baseline : il établit une baseline (code HTTP, taille, nombre de mots)
  via un Host aléatoire pour filtrer les faux positifs (wildcards) en ajoutant -fs / -fw ;
- sauvegarde / dry-run : l'option --save-hosts tente d'ajouter les hôtes trouvés dans
  /etc/hosts (création d'un backup) ; --dry-run-hosts affiche ce qui serait ajouté
  sans écrire (utile et conseillé avant toute modification système).

Options pratiques et recommandations :
- par défaut la master est : /usr/share/wordlists/htb-dns-vh-5000.txt (modifiable via --master) ;
- mode FAST/MEDIUM/LARGE : choisir FAST en reconnaissance rapide, LARGE uniquement en lab ;
- --strict / --codes : pour restreindre les codes HTTP retenus (ex. 200,401,403) et diminuer le bruit ;
- --https / auto-detection : le script détecte automatiquement http/https mais on peut forcer ;
- pour que le fuzzing vhost fonctionne, il faut que l'IP cible soit résolue — ajoute l'entrée
  dans /etc/hosts si nécessaire (ou utiliser --save-hosts après vérification).

Règles d'or :
- commencer en fast, valider manuellement les hôtes trouvés, puis relancer medium/large en lab ;
- ne pas activer --save-hosts sans vérification (préférer --dry-run-hosts pour contrôler) ;
- adapter threads/timeout selon l'environnement pour éviter les blocages ou détections.

Exemples :
  mon-subdomains mon-site.htb --fast
  mon-subdomains mon-site.htb --medium --strict --save-hosts
  mon-subdomains mon-site.htb --custom /chemin/ma-liste.txt --https --dry-run-hosts

Présentation concise : outil de vhost-fuzzing robuste, conçu pour produire une liste
de sous-domaines exploitables et facilement vérifiables pour inclusion dans un writeup.
=======
>>>>>>> 0e609c608f43fb01c256429ad4d1704c860dea28

## Usage

```
/work/mon-subdomains: line 13: syntax error near unexpected token `<<<'
/work/mon-subdomains: line 13: `<<<<<<< HEAD'
/work/mon-subdomains: line 13: syntax error near unexpected token `<<<'
/work/mon-subdomains: line 13: `<<<<<<< HEAD'
```

## Téléchargements

La version courante du script mon-subdomains est `<<<'

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

