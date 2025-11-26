---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "{{ replace .Name "-" " " | title }}"
slug: "{{ .Name }}"
date: {{ .Date }}
lastmod: {{ .Date }}
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
---

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

Pour démarrer, lançons mon script d'énumération {{< script "mon-nouveau-nmap" >}} :

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
nmap -sCV -p- -T4 -oN scans/nmap_full.txt <IP_CIBLE>
```

### Scan agressif

Le script enchaîne ensuite automatiquement sur un scan agressif orienté vulnérabilités.

Voici le résultat (mes_scans/aggresive_vuln_scan.txt) :

```bash
 nmap -Pn -A -sV -p"22,2222,8080,35627,42277" --script="http-vuln-*,http-shellshock,http-sql-injection,ssl-cert,ssl-heartbleed,sslv2,ssl-dh-params" --script-timeout=30s -T4 "manage.htb"
```



### Scan ciblé CMS

Le scan ciblé CMS (`mes_scans/cms_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

```bash
scan CM
```



### Scan UDP rapide

Le scan UDP rapide (`mes_scans/udp_vuln_scan.txt`) ne met rien de vraiment exploitable en évidence pour ce CTF.

### Scan des répertoires
Pour la partie découverte de chemins web, j'utilise mon script dédié {{< script "mon-recoweb" >}}

### Scan des vhosts
Enfin, je teste rapidement la présence de vhosts  avec  {{< script "mon-subdomains" >}}

---

## Exploitation – Prise pied (Foothold)

- Vecteur d'entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d'accès (`id`, `whoami`, `hostname`).

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

## Conclusion

- Récapitulatif de la chaîne d'attaque (du scan à root).
- Vulnérabilités exploitées & combinaisons.
- Conseils de mitigation et détection.
- Points d'apprentissage personnels.

---

## Pièces jointes (optionnel)

- Scripts, one-liners, captures, notes.  
- Arbo conseillée : `files/<nom_ctf>/…`