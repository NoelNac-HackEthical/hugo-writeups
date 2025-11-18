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

### Scan initial 

- Commandes (nmap, rustscan, ton `mon_scan`), options, sortie synthétique. 
- Exemple :
  ```bash
  nmap -sCV -p- -T4 -oN scans/nmap_full.txt <IP_CIBLE>
  ```

### Scan agressif

- Fuzzing (ffuf/gobuster), CMS/version, endpoints/API, users potentiels.
- Commentaires HTML, fichiers oubliés, dev notes, etc.

### Scan réperoires

### Scan vhosts


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
