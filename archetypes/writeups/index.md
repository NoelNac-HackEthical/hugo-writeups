---
# === Archetype: writeups (Page Bundle) ===
# Ce fichier sera copié dans content/writeups/<nom_ctf>/index.md
# Place aussi dans ce dossier bundle : image.png (cover) et difficulty.png (icône difficulté)

title: "{{ replace .Name "-" " " | title }}"
slug: "{{ .Name }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true

# --- PaperMod / navigation ---
type: "writeup"
summary: "Résumé en 2–3 lignes du CTF (visible sur la home/liste)."
description: "Courte description SEO et pour l’aperçu social."
tags: ["CTF","HackTheBox","Writeup"]
categories: ["Writeups"]

# --- TOC & mise en page ---
ShowToc: true
TocOpen: true
# toc_droite: 1     # 1 = TOC à droite, 0 = TOC à gauche (si tu utilises cette option maison)

# --- Cover / images (Page Bundle) ---
cover:
  image: "image.png"
  alt: "{{ replace .Name "-" " " | title }}"
  caption: ""
  relative: true
  hidden: false
  hiddenInList: false
  hiddenInSingle: false

# --- Paramètres CTF réutilisables ---
ctf:
  platform: "Hack The Box"
  machine: "{{ replace .Name "-" " " | title }}"
  difficulty_text: "Easy | Medium | Hard"
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
Tableau d’infos (modèle). Adapte librement ou supprime si inutile.
==================================================================== -->
| Champ          | Valeur |
|----------------|--------|
| **Plateforme** | {{ with .Params.ctf.platform }}{{ . }}{{ else }}Hack The Box{{ end }} |
| **Machine**    | {{ with .Params.ctf.machine }}{{ . }}{{ else }}{{ replace .Name "-" " " | title }}{{ end }} |
| **Difficulté** | ![difficulty](difficulty.png) {{ with .Params.ctf.difficulty_text }}{{ . }}{{ else }}(à préciser){{ end }} |
| **Cible**      | {{ with .Params.ctf.target_ip }}{{ . }}{{ else }}10.129.x.x{{ end }} |
| **Durée**      | {{ with .Params.ctf.time_spent }}{{ . }}{{ else }}à compléter{{ end }} |
| **Compétences**| {{ with .Params.ctf.skills }}{{ delimit . ", " }}{{ else }}à compléter{{ end }} |

> Astuce : `image.png` et `difficulty.png` sont des placeholders à remplacer.  
> Tu peux aussi prévoir un fallback dans les layouts si un jour l’image manque.

---

## 1. Introduction

- Contexte (source, thème, objectif).
- Hypothèses initiales (services attendus, techno probable).
- Objectifs : obtenir `user.txt` puis `root.txt`.

---

## 2. Énumération

### 2.1 Scan initial

- Commandes (nmap, rustscan, ton `mon_scan`), options, sortie synthétique.
- Exemple :
  ```bash
  nmap -sCV -p- -T4 -oN scans/nmap_full.txt {{ with .Params.ctf.target_ip }}{{ . }}{{ else }}10.129.x.x{{ end }}
  ```

### 2.2 Enum applicative

- Fuzzing (ffuf/gobuster), CMS/version, endpoints/API, users potentiels.
- Commentaires HTML, fichiers oubliés, dev notes, etc.

---

## 3. Exploitation – Prise de pied (Foothold)

- Vecteur d’entrée confirmé (faille, creds, LFI/RFI, upload…).
- Payloads utilisés (extraits pertinents).
- Stabilisation du shell (pty, rlwrap, tmux…), preuve d’accès (`id`, `whoami`, `hostname`).

---

## 4. Escalade de privilèges

### 4.1 Vers utilisateur intermédiaire (si applicable)

- Méthode (sudoers, capabilities, SUID, timers, service vulnérable).
- Indices collectés (configs, clés, cron, journaux).

### 4.2 Vers root

- Vecteur principal, exploitation, contournements.
- Preuves : `id`, `hostnamectl`, `cat /root/root.txt`.
- Remédiations possibles (leçons sécurité).

---

## 5. Les Flags

- `user.txt` : chemin, obtention (preuve succincte).
- `root.txt` : chemin, obtention (preuve succincte).

---

## 6. Conclusion

- Récapitulatif de la chaîne d’attaque (du scan à root).
- Vulnérabilités exploitées & combinaisons.
- Conseils de mitigation et détection.
- Points d’apprentissage personnels.

---

## 7. Pièces jointes (optionnel)

- Scripts, one-liners, captures, notes.  
- Arbo conseillée : `files/<nom_ctf>/…` (si tu publies des ressources associées).

<!-- ====================================================================
Rappels :
- Conserver H2/H3 pour TOC synchronisée et numérotation auto (si activée).
- Laisser draft: true tant que non finalisé.
- Ce fichier vit dans un Page Bundle avec image.png et difficulty.png.
- Complète le bloc .Params.ctf pour alimenter le tableau d’infos et les partials.
==================================================================== -->
