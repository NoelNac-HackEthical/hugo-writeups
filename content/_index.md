---
title: "Writeups Hack The Box en français"
description: "Résolutions pédagogiques de machines Hack The Box Linux, de l’énumération jusqu’à l’escalade de privilèges vers root."
draft: false
---

**writeups.hackethical.be** est un site personnel consacré aux writeups Hack The Box en français.

## Comprendre la méthode, pas seulement suivre la solution

Ici, un writeup n’est pas conçu comme une simple suite d’instructions à reproduire pour obtenir user.txt puis root.txt.

L’objectif est de t’expliquer le raisonnement suivi pendant la résolution : comment analyser les informations recueillies, interpréter les résultats d’une énumération, identifier les pistes intéressantes, valider une hypothèse et exploiter une faiblesse identifiée.

Chaque résolution cherche ainsi à t’aider à construire une démarche réutilisable sur d’autres challenges CTF, plutôt qu’à te fournir uniquement la solution d’une machine particulière.

Les writeups sont complétés par des scripts, recettes et références issus directement des résolutions. Ils constituent une boîte à outils dans laquelle tu peux retrouver et réutiliser les techniques rencontrées au fil des machines.

Tu peux en savoir plus sur ma démarche dans la page [À propos](/a-propos/).



## Méthodologie appliquée

Les writeups suivent une démarche méthodique et reproductible utilisée dans les environnements CTF et en sécurité offensive :

1. **Énumération complète** des services exposés
2. Analyse des versions et identification des surfaces d’attaque
3. **Exploitation de la vulnérabilité et prise pied** sur la machine
4. Stabilisation du shell pour obtenir un accès interactif fiable
5. **Escalade de privilèges** (sudo, SUID, capabilities, services locaux, cron, etc.)
6. Synthèse pédagogique des points clés

**Chaque étape est expliquée afin de permettre aux débutants en hacking éthique et en CTF de comprendre les techniques utilisées plutôt que de simplement reproduire des commandes.**

## Catalogue des writeups

Retrouve dans le catalogue l’ensemble des machines Hack The Box publiées sur mon site **writeups.hackethical.be**.

Chaque article propose une résolution complète et pédagogique d’une machine Hack The Box, de l’énumération initiale jusqu’à l’escalade de privilèges vers root.

Tu peux consulter ici le [catalogue complet des writeups](/writeups/).

En attendant, voici les quatre derniers writeups publiés :
