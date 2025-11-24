---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Valentine"
slug: "valentine"
date: 2025-11-24T15:34:58+01:00
lastmod: 2025-11-24T15:34:58+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Writeup générique de machine CTF : documentation de la phase d'énumération, exploitation du foothold, escalade de privilèges et capture des flags. Sert de modèle structuré pour rédiger les solutions détaillées"
description: "Courte description SEO et pour l'aperçu social."
tags: ["Writeup"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Valentine"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Valentine"
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
---

<!-- ====================================================================
Tableau d'infos (modèle) — Remplacer les valeurs entre <...> après création.
Aucun templating Hugo dans le corps, pour éviter les erreurs d'archetype.
====================================================================
| Champ          | Valeur |
|----------------|--------|
| **Plateforme** | <Hack The Box> |
| **Machine**    | <Valentine> |
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

Pour démarrer, lançons mon script d'énumération {{< script "mon-nouveau-nmap" >}} :

```bash
mon-nouveau-nmap target.htb

# Résultats dans le répertoire mes_scans/
#  - mes_scans/full_tcp_scan.txt
#  - mes_scans/aggressive_vuln_scan.txt
#  - mes_scans/cms_vuln_scan.txt
#  - mes_scans/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (mes_scans/full_tcp_scan.txt) révèle les ports ouverts suivants :

```bash
# Nmap 7.95 scan initiated Mon Nov 24 15:53:27 2025 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN mes_scans/full_tcp_scan.txt valentine.htb
Nmap scan report for valentine.htb (10.129.232.136)
Host is up (0.0082s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

# Nmap done at Mon Nov 24 15:53:37 2025 -- 1 IP address (1 host up) scanned in 10.03 seconds

```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (mes_scans/aggresive_vuln_scan.txt) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour valentine.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80,443" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "valentine.htb"

# Nmap 7.95 scan initiated Mon Nov 24 15:53:37 2025 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80,443 --script=http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params --script-timeout=30s -T4 -oN mes_scans/aggressive_vuln_scan_raw.txt valentine.htb
Nmap scan report for valentine.htb (10.129.232.136)
Host is up (0.0092s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.2.22 ((Ubuntu))
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-server-header: Apache/2.2.22 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.2.22
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| ssl-cert: Subject: commonName=valentine.htb/organizationName=valentine.htb/stateOrProvinceName=FL/countryName=US
| Issuer: commonName=valentine.htb/organizationName=valentine.htb/stateOrProvinceName=FL/countryName=US
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2018-02-06T00:45:25
| Not valid after:  2019-02-06T00:45:25
| MD5:   a413:c4f0:b145:2154:fb54:b2de:c7a9:809d
|_SHA-1: 2303:80da:60e7:bde7:2ba6:76dd:5214:3c3c:6f53:01b1
| ssl-heartbleed: 
|   VULNERABLE:
|   The Heartbleed Bug is a serious vulnerability in the popular OpenSSL cryptographic software library. It allows for stealing information intended to be protected by SSL/TLS encryption.
|     State: VULNERABLE
|     Risk factor: High
|       OpenSSL versions 1.0.1 and 1.0.2-beta releases (including 1.0.1f and 1.0.2-beta1) of OpenSSL are affected by the Heartbleed bug. The bug allows for reading memory of systems protected by the vulnerable OpenSSL versions and could allow for disclosure of otherwise encrypted confidential information as well as the encryption keys themselves.
|           
|     References:
|       http://www.openssl.org/news/secadv_20140407.txt 
|       http://cvedetails.com/cve/2014-0160/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-0160
|_http-server-header: Apache/2.2.22 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X|3.X
OS CPE: cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3
OS details: Linux 2.6.32 - 3.10, Linux 2.6.32 - 3.13
Network Distance: 2 hops
Service Info: Host: 10.10.10.136; OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   10.95 ms 10.10.14.1
2   11.00 ms valentine.htb (10.129.232.136)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov 24 15:53:53 2025 -- 1 IP address (1 host up) scanned in 16.19 seconds

```



### Scan ciblé CMS

Le scan ciblé CMS (`mes_scans/cms_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Mon Nov 24 15:53:53 2025 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80,443 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN mes_scans/cms_vuln_scan.txt valentine.htb
Nmap scan report for valentine.htb (10.129.232.136)
Host is up (0.0087s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
| http-headers: 
|   Date: Mon, 24 Nov 2025 14:53:17 GMT
|   Server: Apache/2.2.22 (Ubuntu)
|   X-Powered-By: PHP/5.3.10-1ubuntu3.26
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
|_http-title: Site doesn't have a title (text/html).
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-php-version: Versions from logo query (less accurate): 5.3.0 - 5.3.29, 5.4.0 - 5.4.45
| Versions from credits query (more accurate): 5.3.9 - 5.3.29
|_Version from header x-powered-by: PHP/5.3.10-1ubuntu3.26
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; jpg: 1
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    Other: 1; jpg: 1
| http-enum: 
|   /dev/: Potentially interesting directory w/ listing on 'apache/2.2.22 (ubuntu)'
|_  /index/: Potentially interesting folder
443/tcp open  ssl/http Apache httpd 2.2.22
|_http-server-header: Apache/2.2.22 (Ubuntu)
| http-php-version: Versions from logo query (less accurate): 5.3.0 - 5.3.29, 5.4.0 - 5.4.45
| Versions from credits query (more accurate): 5.3.9 - 5.3.29
|_Version from header x-powered-by: PHP/5.3.10-1ubuntu3.26
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
|_http-title: Site doesn't have a title (text/html).
| http-headers: 
|   Date: Mon, 24 Nov 2025 14:53:17 GMT
|   Server: Apache/2.2.22 (Ubuntu)
|   X-Powered-By: PHP/5.3.10-1ubuntu3.26
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; jpg: 1
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    Other: 1; jpg: 1
| http-enum: 
|   /dev/: Potentially interesting directory w/ listing on 'apache/2.2.22 (ubuntu)'
|_  /index/: Potentially interesting folder
Service Info: Host: 10.10.10.136; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov 24 15:54:21 2025 -- 1 IP address (1 host up) scanned in 28.05 seconds

```



### Scan UDP rapide

Le scan UDP rapide (`mes_scans/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Mon Nov 24 15:54:21 2025 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN mes_scans/udp_vuln_scan.txt valentine.htb
Warning: 10.129.232.136 giving up on port because retransmission cap hit (6).
Nmap scan report for valentine.htb (10.129.232.136)
Host is up (0.010s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at Mon Nov 24 15:54:34 2025 -- 1 IP address (1 host up) scanned in 13.25 seconds

```



### Scan des répertoires
Pour la partie découverte de chemins web, j'utilise mon script dédié {{< script "mon-recoweb" >}}

```bash

=== mon-recoweb valentine.htb START ===
Script       : mon-recoweb
Version      : mon-recoweb 2.1.6
Date         : 2025-11-24 16:02:15
Domaine      : valentine.htb
IP           : 10.129.232.136
Mode         : large
Wordlist eff.: /tmp/mon-recoweb_valentine.htb_wl.ps2SlE
Master       : /usr/share/wordlists/dirb/common.txt
Codes        : 200,301,302,403  (strict=1)
Extensions   : .php,.txt,

DIR totaux bruts   : 32
DIR totaux uniques : 16
  - /cgi-bin
  - /decode
  - /decode.php
  - /dev
  - /encode
  - /encode.php
  - /.hta
  - /.htaccess.php
  - /.htaccess.txt
  - /.hta.php
  - /.hta.txt
  - /.htpasswd.php
  - /.htpasswd.txt
  - /index
  - /index.php
  - /server-status

--- Détails par port ---
Port 80 (http)
  whatweb :
    http://valentine.htb:80/ [200 OK] Apache[2.2.22], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.2.22 (Ubuntu)], IP[10.129.232.136], PHP[5.3.10-1ubuntu3.26], X-Powered-By[PHP/5.3.10-1ubuntu3.26]
  Baseline: code=404 size=290 words=32 (/worjc23h1irnd)
  DIR (16)
    - /cgi-bin/
    - /decode
    - /decode.php
    - /dev
    - /encode
    - /encode.php
    - /.hta
    - /.htaccess.php
    - /.htaccess.txt
    - /.hta.php
    - /.hta.txt
    - /.htpasswd.php
    - /.htpasswd.txt
    - /index
    - /index.php
    - /server-status

Port 443 (https)
  whatweb :
    https://valentine.htb:443/ [200 OK] Apache[2.2.22], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.2.22 (Ubuntu)], IP[10.129.232.136], PHP[5.3.10-1ubuntu3.26], X-Powered-By[PHP/5.3.10-1ubuntu3.26]
  Baseline: code=404 size=291 words=32 (/ihq4snflblrnd)
  DIR (16)
    - /cgi-bin/
    - /decode
    - /decode.php
    - /dev
    - /encode
    - /encode.php
    - /.hta
    - /.htaccess.php
    - /.htaccess.txt
    - /.hta.php
    - /.hta.txt
    - /.htpasswd.php
    - /.htpasswd.txt
    - /index
    - /index.php
    - /server-status



=== mon-recoweb valentine.htb END ===


```



### Scan des vhosts
Enfin, je teste rapidement la présence de vhosts  avec  {{< script "mon-subdomains" >}}

---

## Exploitation – Prise pied (Foothold)

- Vecteur d'entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d'accès (`id`, `whoami`, `hostname`).

---

## Escalade de privilèges

### Vers utilisateur intermédiaire (si applicable)
- Méthode (sudoers, capabilities, SUID, timers, service vulnérable).
- Indices collectés (configs, clés, cron, journaux).

### Vers root
- Vecteur principal, exploitation, contournements.
- Preuves : `id`, `hostnamectl`, `cat /root/root.txt`.
- Remédiations possibles (leçons sécurité).

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
