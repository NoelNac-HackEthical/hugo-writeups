---
title: "Privilege Escalation Linux — Méthode structurée pour CTF et HTB"
description: "Guide complet de privilege escalation Linux pour CTF et Hack The Box : sudo, SUID, capabilities, services locaux, linpeas et kernel exploit."
tags: ["recettes","tools","privilege-escalation"]
categories: ["Mes recettes"]
date: 2026-01-15T10:49:40+01:00
---

## Objectif

- Identifier méthodiquement les possibilités d’escalade de privilèges.
- Ne rater aucune piste classique (sudo, SUID, cron, services).
- Comprendre *pourquoi* une élévation est possible avant de tenter une exploitation.

## Prérequis

- Un accès shell sur une machine Linux (CTF / HTB).
- La possibilité de transférer ou d’exécuter des outils d’énumération locaux.
- Un compte utilisateur non-root.

## Préparation des outils d’énumération

Avant de lancer l’analyse, installe les outils nécessaires sur ta machine Kali et transfère-les vers la cible.

Outils recommandés :

- [suid3num.py](https://github.com/Anon-Exploiter/SUID3NUM/tree/master)
- [linpeas.sh](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS)
- [pspy64](https://thm-solutions.hackethical.be/outils#id-4.-pspy64)
- [les.sh](https://github.com/The-Z-Labs/linux-exploit-suggester)

Avec l'aide de la recette {{< recette "copier-fichiers-kali" >}}, transfère-les vers :

- /dev/shm (mémoire volatile, souvent discret)
- /tmp

>Pourquoi /dev/shm ou /tmp ?
>
>- Écriture autorisée pour l’utilisateur
>- Nettoyage automatique au reboot
>- Moins intrusif que /home
>- Standard en CTF

Une fois sur la machine cible, rends-les exécutables :

```bash
cd /dev/shm
chmod +x linpeas.sh
chmod +x pspy64
chmod +x les.sh
```



## Méthode structurée

L’ordre est intentionnel : commence par les vecteurs simples avant les outils lourds.

### Contexte utilisateur

Commence toujours par comprendre où tu te trouves.

```bash
whoami
id
pwd
uname -a
hostname
```

À analyser :

- Ton utilisateur
- Les groupes
- La version du noyau
- Indices de containerisation
- Architecture (utile pour les binaires 32/64 bits)

### Vérification sudo

```bash
sudo -l
```

Points clés :

- NOPASSWD
- Commandes exécutables en root
- Binaires custom
- Scripts modifiables
- Variables d’environnement autorisées

Si une commande exploitable apparaît ici, c’est prioritaire.

### Permissions spéciales (Capabilities & SUID)

#### Capabilities

```bash
getcap -r / 2>/dev/null
```

Cherche :

- cap_setuid
- cap_setgid
- cap_sys_admin
- Tout binaire inattendu

#### SUID avec suid3num.py

```bash
python3 suid3num.py
```

Ou :

```bash
find / -perm -4000 -type f 2>/dev/null
```

Analyse :

- Binaires inhabituels
- Scripts root modifiables
- PATH hijacking possible

Pour chaque binaire suspect, vérifie sur GTFOBins.



> **Astuce CTF**
> Après l’exécution de `getcap -r / 2>/dev/null` ou/et de `suid3num.py`, consulte **[GTFOBins](https://gtfobins.org/)** pour chaque binaire suspect afin de vérifier s’il existe une technique d’exploitation connue.

### Services locaux

Avant de lancer un outil automatique, vérifie les services internes.

#### Avec ss (recommandé)

```bash
ss -tulnp
```

#### Alternative

```bash
netstat -tulnp
```

#### À analyser attentivement

- Services écoutant uniquement sur `127.0.0.1`
- Ports inhabituels (3000, 5000, 8000, 8080, 9000…)
- Processus exécutés avec les privilèges root
- Bases de données locales
- Interfaces web internes

L’objectif est d’identifier un service exposé **uniquement en local**, pouvant constituer un point d’entrée secondaire.

#### Pourquoi c’est intéressant ?

Un service local peut :

- Être accessible via un SSH port forwarding
- Contenir une vulnérabilité exploitable
- Fonctionner en mode debug
- Être mal configuré
- Exécuter du code avec des privilèges élevés

#### Exemple de port forwarding SSH

Si un service écoute sur `127.0.0.1:8080`, tu peux le rendre accessible depuis ta machine Kali :

```
ssh -L 8080:127.0.0.1:8080 user@target
```

Tu pourras ensuite y accéder via :

http://localhost:8080

### Linpeas - Enumération approfondie

```bash
./linpeas.sh
```

- Linpeas permet d’effectuer une analyse locale complète du système et de mettre en évidence les pistes d’escalade potentielles :
  - Mauvaises permissions
  - Fichiers sensibles accessibles en lecture
  - Services internes
  - SUID suspects
  - Capabilities
  - Tâches cron
  - Variables d’environnement
  - Mauvaises configurations sudo
  - Indices de containerisation
  - Vulnérabilités kernel potentielles


- Utilise linpeas comme un **outil de corrélation**, pas comme une solution automatique.

> **Linpeas ne “donne” pas l’escalade :**
> **il met en lumière des anomalies qu’il faut ensuite analyser manuellement.**

- Comment exploiter intelligemment la sortie

  - Ne lis pas tout d’un bloc.

  - Procède méthodiquement :

    1. **Repère les sections en rouge ou en jaune.**

    2. Compare avec ce que tu as déjà identifié (sudo, SUID, services locaux).

    3. Vérifie les chemins modifiables.

    4. Analyse les fichiers appartenant à root mais accessibles.

    5. Cherche une incohérence exploitable.


  - Si linpeas révèle quelque chose que tu avais déjà vu, cela renforce ta piste.

  - S’il révèle quelque chose de nouveau, prends le temps de comprendre le mécanisme avant toute tentative.

- Bonnes pratiques CTF

  - Lance linpeas après les vérifications manuelles.
  - Ne base jamais ton exploitation uniquement sur sa coloration.
  - Supprime-le après utilisation si nécessaire.

## Observation en parallèle (recommandé)

Ouvre une nouvelle session  et lance pspy64 :

```bash
./pspy64
```

Utilité :

- Détecter des cron jobs
- Observer des scripts root
- Identifier des exécutions récurrentes

Si système 32 bits :

```bash
./pspy32
```

## Dernier recours : le kernel

Quand toutes les pistes logiques ont été explorées, il reste une possibilité : le noyau.

Examine la version du noyau :

```bash
uname -a
```

Puis teste avec `les.sh` pour identifier une vulnérabilité potentielle.

Un exploit kernel doit rester un **dernier recours**, après avoir exploré toutes les pistes liées à la configuration du système.

Avant toute tentative :

- Vérifie précisément la version du noyau
- Confirme la compatibilité de l’exploit
- Comprends le mécanisme d’élévation

Une bonne privilege escalation privilégie toujours les erreurs de configuration avant les exploits noyau.

# Checklist rapide

1. whoami / id / pwd / uname
2. sudo -l
3. getcap
4. suid3num.py
5. ss -tulnp
6. linpeas.sh
7. pspy64 en parallèle
8. En dernier recours : analyser le kernel

# Philosophie

- Toujours comprendre avant d’exploiter.
- Croiser les résultats entre outils.
- Noter chaque anomalie pour le writeup.
- Privilégier les vecteurs simples avant les exploits kernel.

Une bonne privilege escalation est structurée, reproductible et documentée.
