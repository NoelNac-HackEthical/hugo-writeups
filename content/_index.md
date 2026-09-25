---
title: "Writeups Hack The Box en français"
description: "Résolutions pédagogiques en français de machines Hack The Box, pour comprendre la méthode et le raisonnement qui mènent de l’énumération jusqu’à root."
draft: false
---

**writeups.hackethical.be** est un site personnel consacré aux writeups Hack The Box en français.

## Des writeups, mais pas seulement

**Les writeups constituent le cœur du site, mais l’objectif va plus loin que de fournir une suite d’instructions à reproduire pour obtenir `user.txt` puis `root.txt` : il s’agit de t’aider à comprendre la méthode et le raisonnement qui mènent à la solution.**

J’explique cette démarche plus en détail dans mon article Medium [Pourquoi encore publier des writeups Hack The Box, et en français ?](https://medium.com/@noelnac_hackethical_be/pourquoi-encore-publier-des-writeups-hack-the-box-et-en-fran%C3%A7ais-72956f34fc35).

Pour cela, chaque résolution explique le raisonnement suivi : comment analyser les informations recueillies, les interpréter, repérer les éléments qui méritent ton attention, formuler une piste, la vérifier et exploiter une faiblesse identifiée.

Les writeups, scripts et recettes sont pensés pour fonctionner ensemble. Issus directement des résolutions, ils constituent une boîte à outils dans laquelle tu peux retrouver et réutiliser les méthodes et techniques rencontrées au fil des machines.

Et si tu veux en savoir plus sur moi, consulte ma page [À propos](/a-propos/).

## Méthodologie appliquée

Les writeups suivent une démarche méthodique et reproductible utilisée dans les environnements CTF et en sécurité offensive :

1. **Énumération** des services et ressources exposés
2. **Analyse et exploration** des informations recueillies
3. **Identification et vérification des pistes intéressantes**
4. **Exploitation d’une faiblesse et prise pied** sur la machine
5. Stabilisation du shell pour obtenir un accès interactif fiable
6. **Escalade de privilèges** (sudo, SUID, capabilities, services locaux, cron, etc.)

## Catalogue des writeups

Retrouve dans le catalogue l’ensemble des machines Hack The Box publiées sur mon site **writeups.hackethical.be**.

Le catalogue regroupe les writeups en deux parties : **Apprentissage**, avec des machines Easy, et **Mise en pratique**, avec des machines Medium. Chaque résolution explique le raisonnement suivi de l’énumération initiale jusqu’à l’escalade de privilèges vers root.

Tu peux consulter ici le [catalogue complet des writeups](/writeups/).

Voici les quatre derniers writeups publiés :
