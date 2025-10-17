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
version: "mon-subdomains 1.0.0"
---

Découverte de sous-domaines par vhost-fuzzing (ffuf) avec baseline anti-wildcard, modes fast/medium/large et options d'ajout dans /etc/hosts.

## Présentation

**mon-subdomains — Découverte de vhosts pour CTF / pentest**

Ce script automatise la recherche de sous-domaines en se basant sur du vhost-fuzzing :
il teste des noms Host.FQDN en interrogeant l'IP cible via ffuf et extrait les hôtes
valides (ex. api.mon-site.htb, admin.mon-site.htb). La recherche se fait soit à partir
d'une "master" orientée HTB soit via une wordlist custom.

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
  ./mon-subdomains mon-site.htb --fast
  ./mon-subdomains mon-site.htb --medium --strict --save-hosts
  ./mon-subdomains mon-site.htb --custom /chemin/ma-liste.txt --https --dry-run-hosts

Présentation concise : outil de vhost-fuzzing robuste, conçu pour produire une liste
de sous-domaines exploitables et facilement vérifiables pour inclusion dans un writeup.

## Usage

```
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

La version courante du script est mon-subdomains 1.0.0

<div class="dl-row">
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}
  {{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}
</div>

