---
title: "Privilege Escalation Linux — Méthode structurée pour CTF et HTB"
description: "Méthode de privilege escalation sous Linux : approche structurée et pédagogique pour identifier les pistes d’escalade de privilèges en CTF et HackTheBox."
tags: ["recettes","tools","privilege-escalation"]
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

## Méthode structurée

L’ordre ci-dessous est intentionnel.
 Il permet d’identifier rapidement les pistes évidentes avant de lancer des outils plus lourds.

------

### Contexte utilisateur

Commence toujours par comprendre où tu te trouves.

```bash
whoami
id
uname -a
hostname
```

À analyser :

- Ton utilisateur
- Les groupes
- La version du noyau
- Indices de containerisation
- Architecture (utile pour les binaires 32/64 bits)

------

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

------

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

#### SUID avec [suid3num.py](https://github.com/Anon-Exploiter/SUID3NUM/tree/master)

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

------

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

À analyser :

- Services bindés sur 127.0.0.1
- Ports non standards
- Services root
- Bases de données locales
- Panels web internes

Un service local peut être :

- Accessible via SSH port forwarding
- Vulnérable
- Mal configuré

Exemple de port forwarding :

ssh -L 8080:127.0.0.1:8080 user@target

------

### [Linpeas](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS) - Enumération approfondie

```bash
./linpeas.sh
```

Objectif :

- Centraliser les anomalies
- Confirmer une suspicion
- Repérer des détails manqués

Ne jamais exploiter mécaniquement sans comprendre.

------

## Observation en parallèle (recommandé)

Ouvre une nouvelle session  et lance [pspy64](https://thm-solutions.hackethical.be/outils#id-4.-pspy64) :

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



------

## Optionnel : Kernel exploit

Utilise [les.sh](https://github.com/The-Z-Labs/linux-exploit-suggester) uniquement si :

- Aucun autre vecteur n’apparaît
- Noyau ancien
- Suspect d’être vulnérable

Un kernel exploit est un dernier recours, pas une première option.

------

# Checklist rapide

1. whoami / id / uname
2. sudo -l
3. getcap
4. suid3num.py
5. ss -tulnp
6. linpeas.sh
7. pspy64 en parallèle

------

# Philosophie

- Toujours comprendre avant d’exploiter.
- Croiser les résultats entre outils.
- Noter chaque anomalie pour le writeup.
- Privilégier les vecteurs simples avant les exploits kernel.

Une bonne privilege escalation est structurée, reproductible et documentée.
