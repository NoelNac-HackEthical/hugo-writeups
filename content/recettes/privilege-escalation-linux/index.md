---
title: "Privilege Escalation Linux — Méthode structurée pour CTF et HTB"
description: "Méthode de privilege escalation sous Linux : approche structurée et pédagogique pour identifier les pistes d’escalade de privilèges en CTF et HackTheBox."
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

Voici une méthode générique que tu peux utiliser pour identifier les pistes de *privilege escalation* sur un système Linux, inspirée en partie de l'article *[Linux Privilege Escalation: Automated Script](https://www.hackingarticles.in/linux-privilege-escalation-automated-script/)*.


1. **sudo -l**  
   Vérifie les droits sudo de ton utilisateur et les commandes éventuellement exécutables avec des privilèges élevés.

2. [**pspy64**](https://thm-solutions.hackethical.be/outils#id-4.-pspy64) 

   Observe en temps réel les processus lancés sur le système afin de repérer des scripts ou tâches exécutés par des comptes privilégiés, notamment root.

3. **getcap -r / 2>/dev/null** 

   Identifie des permissions spéciales (*Linux capabilities*) qui peuvent permettre à certains programmes d’agir comme root, sans utiliser sudo.

4. [**suid3num.py**](https://github.com/Anon-Exploiter/SUID3NUM/tree/master) 
   Énumère les binaires SUID et met en évidence ceux connus pour être exploitables.
5. [**les.sh**](https://github.com/The-Z-Labs/linux-exploit-suggester) 
   Réalise une enumération locale globale afin d’identifier des configurations faibles ou inhabituelles.
6. [**linpeas.sh**](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS) 
   Effectue une analyse approfondie du système et centralise les principales pistes d’escalade potentielles.

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
