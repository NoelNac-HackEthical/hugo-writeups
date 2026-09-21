---
title: "Mon Nmap"
slug: "mon-nmap"
description: "Automatise l’énumération réseau initiale d’une cible CTF avec plusieurs scans Nmap complémentaires."
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap"
version: "mon-nmap v2.1.3"
---

Automatise l’énumération réseau initiale d’une cible CTF avec plusieurs scans Nmap complémentaires.

## Présentation

**mon-nmap — Énumération réseau initiale pour CTF**

`mon-nmap` automatise la première phase d’énumération réseau d’une cible CTF.

À partir d’une cible unique, le script enchaîne plusieurs scans Nmap
complémentaires afin d’identifier les ports ouverts, les services exposés
et certaines pistes utiles pour la suite de l’analyse.

L’objectif n’est pas simplement de lancer plusieurs commandes Nmap, mais de
conserver une méthode d’énumération reproductible d’une machine à l’autre,
avec des résultats organisés dans des fichiers séparés.

Dans le cas le plus simple :

```bash
mon-nmap cible.htb
```

Le script effectue successivement :

1. un pré-check TCP de la cible ;
2. un scan complet des ports TCP ;
3. une énumération ciblée FTP / SMB si ces services sont détectés ;
4. un scan agressif sur les ports ouverts ;
5. un scan orienté CMS ;
6. un scan UDP des ports les plus courants.

Les résultats sont stockés dans :

```text
scans_nmap/<cible>/
```

avec notamment :

```text
full_tcp_scan.txt
enum_ftp_smb_scan.txt
aggressive_vuln_scan.txt
cms_vuln_scan.txt
udp_vuln_scan.txt
```

Le pré-check permet de vérifier rapidement que la cible répond sur les ports
TCP couramment rencontrés dans les environnements CTF avant de lancer les scans.

## Usage

```
mon-nmap  v2.1.3
Usage:
mon-nmap <IP_OU_DOMAINE>

Lance l’énumération réseau initiale d’une cible CTF avec plusieurs
scans Nmap complémentaires.

Étapes principales :
1. Pré-check TCP de la cible
2. Scan complet des ports TCP
3. Énumération ciblée FTP / SMB si détectés
4. Scan agressif sur les ports ouverts
5. Scan orienté CMS
6. Scan UDP des ports les plus courants

Les résultats sont enregistrés dans :
scans_nmap/<cible>/

Options:
-h, --help       Affiche cette aide
-V, --version    Affiche la version
--debug          Active le mode debug

Exemples:
mon-nmap 10.10.10.14
mon-nmap cible.htb
```

## Code source Github

Tous les scripts HackEthical sont disponibles sur le dépôt GitHub `mes-scripts` :

https://github.com/NoelNac-HackEthical/mes-scripts

## Téléchargements

La version courante du script mon-nmap est v2.1.3

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

