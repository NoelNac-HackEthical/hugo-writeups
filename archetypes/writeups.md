---
# === Archetype writeups – v1 (stable) ===
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

# H1 SEO (via title, pas dans le markdown)
title: "{{ replace .Name "-" " " | title }} — HTB Easy Writeup & Walkthrough"
linkTitle: "{{ replace .Name "-" " " | title }}"
slug: "{{ .Name }}"
date: {{ .Date }}
#lastmod: {{ .Date }}
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
  alt: "{{ replace .Name "-" " " | title }}"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "{{ replace .Name "-" " " | title }}"
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
{{ $machine := lower (path.Base (strings.TrimSuffix "/" .File.Dir)) }}
<!-- ====================================================================
Tableau d'infos (modèle) — Remplacer les valeurs entre <...> après création.
Aucun templating Hugo dans le corps, pour éviter les erreurs d'archetype.
====================================================================
| Champ          | Valeur |
|----------------|--------|
| **Plateforme** | <Hack The Box> |
| **Machine**    | <{{ replace .Name "-" " " | title }}> |
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
nmap -sCV -p- -T4 -oN scans/nmap_full.txt {{ $machine }}.htb
```

### Scan FTP/SMB (si services détectés)

Après le scan initial, le script enchaîne automatiquement avec une phase d’énumération ciblée **FTP/SMB** si l’un des services suivants est détecté :

- **FTP** sur le port **21**
- **SMB** sur le port **139** et/ou **445**

Les résultats sont enregistrés dans (`scans_nmap/enum_ftp_smb_scan.txt`) :



### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Ce scan fournit des informations détaillées sur les services et versions détectés.

Les résultats sont enregistrés dans (`scans_nmap/aggressive_vuln_scan.txt`) :

```bash
 nmap -Pn -A -sV -p"22,2222,8080,35627,42277" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "{{ $machine }}.htb"
```



### Scan ciblé CMS

Le script exécute ensuite un scan ciblé CMS (scans_nmap/cms_vuln_scan.txt).



### Scan UDP rapide

Le script lance également un scan UDP rapide afin de détecter d’éventuels services supplémentaires (`scans_nmap/udp_vuln_scan.txt`).

### Énumération des chemins web
Pour la découverte des chemins web, tu peux utiliser le script dédié {{< script "mon-recoweb" >}}

```bash
mon-recoweb {{ $machine }}.htb

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

### Recherche de vhosts

Enfin, tu peux tester la présence de vhosts à l’aide du script {{< script "mon-subdomains" >}}.

```bash
mon-subdomains {{ $machine }}.htb

# Résultats dans le répertoire scans_subdomains/
#  - scans_subdomains/scan_vhosts.txt
```

Si aucun vhost distinct n’est identifié, ce fichier confirme l’absence de résultats supplémentaires.

## Prise pied

- Vecteur d'entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d'accès (`id`, `whoami`, `hostname`).

---

## Escalade de privilèges

{{< escalade-intro user="ssh_user" >}}

Comme expliqué dans la recette {{< recette "privilege-escalation-linux" >}}, l’escalade de privilèges Linux suit une méthode structurée : observer d’abord les tâches automatiques, puis vérifier les pistes classiques une par une avant de passer aux outils plus complets.

L’objectif est de comprendre le système avant de tenter une exploitation.

### Préparation des outils d’énumération

Depuis la machine Kali, tu prépares les outils utiles pour l’énumération locale :

* `pspy64`
* `suid3num.py`
* `linpeas.sh`
* `les.sh`

Avec l’aide de la recette {{< recette "copier-fichiers-kali" >}}, tu peux les transférer vers un répertoire accessible en écriture sur la cible, par exemple `/dev/shm` ou `/tmp`.

Sur la cible :

```bash
cd /dev/shm
chmod +x pspy64
chmod +x linpeas.sh
chmod +x les.sh
```

Le répertoire `/dev/shm` est pratique en CTF, car il est généralement accessible en écriture et stocké en mémoire volatile.

### Observation passive avec pspy64

Avant de lancer les vérifications manuelles, tu ouvres une deuxième session SSH et tu démarres `pspy64`.

```bash
cd /dev/shm
./pspy64
```

Cette observation permet de surveiller les processus exécutés automatiquement sur la machine, notamment ceux lancés par `root`.

Les éléments intéressants à surveiller sont :

* les commandes exécutées avec `UID=0`
* les scripts lancés automatiquement
* les tâches cron personnalisées
* les fichiers ou chemins utilisés par des processus root
* les binaires appelés avec des chemins relatifs

Tu laisses ensuite `pspy64` tourner pendant le reste de l’énumération manuelle.

### Vérification sudo

Tu vérifies ensuite les permissions sudo de l’utilisateur courant :

```bash
sudo -l
```

Exemple de résultat sans droit sudo exploitable :

```text
ssh_user@machine:~$ sudo -l
[sudo] password for ssh_user:
Sorry, user ssh_user may not run sudo on machine.
```

À ce stade, il faut rechercher en priorité :

* les droits `NOPASSWD`
* les commandes exécutables en root
* les scripts personnalisés
* les variables d’environnement conservées
* les binaires exploitables via GTFOBins

Si une commande exploitable apparaît ici, cette piste devient prioritaire.

### Exploration du contexte utilisateur

Tu identifies ensuite précisément le contexte dans lequel tu te trouves :

```bash
whoami
id
pwd
uname -a
hostname
```

Cette étape permet de confirmer :

* l’utilisateur courant
* les groupes associés
* le répertoire de travail
* la version du noyau Linux
* l’architecture de la machine
* le nom de l’hôte
* d’éventuels indices de containerisation

Exemple :

```text
ssh_user
uid=1000(ssh_user) gid=1000(ssh_user) groups=1000(ssh_user)
/home/ssh_user
Linux machine 6.8.0-59-generic #61-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux
machine
```

### Recherche de fichiers lisibles intéressants

Avant de poursuivre, tu recherches les fichiers accessibles à l’utilisateur courant dans les emplacements classiques comme `/home` et `/opt`.

Ces répertoires contiennent souvent des scripts internes, des sauvegardes, des fichiers de configuration ou des outils personnalisés.

```bash
find /home /opt -type f -readable 2>/dev/null
```

Les fichiers intéressants peuvent ensuite être inspectés manuellement, en particulier s’ils contiennent :

* des identifiants
* des chemins internes
* des scripts exécutés automatiquement
* des fichiers de configuration
* des sauvegardes
* des clés privées

### Analyse des Linux capabilities

Tu vérifies ensuite si certains binaires disposent de capabilities Linux.

```bash
getcap -r / 2>/dev/null
```

Les capabilities permettent à un programme d’effectuer certaines actions privilégiées sans être exécuté directement en root.

Les éléments les plus intéressants sont notamment :

* `cap_setuid`
* `cap_setgid`
* `cap_sys_admin`
* toute capability appliquée à un binaire inhabituel

Exemple de résultat classique :

```text
/usr/bin/ping cap_net_raw=ep
```

Un résultat standard comme `ping` n’est généralement pas exploitable. En revanche, une capability dangereuse sur un binaire inattendu doit être analysée attentivement.

### Recherche de binaires SUID

Tu recherches ensuite les binaires SUID présents sur le système :

```bash
find / -perm -4000 -type f 2>/dev/null
```

Les binaires SUID peuvent parfois permettre d’exécuter certaines commandes avec les privilèges de leur propriétaire.

Tu recherches en priorité :

* les binaires inhabituels
* les binaires personnalisés
* les scripts ou programmes appartenant à root
* les binaires présents dans GTFOBins
* les cas possibles de PATH hijacking

Exemple de résultats classiques :

```text
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/sudo
/usr/bin/newgrp
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
```

Des binaires système standards ne constituent pas forcément une piste exploitable. En revanche, tout binaire personnalisé ou inattendu mérite une analyse plus poussée.

### Analyse complémentaire avec suid3num.py

Pour compléter l’analyse des SUID, tu peux utiliser `suid3num.py`.

```bash
cd /dev/shm
python3 suid3num.py
```

Cet outil aide à repérer rapidement les binaires SUID intéressants et à vérifier leur présence éventuelle dans GTFOBins.

Après l’exécution de `getcap` ou de `suid3num.py`, chaque binaire suspect doit être vérifié manuellement.

{{< note >}}
GTFOBins est utile pour identifier des techniques connues d’exploitation de binaires Linux, mais il ne remplace pas l’analyse du contexte local. Un binaire présent dans GTFOBins n’est exploitable que si les permissions et les conditions d’exécution s’y prêtent.
{{< /note >}}

### Inspection des tâches cron et timers systemd

Tu vérifies ensuite les tâches planifiées classiques :

```bash
cat /etc/crontab
ls -la /etc/cron*
```

Tu peux également consulter les timers systemd :

```bash
systemctl list-timers
```

Les éléments intéressants sont :

* les scripts exécutés par `root`
* les chemins modifiables par l’utilisateur courant
* les scripts appelés depuis `/opt`, `/home` ou `/tmp`
* les tâches personnalisées
* les scripts exécutés de manière répétée

Exemple de cron système standard :

```text
17 * * * * root cd / && run-parts --report /etc/cron.hourly
25 6 * * * root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6 * * 7 root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6 1 * * root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
```

Si aucune tâche personnalisée n’apparaît, cette piste ne donne pas d’exploitation immédiate.

### Analyse des services locaux

Tu vérifies ensuite les ports en écoute sur la machine.

```bash
ss -tulnp
```

Alternative :

```bash
netstat -tulnp
```

L’objectif est d’identifier d’éventuels services accessibles uniquement en local, par exemple sur `127.0.0.1`.

Les ports souvent intéressants en CTF sont :

```text
3000
5000
8000
8080
9000
```

Ces ports peuvent héberger :

* une interface d’administration
* une API interne
* un dashboard
* un service en mode debug
* une application locale non exposée directement

Si un service écoute uniquement sur `127.0.0.1`, tu peux y accéder depuis Kali avec un tunnel SSH.

Exemple pour un service local sur le port `8080` :

```bash
ssh -L 8080:127.0.0.1:8080 ssh_user@machine.htb
```

Ensuite, depuis Kali :

```text
http://localhost:8080
```

Pour identifier quel service utilise un port donné, tu peux rechercher ce port dans les fichiers de configuration :

```bash
grep -r ':8080' /etc 2>/dev/null
grep -r '8080' /etc 2>/dev/null
```

Cette recherche peut révéler :

* un fichier de configuration
* un service systemd
* un chemin d’application
* un utilisateur d’exécution
* des identifiants ou paramètres sensibles

### Analyse avec LinPEAS

Si l’énumération manuelle ne révèle aucune piste exploitable, tu passes à une analyse plus complète avec LinPEAS.

```bash
cd /dev/shm
./linpeas.sh
```

LinPEAS réalise une énumération locale approfondie et met en évidence les anomalies potentielles.

Dans LinPEAS, les vulnérabilités potentielles sont classées et surlignées par couleur.

![Légende des couleurs de LinPEAS indiquant le niveau de criticité des vulnérabilités](/images/linpeas-legend.png)

Tu l’utilises comme un outil de corrélation, pas comme une solution automatique.

Les éléments à analyser en priorité sont :

* les sections rouges et jaunes
* les fichiers modifiables
* les fichiers appartenant à root mais lisibles
* les scripts exécutés automatiquement
* les services locaux
* les permissions sudo
* les SUID inhabituels
* les capabilities dangereuses
* les variables d’environnement sensibles
* les indices de containerisation

Si LinPEAS confirme une piste déjà observée manuellement, cette piste mérite d’être approfondie.

### Dernier recours : analyse du kernel

Si aucune piste logique ne ressort, tu peux examiner la version du noyau.

```bash
uname -a
```

Tu peux ensuite utiliser `les.sh` pour identifier d’éventuelles vulnérabilités kernel connues.

```bash
cd /dev/shm
./les.sh
```

L’exploitation kernel doit rester un dernier recours.

Avant toute tentative, tu dois vérifier :

* la version exacte du noyau
* l’architecture
* la compatibilité de l’exploit
* les risques de crash
* le mécanisme d’élévation de privilèges

Dans la majorité des machines HTB Easy, l’escalade repose plutôt sur une mauvaise configuration que sur une vulnérabilité kernel.

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