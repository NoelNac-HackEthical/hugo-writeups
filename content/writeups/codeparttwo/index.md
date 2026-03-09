---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "CodePartTwo — HTB Easy Writeup & Walkthrough"
linkTitle: "CodePartTwo"
slug: "codeparttwo"
date: 2026-03-07T10:18:59+01:00
#lastmod: 2026-03-07T10:18:59+01:00
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
  alt: "Codeparttwo"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Codeparttwo"
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
| **Machine**    | <Codeparttwo> |
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

## Énumérations

{{< enum-intro >}}

### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :

> Note : les IP et timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée.

```bash
# Nmap 7.98 scan initiated Sat Mar  7 10:32:21 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt codeparttwo.htb
Nmap scan report for codeparttwo.htb (10.129.232.59)
Host is up (0.013s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
8000/tcp open  http-alt

# Nmap done at Sat Mar  7 10:32:30 2026 -- 1 IP address (1 host up) scanned in 9.46 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :
- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats de cette énumération sont enregistrés dans le fichier `scans_nmap/enum_ftp_smb_scan.txt`

```bash
# mon-nmap — ENUM FTP / SMB
# Target : codeparttwo.htb
# Date   : 2026-03-07T10:32:31+01:00

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,8000
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour codeparttwo.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,8000" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "codeparttwo.htb"

# Nmap 7.98 scan initiated Sat Mar  7 10:32:31 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,8000 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt codeparttwo.htb
Nmap scan report for codeparttwo.htb (10.129.232.59)
Host is up (0.012s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
8000/tcp open  http    Gunicorn 20.0.4
|_http-server-header: gunicorn/20.0.4
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   58.42 ms 10.10.16.1
2   7.61 ms  codeparttwo.htb (10.129.232.59)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar  7 10:32:45 2026 -- 1 IP address (1 host up) scanned in 14.82 seconds
```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Sat Mar  7 10:32:45 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,8000 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt codeparttwo.htb
Nmap scan report for codeparttwo.htb (10.129.232.59)
Host is up (0.013s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
8000/tcp open  http    Gunicorn 20.0.4
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
|_http-server-header: gunicorn/20.0.4
|_http-title: Welcome to CodePartTwo
| http-methods: 
|_  Supported Methods: GET HEAD OPTIONS
| http-headers: 
|   Server: gunicorn/20.0.4
|   Date: Sat, 07 Mar 2026 09:32:54 GMT
|   Connection: close
|   Content-Type: text/html; charset=utf-8
|   Content-Length: 2212
|   
|_  (Request type: HEAD)
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 4
|     /static/css/
|       css: 1
|     /static/js/
|       js: 1
|   Longest directory structure:
|     Depth: 2
|     Dir: /static/css/
|   Total files found (by extension):
|_    Other: 4; css: 1; js: 1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar  7 10:33:23 2026 -- 1 IP address (1 host up) scanned in 37.53 seconds
```



### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Sat Mar  7 10:33:23 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt codeparttwo.htb
Nmap scan report for codeparttwo.htb (10.129.232.59)
Host is up (0.023s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at Sat Mar  7 10:33:32 2026 -- 1 IP address (1 host up) scanned in 9.56 seconds
```



### Énumération des chemins web avec `mon-recoweb`
Pour la découverte des chemins web, tu utilises le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb codeparttwo.htb

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

Le fichier RESULTS_SUMMARY.txt te permet alors d’identifier rapidement les chemins réellement intéressants, sans avoir à parcourir l’ensemble des logs générés par les outils.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.1

Cible        : codeparttwo.htb:8000
Périmètre    : /
Date début   : 2026-03-07 10:55:34

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://codeparttwo.htb:8000/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/codeparttwo.htb_8000/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://codeparttwo.htb:8000/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/codeparttwo.htb_8000/ffuf_dirs.json 2>&1 | tee scans_recoweb/codeparttwo.htb_8000/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://codeparttwo.htb:8000/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/codeparttwo.htb_8000/ffuf_files.json 2>&1 | tee scans_recoweb/codeparttwo.htb_8000/ffuf_files.log

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

http://codeparttwo.htb:8000/dashboard (CODE:302|SIZE:199)
http://codeparttwo.htb:8000/dashboard/ (CODE:302|SIZE:199)
http://codeparttwo.htb:8000/download (CODE:200|SIZE:10708)
http://codeparttwo.htb:8000/download/ (CODE:200|SIZE:10708)
http://codeparttwo.htb:8000/login (CODE:200|SIZE:667)
http://codeparttwo.htb:8000/login/ (CODE:200|SIZE:667)
http://codeparttwo.htb:8000/logout (CODE:302|SIZE:189)
http://codeparttwo.htb:8000/logout/ (CODE:302|SIZE:189)
http://codeparttwo.htb:8000/register (CODE:200|SIZE:651)
http://codeparttwo.htb:8000/register/ (CODE:200|SIZE:651)

=== Détails par outil ===

[DIRB]
http://codeparttwo.htb:8000/dashboard (CODE:302|SIZE:199)
http://codeparttwo.htb:8000/download (CODE:200|SIZE:10708)
http://codeparttwo.htb:8000/login (CODE:200|SIZE:667)
http://codeparttwo.htb:8000/logout (CODE:302|SIZE:189)
http://codeparttwo.htb:8000/register (CODE:200|SIZE:651)

[FFUF — DIRECTORIES]
http://codeparttwo.htb:8000/dashboard/ (CODE:302|SIZE:199)
http://codeparttwo.htb:8000/download/ (CODE:200|SIZE:10708)
http://codeparttwo.htb:8000/login/ (CODE:200|SIZE:667)
http://codeparttwo.htb:8000/logout/ (CODE:302|SIZE:189)
http://codeparttwo.htb:8000/register/ (CODE:200|SIZE:651)

[FFUF — FILES]

```



### Recherche de vhosts avec `mon-subdomains`

Enfin, teste rapidement la présence de vhosts  avec  le script {{< script "mon-subdomains" >}}

```bash
mon-subdomains codeparttwo.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Si aucun vhost distinct n’est détecté, ce fichier te permet malgré tout de confirmer que le fuzzing n’a rien révélé d’exploitable.

```bash
=== mon-subdomains codeparttwo.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-03-09 09:54:32
Domaine      : codeparttwo.htb
IP           : 10.129.232.59
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 8000 (http)
  Baseline#1: code=200 size=2212 words=202 (Host=dewd945nez.codeparttwo.htb)
  Baseline#2: code=200 size=2212 words=202 (Host=q1i70d4de3.codeparttwo.htb)
  Baseline#3: code=200 size=2212 words=202 (Host=v42borj2u6.codeparttwo.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains codeparttwo.htb END ===
```



## Exploitation – Prise pied (Foothold)

À la fin de la phase d’énumération, deux éléments importants apparaissent clairement :

- un service **SSH** accessible sur le port **22**
- une **application web** exposée sur le port **8000**, servie par **Gunicorn 20.0.4**

Dans un challenge **Hack The Box**, lorsqu’une application web est servie par **Gunicorn**, cela indique généralement que le backend est écrit en **Python**.
 Gunicorn est en effet un **serveur WSGI** très utilisé pour déployer des applications Python, notamment celles développées avec des frameworks comme **Flask**, **FastAPI** ou **Django**.

Autrement dit, la présence de **Gunicorn** suggère fortement que la logique de l’application est implémentée en **Python**, ce qui oriente naturellement la suite de l’analyse vers l’application web elle-même.
Plutôt que de cibler immédiatement le service **SSH**, tu vas donc commencer par **examiner le fonctionnement de l’application**, car c’est généralement à ce niveau que se trouve la vulnérabilité permettant d’obtenir la **prise pied initiale sur la machine**.

### Analyse de l’application web

#### Observation de la page d’accueil

En ouvrant l’application dans ton navigateur à l’adresse suivante :

```bash
http://codeparttwo.htb:8000
```

tu arrives sur la page d’accueil de l’application CodePartTwo.

![Interface de la page d’accueil de l’application CodePartTwo sur le port 8000 avec les boutons Go to Dashboard et Download App permettant d’accéder au dashboard ou de télécharger l’application](codeparttwo_home_page.png)



L’interface est volontairement très simple et propose deux actions principales :

- **Go to Dashboard**
- **Download App**

#### Routes accessibles dans l’application

Le bouton **Go to Dashboard** te mène vers l’espace principal de l’application.
 Cet espace **pourrait toutefois nécessiter un compte utilisateur**, ce qui implique généralement une étape d’**inscription** ou de **connexion**.

Le bouton **Download App**, lui, est particulièrement intéressant dans un contexte **Hack The Box** : il **t’offre la possibilité de télécharger directement l’application**.

Dans un CTF, lorsqu’un site web donne accès au **code source de l’application**, c’est souvent une opportunité très précieuse.
 L’analyse du code **pourrait en effet t’aider à comprendre** comment fonctionne l’application, à identifier les **points sensibles**, et parfois à découvrir **directement la vulnérabilité exploitable**.

La prochaine étape consiste donc à **télécharger cette application afin d’analyser son code plus en détail**.

### Téléchargement et analyse du code source
#### Téléchargement de l’application

Comme tu l’as vu précédemment, le bouton **Download App** présent sur la page d’accueil permet de récupérer directement l’application.

En cliquant dessus, ton navigateur télécharge une **archive contenant le code source du projet**.

Tu peux également récupérer ce fichier depuis la ligne de commande avec `curl` :

```bash
curl -O http://codeparttwo.htb:8000/download
```

Une fois le téléchargement terminé, il te suffit d’extraire l’archive pour accéder aux fichiers de l’application.

```bash
unzip download
```

Tu disposes alors d’une **copie complète du code source de l’application web** sur ta machine.

Dans un **CTF Hack The Box**, pouvoir analyser le code source est souvent un avantage majeur.
 Cela te permet de comprendre **comment l’application fonctionne**, quelles **routes sont disponibles**, comment les **données sont traitées**, et surtout d’identifier plus facilement **une vulnérabilité exploitable**.

La prochaine étape consiste donc à **examiner la structure du projet** afin de repérer les fichiers les plus intéressants.

#### Structure du projet

Après extraction de l’archive, tu obtiens l’arborescence suivante :

```texte
app.py
requirements.txt
instance/
static/
templates/
```

Plusieurs répertoires sont présents, mais le fichier **`app.py`** attire immédiatement l’attention.

Dans de nombreuses applications Python basées sur **Flask** ou des frameworks similaires, ce fichier constitue le **point d’entrée de l’application**.
 C’est généralement dans ce fichier que sont définies :

- les **routes de l’application**
- la **logique applicative**
- les fonctions qui traitent les **données envoyées par les utilisateurs**

Autrement dit, analyser ce fichier permet souvent de comprendre **le fonctionnement interne de l’application** et de repérer les endroits où une **vulnérabilité pourrait être exploitée**.

Dans la section suivante, tu vas donc **examiner le fichier `app.py`** afin d’identifier les fonctionnalités exposées par l’application.

### Identification de la fonctionnalité d’exécution de code
#### Analyse de la route /run_code
#### Utilisation de la bibliothèque js2py

### Exploitation de l’exécution de code
#### Test de l’API
#### Bypass de la sandbox js2py

### Extraction de données sensibles
#### Récupération de la base instance/users.db
#### Analyse de la base SQLite

### Connexion SSH
#### Accès à la machine avec l’utilisateur marco
## Récupération du user flag



---

## Escalade de privilèges

{{< escalade-intro user="marco" >}}


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