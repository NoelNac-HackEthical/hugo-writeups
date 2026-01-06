---
title: "Installation Modules Python3 Kali"
description: "Mini-tuto : décris en une ligne ce que fait la recette."
slug: "installation-modules-python3-kali"
tags: ["recettes","tools","python3","pip3"]
categories: ["Mes recettes"]
date: 2026-01-06T16:07:37+01:00
---

## Objectif
- Installer rapidement un module Python3 dans Kali Linux **sans mettre en place d’environnement virtuel**, en acceptant explicitement la modification de l’environnement Python système.
- La méthode est rapide et efficace.
- Elle est parfaitement adaptée à un usage **CTF, lab, scripts personnels ou machine jetable**.

---

## Principe de `--break-system-packages`

Depuis Debian 12 (et donc Kali Linux), Python est volontairement **verrouillé** pour empêcher `pip` de modifier l’environnement système.

Sans option particulière, la commande suivante échoue :

```bash
pip3 install <module>
```

Erreur typique :

```bash
┌──(kali㉿kali)-[~/hugo-writeups]
└─$ pip3 install requests                            
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.
    
    If you wish to install a non-Kali-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have pypy3-venv installed.
    
    If you wish to install a non-Kali-packaged Python application,
    it may be easiest to use pipx install xyz, which will manage a
    virtual environment for you. Make sure you have pipx installed.
    
    For more information, refer to the following:
    * https://www.kali.org/docs/general-use/python3-external-packages/
    * /usr/share/doc/python3.13/README.venv

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.

```

C’est une **mesure de protection**, destinée à éviter de casser des dépendances système critiques.

## Principe de `--break-system-packages`

L’option :

```bash
--break-system-packages
```

signifie explicitement :

> « J’accepte de modifier l’environnement Python système, même si cela peut entrer en conflit avec les paquets gérés par `apt`. »

Autrement dit :

- pip **ne bloque plus**
- l’installation se fait **globalement**
- tu assumes le risque (contrôlé dans un contexte Kali)

---

## Méthode recommandée (rapide et efficace)

### Commande standard

```bash
pip3 install <module> --break-system-packages
```

Exemple :

```bash
pip3 install requests --break-system-packages
```

Ou pour un outil CTF courant :

```bash
pip3 install pwntools --break-system-packages
```

---

### Vérification de l’installation

Après installation :

```bash
python3 -c "import requests; print(requests.__version__)"
```

Ou :

```bash
pip3 show requests
```

---

## Quand utiliser cette méthode (et quand l’éviter)

### 👍 À utiliser quand

- machine Kali dédiée au pentest / CTF
- scripts personnels
- environnement non critique
- besoin immédiat (efficacité > pureté)

### ⚠️ À éviter quand

- serveur de production
- environnement Python partagé avec des applications sensibles
- besoin d’isolation stricte entre projets

---

## Bonnes pratiques minimales

Même en utilisant `--break-system-packages` :

- préférer `pip3` (jamais `pip`)

- vérifier ce que tu installes

- éviter les upgrades non nécessaires :

- typiquement

  ```bash
  pip3 install --upgrade requests --break-system-packages
  ```
  peut entraîner :

  - la mise à jour de requests
  - mais aussi de urllib3, idna, certifi, etc.
  - parfois en versions différentes de celles fournies par apt


------

## Conclusion

`--break-system-packages` est une option officielle de pip, prévue pour autoriser explicitement la modification de l’environnement Python système par les utilisateurs avancés.

Dans un contexte Kali Linux :

- elle est **légitime**
- elle est **efficace**
- elle est **cohérente avec un usage offensif / CTF**

👉 **Tu sais ce que tu fais, donc tu peux l’utiliser.**

---
## Note
✅ Aucune option `--break-system-packages` n’est nécessaire pour la désinstallation.
