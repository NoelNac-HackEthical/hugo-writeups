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
version: "2.1.1"
---

Découverte de sous-domaines par vhost-fuzzing (ffuf) avec baseline anti-wildcard, modes fast/medium/large et options d'ajout dans /etc/hosts.

## Présentation

**mon-subdomains — Découverte de vhosts pour CTF / pentest**

Ce script automatise la recherche de sous-domaines en se basant sur du vhost-fuzzing :
il teste des noms Host.FQDN en interrogeant l'IP cible via ffuf et extrait les hôtes
valides (ex. api.mon-site.htb, admin.mon-site.htb). La recherche se fait soit à partir
d'une "master" orientée HTB soit via une wordlist custom.

Fonctionnement :
- Résolution de l'IP du domaine (getent/dig) et ping pour vérifier /etc/hosts.
- Scan Nmap interne (-Pn -sV -p-) pour détecter tous les ports HTTP/HTTPS.
- VHOST fuzzing via ffuf sur chacun de ces ports (Host: FUZZ.domaine.htb).
- Résultats agrégés dans mes_scans/scan_vhosts.txt, avec un bloc par domaine.

## Téléchargements

La version courante du script mon-subdomains est 2.1.1

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-subdomains.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

