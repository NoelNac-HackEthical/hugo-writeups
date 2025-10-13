---
# === Archetype: writeups (Page Bundle) ===
# Copié vers content/writeups/<nom_ctf>/index.md

title: "Test Machine"
slug: "test-machine"
date: 2025-08-25T16:43:24+02:00
lastmod: 2025-08-25T16:43:24+02:00
draft: false

# --- PaperMod / navigation ---
type: "writeups"
summary: "Entrée de démonstration générée avec l’archetype writeups : vérifie TOC, fallback image et rendu summary sur la home (via mainSections). Sert de gabarit pour les futurs writeups"
description: "Courte description SEO et pour l’aperçu social."
tags: ["CTF","HackTheBox","writeup"]
categories: ["Mes writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "Test Machine"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF (placeholders à éditer après création) ---
ctf:
  platform: "Hack The Box"
  machine: "Test Machine"
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
| **Machine**    | <Test Machine> |
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

### Scan initial

#### Services détectés
1. **22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.11 (Ubuntu Linux; protocol 2.0)**
   → ssh-hostkey: ECDSA, ED25519  

2. **80/tcp open  http    nginx 1.24.0 (Ubuntu)**
   → http-title: Edukate - Online Education Website  
   → http-server-header: nginx/1.24.0 (Ubuntu)  

#### OS détecté
`Linux 4.15 - 5.19, Linux 5.0 - 5.14`

#### UDP
*(aucun port `open` strict détecté ; scan top 20)*

#### Vue synthétique
- **TCP ouverts :** `22,80`
- **UDP ouverts :** *(aucun open strict)*

### Enum applicative

- Fuzzing (ffuf/gobuster), CMS/version, endpoints/API, users potentiels.
- Commentaires HTML, fichiers oubliés, dev notes, etc.

---

## Exploitation – Prise de pied (Foothold)

- Vecteur d’entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d’accès (`id`, `whoami`, `hostname`).

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
