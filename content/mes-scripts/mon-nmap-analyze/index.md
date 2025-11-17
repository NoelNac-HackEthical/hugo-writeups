---
title: "Mon Nmap Analyze"
slug: "mon-nmap-analyze"
description: "Analyse les sorties de mon-nmap et agrège les vulnérabilités/indicateurs en TXT/MD/JSON. Exclut les HIGH dont Evidence"
draft: false
tags: ["scripts","tools"]
categories: ["Mes scripts"]
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
repo: "NoelNac-HackEthical/mes-scripts"
script_file: "mon-nmap-analyze"
version: "1.0.5"
---

Analyse les sorties de mon-nmap et agrège les vulnérabilités/indicateurs en TXT/MD/JSON. Exclut les HIGH dont Evidence

## Présentation

Mon-Nmap-Analyze — agrégation des vulnérabilités détectées par Nmap/NSE

Ce script lit les fichiers produits par `mon-nmap` (2-aggressive_scan.txt, 4-nse-*.txt)
et remonte les marqueurs typiques :
- blocs **VULNERABLE** (scripts --script=vuln) — Evidence normalisée en `VULNERABLE`,
- méthodes HTTP risquées (PUT/DELETE/TRACE/TRACK),
- indices de chiffrement SSL/TLS faibles (RC4/MD5/SHA1/SSLv2/SSLv3/3DES/SWEET32/weak/deprecated),
- vulnérabilité SMB **MS17-010 (EternalBlue)**.

Génère (même ordre de tri pour les 3 formats) :
- `vulns.txt` (Count, Title, Severity, Evidence, Ports, Services, Sources),
- `vulns.md` (prêt pour Hugo),
- `vulns.json` (structuré).

EXCLUSION : les entrées `HIGH` dont `Evidence` == "VULNERABLE" sont filtrées des trois sorties.

Tri: Severity(HIGH>MEDIUM>LOW>INFO>autres) → Count(desc) → Title(asc)

Exemple :
  mon-nmap 10.10.10.10 && mon-nmap-analyze 10.10.10.10
  mon-nmap-analyze --dir nmap_10.10.10.10

## Téléchargements

La version courante du script mon-nmap-analyze est 1.0.5

<div class="dl-row" style="display:flex; align-items:center; flex-wrap:wrap">
  <span style="display:inline-block; margin-right:.8rem; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap-analyze" text="Télécharger la version courante" class="he-btn--neutral" >}}</span>
  <span style="display:inline-block; margin-bottom:.4rem;">{{< btn href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap-analyze.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" >}}</span>
</div>

