---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md
title: "Sea"
slug: "sea"
date: 2025-12-02T10:15:29+01:00
lastmod: 2025-12-02T10:15:29+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Writeup générique de machine CTF : documentation de la phase d'énumération, exploitation du foothold, escalade de privilèges et capture des flags. Sert de modèle structuré pour rédiger les solutions détaillées"
description: "Writeup HTB Easy combinant approche pédagogique et analyse technique, avec énumération claire, compréhension de la vulnérabilité et progression structurée jusqu’à l’escalade."
tags: ["Easy"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Sea"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Sea"
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

---

<!-- ====================================================================
Tableau d'infos (modèle) — Remplacer les valeurs entre <...> après création.
Aucun templating Hugo dans le corps, pour éviter les erreurs d'archetype.
====================================================================
| Champ          | Valeur |
|----------------|--------|
| **Plateforme** | <Hack The Box> |
| **Machine**    | <Sea> |
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

Pour démarrer

- entrons l'adresse IP de la cible `10.129.x.x   cible.htb`  dans /etc/hosts 

```bash
sudo nano /etc/hosts
```

- lançons mon script d'énumération {{< script "mon-nmap" >}} :

```bash
mon-nmap target.htb

# Résultats dans le répertoire scans_nmap/
#  - scans_nmap/full_tcp_scan.txt
#  - scans_nmap/aggressive_vuln_scan.txt
#  - scans_nmap/cms_vuln_scan.txt
#  - scans_nmap/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (scans_nmap/full_tcp_scan.txt) révèle les ports ouverts suivants :

```bash
# Nmap 7.98 scan initiated Fri Jan  2 09:37:43 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt sea.htb
Nmap scan report for sea.htb (10.129.29.235)
Host is up (0.0085s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at Fri Jan  2 09:37:51 2026 -- 1 IP address (1 host up) scanned in 8.01 seconds

```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (scans_nmap/aggresive_vuln_scan.txt) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour sea.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="http-vuln-* and not http-vuln-cve2017-1001000,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "sea.htb"

# Nmap 7.98 scan initiated Fri Jan  2 09:37:51 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=http-vuln-* and not http-vuln-cve2017-1001000,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt sea.htb
Nmap scan report for sea.htb (10.129.29.235)
Host is up (0.0083s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT     ADDRESS
1   8.13 ms 10.10.14.1
2   8.23 ms sea.htb (10.129.29.235)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jan  2 09:38:00 2026 -- 1 IP address (1 host up) scanned in 9.32 seconds
tb"
```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`) 

```bash
# Nmap 7.98 scan initiated Fri Jan  2 09:38:00 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt sea.htb
Nmap scan report for sea.htb (10.129.29.235)
Host is up (0.0086s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 3; php: 1
|     /themes/bike/css/
|       css: 1
|     /themes/bike/img/
|       png: 1
|   Longest directory structure:
|     Depth: 3
|     Dir: /themes/bike/css/
|   Total files found (by extension):
|_    Other: 3; css: 1; php: 1; png: 1
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-config-backup: ERROR: Script execution failed (use -d to debug)
| http-headers: 
|   Date: Fri, 02 Jan 2026 08:37:43 GMT
|   Server: Apache/2.4.41 (Ubuntu)
|   Set-Cookie: PHPSESSID=2s4hqbi1jgppop0dk1ea8bvqkh; path=/
|   Expires: Thu, 19 Nov 1981 08:52:00 GMT
|   Cache-Control: no-store, no-cache, must-revalidate
|   Pragma: no-cache
|   Connection: close
|   Content-Type: text/html; charset=UTF-8
|   
|_  (Request type: HEAD)
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
|_http-title: Sea - Home
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jan  2 09:38:38 2026 -- 1 IP address (1 host up) scanned in 37.71 seconds

```



### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.98 scan initiated Fri Jan  2 09:38:38 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt sea.htb
Nmap scan report for sea.htb (10.129.29.235)
Host is up (0.0093s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at Fri Jan  2 09:38:48 2026 -- 1 IP address (1 host up) scanned in 9.78 seconds

```



### Scan des répertoires
Pour la partie découverte de chemins web, j'utilise mon script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb sea.htb

=== Résultat global (agrégé) ===

/.
/0
/0/
/404
/404/
/About/
/Bequest/
/Contact/
/contact.php
/Copy
/data/
/Donate/
/external/
/Gift/
/home
/home/
/Home/
/.ht
/.htaccess
/.htaccess.bak
/.htc
/.htgroup
/.htm
/.html
/.htpasswd
/.htpasswds
/.htuser
/index.php
/Life/
/messages/
/modern/
/My/
/neuf/
/New/
/.php
/Planned/
/plugins/
/Press/
/Privacy/
/Reports/
/server-status
/server-status/
/Site/
/Style/
/themes/
/Web/
/What/
/wp-forum.phps

=== Détails par outil ===

[DIRB]
/0
/404
/data/
/home
/index.php
/messages/
/plugins/
/server-status
/themes/

[FFUF — DIRECTORIES]
/0/
/404/
/About/
/Bequest/
/Contact/
/data/
/Donate/
/external/
/Gift/
/home/
/Home/
/Life/
/messages/
/modern/
/My/
/neuf/
/New/
/Planned/
/plugins/
/Press/
/Privacy/
/Reports/
/server-status/
/Site/
/Style/
/themes/
/Web/
/What/

[FFUF — FILES]
/.
/contact.php
/Copy
/.ht
/.htaccess
/.htaccess.bak
/.htc
/.htgroup
/.htm
/.html
/.htpasswd
/.htpasswds
/.htuser
/index.php
/.php
/wp-forum.phps

```



### Scan des vhosts
Enfin, je teste la présence de vhosts  avec  {{< script "mon-subdomains" >}}

```
mon-subdomains sea.htb

=== mon-subdomains sea.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : 2026-01-02 10:24:03
Domaine      : sea.htb
IP           : 10.129.29.235
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=3705 words=262 (Host=m2hjpeq31b.sea.htb)
  Baseline#2: code=200 size=3705 words=262 (Host=g9exskn7pc.sea.htb)
  Baseline#3: code=200 size=3705 words=262 (Host=hvdlfdx26r.sea.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains sea.htb END ===

```



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