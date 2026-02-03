---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "TwoMillion — HTB Easy Writeup & Walkthrough"
linkTitle: "TwoMillion"
slug: "twomillion"
date: 2026-02-02T10:47:27+01:00
#lastmod: 2026-02-02T10:47:27+01:00
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
  alt: "Twomillion"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Twomillion"
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
| **Machine**    | <Twomillion> |
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

Dans un challenge **CTF Hack The Box**, tu commences **toujours** par une phase d’**énumération complète**.
C’est une étape incontournable : elle te permet d’identifier clairement ce que la machine expose avant toute tentative d’exploitation.

Concrètement, tu cherches à savoir quels **ports** sont ouverts, quels **services** sont accessibles, si une **application web** est présente, quels **répertoires** sont exposés et si des **sous-domaines ou vhosts** peuvent être exploités.

Pour réaliser cette énumération de manière structurée et reproductible, tu peux t’appuyer sur trois scripts :

- **{{< script "mon-nmap" >}}** : identifie les ports ouverts et les services en écoute
- **{{< script "mon-recoweb" >}}** : énumère les répertoires et fichiers accessibles via le service web
- **{{< script "mon-subdomains" >}}** : détecte la présence éventuelle de sous-domaines et de vhosts

Tu retrouves ces outils dans la section **[Outils / Mes scripts](mes-scripts/)**.
Pour garantir des résultats pertinents en contexte **CTF HTB**, tu utilises une **wordlist dédiée**, installée au préalable grâce au script **{{< script "make-htb-wordlist" >}}**.
Cette wordlist est conçue pour couvrir les technologies couramment rencontrées sur Hack The Box.

------

Avant de lancer les scans, vérifie que twomillion.htb résout bien vers la cible. Sur HTB, ça passe généralement par une entrée dans /etc/hosts.

- Ajoute l’entrée `10.129.x.x twomillion.htb` dans `/etc/hosts`.

```bash
sudo nano /etc/hosts
```

- Lance ensuite le script {{< script "mon-nmap" >}} pour obtenir une vue claire des ports et services exposés :

```bash
mon-nmap twomillion.htb

# Résultats dans le répertoire scans_nmap/
#  - scans_nmap/full_tcp_scan.txt
#  - scans_nmap/aggressive_vuln_scan.txt
#  - scans_nmap/cms_vuln_scan.txt
#  - scans_nmap/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :

> Note : les IP et timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée.

```bash
# Nmap 7.98 scan initiated Mon Feb  2 11:01:41 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt twomillion.htb
Nmap scan report for twomillion.htb (10.129.66.103)
Host is up (0.049s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at Mon Feb  2 11:01:48 2026 -- 1 IP address (1 host up) scanned in 7.56 seconds
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour twomillion.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "twomillion.htb"

# Nmap 7.98 scan initiated Mon Feb  2 11:01:48 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt twomillion.htb
Nmap scan report for twomillion.htb (10.129.66.103)
Host is up (0.016s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   53.84 ms 10.10.16.1
2   7.09 ms  twomillion.htb (10.129.66.103)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Feb  2 11:02:04 2026 -- 1 IP address (1 host up) scanned in 15.88 seconds

```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Mon Feb  2 11:02:04 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt twomillion.htb
Nmap scan report for twomillion.htb (10.129.66.103)
Host is up (0.013s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
|_http-title: Did not follow redirect to http://2million.htb/
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-sitemap-generator: 
|   Directory structure:
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    
| http-headers: 
|   Server: nginx
|   Date: Mon, 02 Feb 2026 10:02:11 GMT
|   Content-Type: text/html
|   Content-Length: 162
|   Connection: close
|   Location: http://2million.htb/
|   
|_  (Request type: GET)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Feb  2 11:02:42 2026 -- 1 IP address (1 host up) scanned in 37.76 seconds

```

### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Mon Feb  2 11:02:42 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt twomillion.htb
Nmap scan report for twomillion.htb (10.129.66.103)
Host is up (0.020s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   open|filtered snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  open|filtered ms-sql-m
1900/udp  closed        upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

# Nmap done at Mon Feb  2 11:02:50 2026 -- 1 IP address (1 host up) scanned in 8.10 seconds

```

Lors de l’énumération avec `mon-nmap`, le fichier de résultats `cms_vuln_scan.txt` met en évidence une redirection HTTP via l’en-tête `Location: http://2million.htb/`, indiquant que l’application principale est hébergée sur un vhost distinct. Ce comportement est également observable via l’interface web : en accédant à `http://twomillion.htb`, l’application indique qu’elle ne peut pas accéder à `2million.htb` tant que ce hostname n’est pas résolu localement. Il est donc nécessaire d’ajouter `2million.htb` au fichier `/etc/hosts` afin d’accéder au site réel.

Modifie l’entrée en `10.129.x.x twomillion.htb 2million.htb` dans `/etc/hosts`.

### Énumération des chemins web avec `mon-recoweb`
Pour la découverte des chemins web, tu utilises le script dédié {{< script "mon-recoweb" >}}

L’énumération web est réalisée sur l’hôte **`2million.htb`**, qui correspond au nom DNS réellement utilisé par l’application. C’est donc cette cible que tu prends comme référence pour l’ensemble des scans.

```bash
mon-recoweb 2million.htb

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



Lors de l’énumération avec **ffuf**, tu constates rapidement que la majorité des chemins testés renvoient une réponse **301** avec une **taille strictement identique (162 octets)**.
 Ces réponses correspondent à un mécanisme de redirection générique, renvoyé systématiquement pour des chemins inexistants, ce qui génère un **bruit massif** dans les résultats.

```bash
...
fav                     [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 38ms]
formulaires             [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 33ms]
flets                   [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 34ms]
fishing                 [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 34ms]
skin_acp                [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 34ms]
forum3                  [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 34ms]
formular                [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 34ms]
fr_FR                   [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 35ms]
gear                    [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 35ms]
gravis                  [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 33ms]
gmaps                   [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 33ms]
haber                   [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 30ms]
hosts                   [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 31ms]
gui                     [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 31ms]
inserts                 [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 36ms]
htmlemail               [Status: 301, Size: 162, Words: 5, Lines: 8, Duration: 38ms]
...
```

Pour nettoyer les résultats sans perdre d’informations pertinentes, tu évites de filtrer directement sur le code HTTP **301**, qui peut correspondre à de vrais chemins applicatifs redirigeant vers une autre ressource.
 À la place, tu filtres sur la **taille de réponse**, en utilisant l’option **`-fs 162`**, ce qui permet d’éliminer uniquement les réponses génériques tout en conservant les redirections légitimes et les signaux exploitables.

```bash
mon-recoweb 2million.htb --ffuf-extra "-fs 162"
```

Ce filtrage permet d’obtenir une sortie nettement plus lisible, tout en conservant l’intégralité des ressources réellement exposées.

Le fichier **`RESULTS_SUMMARY.txt`** te permet alors d’identifier rapidement les chemins réellement intéressants, sans avoir à parcourir l’ensemble des logs générés par les outils.



```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.0

Cible        : 2million.htb
Périmètre    : /
Date début   : 2026-02-03 10:43:15

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://2million.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://2million.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -fs 162 -of json -o scans_recoweb/ffuf_dirs.json 2>&1 | tee scans_recoweb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://2million.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -fs 162 -of json -o scans_recoweb/ffuf_files.json 2>&1 | tee scans_recoweb/ffuf_files.log

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

http://2million.htb/404 (CODE:200|SIZE:1674)
http://2million.htb/404/ (CODE:200|SIZE:1674)
http://2million.htb/api (CODE:401|SIZE:0)
http://2million.htb/api/ (CODE:401|SIZE:0)
http://2million.htb/assets/
http://2million.htb/controllers/
http://2million.htb/css/
http://2million.htb/fonts/
http://2million.htb/home (CODE:302|SIZE:0)
http://2million.htb/home/ (CODE:302|SIZE:0)
http://2million.htb/images/
http://2million.htb/invite (CODE:200|SIZE:3859)
http://2million.htb/invite/ (CODE:200|SIZE:3859)
http://2million.htb/js/
http://2million.htb/login (CODE:200|SIZE:3704)
http://2million.htb/login/ (CODE:200|SIZE:3704)
http://2million.htb/logout (CODE:302|SIZE:0)
http://2million.htb/logout/ (CODE:302|SIZE:0)
http://2million.htb/register (CODE:200|SIZE:4527)
http://2million.htb/register/ (CODE:200|SIZE:4527)
http://2million.htb/views/

=== Détails par outil ===

[DIRB]
http://2million.htb/404 (CODE:200|SIZE:1674)
http://2million.htb/api (CODE:401|SIZE:0)
http://2million.htb/assets/
http://2million.htb/controllers/
http://2million.htb/css/
http://2million.htb/fonts/
http://2million.htb/home (CODE:302|SIZE:0)
http://2million.htb/images/
http://2million.htb/invite (CODE:200|SIZE:3859)
http://2million.htb/js/
http://2million.htb/login (CODE:200|SIZE:3704)
http://2million.htb/logout (CODE:302|SIZE:0)
http://2million.htb/register (CODE:200|SIZE:4527)
http://2million.htb/views/

[FFUF — DIRECTORIES]
http://2million.htb/404/ (CODE:200|SIZE:1674)
http://2million.htb/api/ (CODE:401|SIZE:0)
http://2million.htb/home/ (CODE:302|SIZE:0)
http://2million.htb/invite/ (CODE:200|SIZE:3859)
http://2million.htb/login/ (CODE:200|SIZE:3704)
http://2million.htb/logout/ (CODE:302|SIZE:0)
http://2million.htb/register/ (CODE:200|SIZE:4527)

[FFUF — FILES]

```



### Recherche de vhosts avec `mon-subdomains`

Enfin, teste rapidement la présence de vhosts  avec  le script {{< script "mon-subdomains" >}}

```bash
mon-subdomains 2million.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```



```bash
=== mon-subdomains 2million.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-02-03 11:12:11
Domaine      : 2million.htb
IP           : 10.129.67.212
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=301 size=162 words=11 (Host=6cjd1s8ih2.2million.htb)
  Baseline#2: code=301 size=162 words=11 (Host=r9eog1y1ja.2million.htb)
  Baseline#3: code=301 size=162 words=11 (Host=07xamgn3gj.2million.htb)
  After-redirect#1: code=200 size=64952 words=3326
  After-redirect#2: code=200 size=64952 words=3326
  After-redirect#3: code=200 size=64952 words=3326
  VHOST (0)
    - (aucun)



=== mon-subdomains 2million.htb END ===


```



Si aucun vhost distinct n’est détecté, ce fichier te permet malgré tout de confirmer que le fuzzing n’a rien révélé d’exploitable.

## Exploitation – Prise pied (Foothold)

- Vecteur d'entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d'accès (`id`, `whoami`, `hostname`).

---

## Escalade de privilèges

Une fois connecté en SSH en tant que `jkr`, tu appliques la méthodologie décrite dans la recette
   {{< recette "privilege-escalation-linux" >}}.

### Sudo -l

La première étape consiste toujours à vérifier les droits `sudo` :


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