---
title: "Privilege Escalation Linux — Méthode structurée pour CTF et HTB"
description: "Guide complet de privilege escalation Linux pour CTF et Hack The Box : méthode structurée, énumération manuelle, sudo, SUID, services locaux, linpeas et exploitation du kernel."
tags: ["Recettes","Privilege Escalation","Linux","CTF","Hack The Box"]
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

L’ordre est intentionnel : commence par une phase d’observation, puis enchaîne avec les vérifications simples avant les outils plus complets.

### Lance d’abord l’observation des tâches Root

Ouvre une nouvelle session (recommandé) et lance pspy64 :

```bash
./pspy64
```

Utilité :

- Détecter des cron jobs
- Observer des scripts exécutés en arrière-plan
- Identifier des exécutions en root (UID=0)

#### Points à surveiller

- Commandes exécutées avec `UID=0`
- Scripts appelés par root (bash, sh, python, php…)
- Fichiers ou chemins modifiables par ton utilisateur
- Exécutions répétées (cron)

Un script exécuté en root est particulièrement intéressant si tu peux :

- Modifier le script
- Modifier un fichier qu’il charge (config, include…)
- Influencer son comportement

#### Vérifications complémentaires

- Scripts lancés à la connexion SSH :
  - `.bashrc`, `.profile`, `/etc/profile`, `/etc/bash.bashrc`
- Tâches planifiées :
  - `/etc/crontab`, `/etc/cron*`
  - `systemctl list-timers`

Laisse pspy64 tourner pendant toute l’investigation manuelle :  

il fonctionne en **observation passive** et te permet de voir des actions que tu ne déclenches pas toi-même.

Si système 32 bits :

```bash
./pspy32
```

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

### Exploration du contexte utilisateur

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

Alternative :

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

- Être accessible via un **tunnel SSH (port forwarding)**
- Contenir une vulnérabilité exploitable
- Fonctionner en mode debug
- Être mal configuré
- Exécuter du code avec des privilèges élevés

#### Accès via tunnel SSH

Un service bind sur `127.0.0.1` n’est pas accessible directement depuis l’extérieur, mais tu peux le rendre accessible via un **tunnel SSH (port forwarding)**.

Exemple :

Si un service écoute sur `127.0.0.1:8080` :

```bash
ssh -L 8080:127.0.0.1:8080 user@target
```

Ensuite, depuis ta machine Kali :

```
http://localhost:8080
```

Cela te permet d’analyser une interface interne (web, API, admin…) qui n’est normalement pas exposée.

#### Identifier le service derrière un port

Une fois un port intéressant identifié, il est essentiel de comprendre **quel service l’utilise réellement**.

Une méthode simple consiste à rechercher ce port dans les fichiers de configuration :

```
grep -r ':8080' /etc 2>/dev/null
```

(adapte `8080` au port identifié, par exemple `5000`, `3000`, `9898`…)

Ce que tu peux trouver :

- Fichiers de configuration (nginx, apache, gunicorn…)
- Services systemd
- Scripts internes
- Chemins d’applications

Cela permet souvent de :

- Identifier le **service exact**
- Trouver son **répertoire d’exécution**
- Découvrir des **identifiants ou chemins sensibles**
- Comprendre comment il est lancé (et avec quels privilèges)

Tu peux également élargir la recherche :

```bash
grep -r '5000' /etc 2>/dev/null
```

Cela permet parfois de trouver des références au port même sans le préfixe `:`.

## Linpeas — Énumération approfondie

Si les vérifications manuelles de la méthode structurée n’ont révélé **aucune piste exploitable**, passe à une énumération approfondie avec **Linpeas**.

```
./linpeas.sh
```

Linpeas réalise une analyse locale complète du système et met en évidence les **pistes potentielles de privilege escalation**.

Dans Linpeas, les vulnérabilités potentielles sont classées et surlignées par couleur.

![Légende des couleurs de LinPEAS indiquant le niveau de criticité des vulnérabilités](/images/linpeas-legend.png)

### Ce que Linpeas peut révéler

- Mauvaises permissions
- Fichiers sensibles accessibles en lecture
- Services internes exposés
- Binaires SUID suspects
- Capabilities dangereuses
- Tâches cron
- Variables d’environnement sensibles
- Mauvaises configurations sudo
- Indices de containerisation
- Vulnérabilités kernel potentielles

### Comment utiliser Linpeas efficacement

Utilise Linpeas comme un **outil de corrélation**, pas comme une solution automatique.

> Linpeas ne “donne” pas l’escalade :
>  il met en évidence des anomalies que tu dois ensuite analyser manuellement.

### Comment analyser la sortie

N’essaie pas de tout lire d’un bloc.

Travaille méthodiquement :

- **Repère les sections en rouge et en jaune**
   → ce sont les éléments les plus intéressants.
- **Compare avec ton énumération manuelle**
   → sudo, SUID, services locaux, fichiers trouvés…
- **Identifie les chemins modifiables**
   → scripts, dossiers, fichiers accessibles en écriture.
- **Analyse les fichiers appartenant à root**
   → surtout s’ils sont lisibles ou modifiables.
- **Cherche une incohérence exploitable**
   → un service root lié à un fichier modifiable, par exemple.

### Interpréter les résultats

- Si Linpeas confirme une piste que tu avais déjà identifiée
   → **ta piste est probablement la bonne**
- S’il révèle un élément nouveau
   → prends le temps de **comprendre le mécanisme** avant de tester quoi que ce soit

Dans la majorité des cas, l’escalade repose sur une **mauvaise configuration**, pas sur une exploitation complexe.

### Bonnes pratiques en CTF

- Lance Linpeas **après l’énumération manuelle**
- Ne te base jamais uniquement sur la couleur des résultats
- Croise toujours avec ce que tu as déjà observé
- Garde une approche logique : **compréhension → validation → exploitation**
- Supprime l’outil après utilisation si nécessaire (`/tmp`, `/dev/shm`)

<br>
<div style="border:1px solid #ccc; padding:10px; border-radius:6px; display: inline-block; text-align: center; margin-left: 20px;">
  <p><strong>Bien utilisé, Linpeas te fait gagner du temps</strong></p>
  <p><strong>Mal utilisé, il te noie dans les informations</strong></p>
</div>
<br><br>


L’objectif reste toujours le même : **comprendre le système avant d’exploiter**.

## Dernier recours : le kernel

Quand toutes les pistes logiques ont été explorées, il reste une possibilité : le noyau.

Examine la version du noyau :

```bash
uname -a
```

Puis teste avec `les.sh` pour identifier une vulnérabilité potentielle.

Un exploit kernel doit rester un **dernier recours**, après avoir exploré toutes les pistes liées à la configuration du système.

Dans la majorité des machines CTF (surtout Easy/Medium), l’escalade repose sur une mauvaise configuration et non sur une vulnérabilité kernel.

Avant toute tentative :

- Vérifie précisément la version du noyau
- Confirme la compatibilité de l’exploit
- Comprends le mécanisme d’élévation

Une bonne privilege escalation privilégie toujours les erreurs de configuration avant les exploits noyau.

## Checklist rapide

1. whoami / id / pwd / uname
2. sudo -l
3. getcap
4. suid3num.py
5. ss -tulnp / netstat -tulpn
6. linpeas.sh
7. pspy64 en parallèle
8. En dernier recours : analyser le kernel

## Philosophie

- Toujours comprendre avant d’exploiter.
- Croiser les résultats entre outils.
- Noter chaque anomalie pour le writeup.
- Privilégier les vecteurs simples avant les exploits kernel.
- Appliquer une méthode reproductible sur chaque machine CTF.

Une bonne privilege escalation est structurée, reproductible et documentée.
