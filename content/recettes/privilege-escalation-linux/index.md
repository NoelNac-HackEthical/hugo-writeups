---
title: "Méthode de Privilege Escalation sous Linux"
description: "Méthodologie structurée pour identifier les pistes d’escalade de privilèges sur un système Linux."
tags: ["recettes","tools","privilege-escalation","linux"]
categories: ["Mes recettes"]
date: 2026-01-15T10:49:40+01:00
lastmod: 2026-01-15T10:49:40+01:00
---

## Objectif

- Identifier méthodiquement les possibilités d’escalade de privilèges.
- Ne rater aucune piste classique (sudo, SUID, cron, services).
- Comprendre *pourquoi* une élévation est possible avant de tenter une exploitation.

---

## Prérequis

- Un accès shell sur une machine Linux (CTF / HTB).
- La possibilité de transférer ou d’exécuter des outils d’énumération locaux.
- Un compte utilisateur non-root.

---

## Étapes

### Préparer

Avant toute tentative d’escalade, commence par stabiliser ton contexte de travail et identifier précisément ton utilisateur.

```bash
whoami
id
hostname
uname -a

```

### Implémenter

Voici la méthode générique que tu peux utiliser pour identifier les pistes de *privilege escalation* sur un système Linux.
Cette approche s'inspire en partie de l'article *[Linux Privilege Escalation: Automated Script](https://www.hackingarticles.in/linux-privilege-escalation-automated-script/)*, mais repose surtout sur une lecture critique des résultats.


1. sudo -l

2. [pspy64](https://thm-solutions.hackethical.be/outils#id-4.-pspy64)
3. getcap -r / 2>/dev/null

4. [suid3num.py](https://github.com/Anon-Exploiter/SUID3NUM/tree/master)
5. [les.sh](https://github.com/The-Z-Labs/linux-exploit-suggester)
6. [linpeas.sh](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS)

Les commandes et outils ci-dessous sont utilisés dans un ordre intentionnel, allant des vérifications les plus directes aux analyses plus transversales.

> **Note**  
> Par défaut, utilise `pspy64`.  
> Ne bascule vers `pspy32` que si le système est *explicitement* en 32 bits (`uname -m`).

### Utiliser

- Lance les commandes **dans cet ordre**.
- Note chaque anomalie ou configuration inhabituelle.
- Croise les résultats entre outils avant de conclure.
- Prends le temps de comprendre le mécanisme avant toute exploitation.

### Résultats

- Une identification claire des pistes d’escalade réellement exploitables.
- Aucune dépendance à un outil “magique”.
- Une méthode reproductible, idéale pour documenter proprement un writeup HTB.
