---
title: "Stabiliser un Reverse Shell Bash"
description: "Méthode simple et fiable pour stabiliser un reverse shell Bash et obtenir un terminal interactif."
tags: ["recettes", "tools", "reverse-shell", "bash"]
categories: ["Mes recettes"]
---
## Variante avec Python (pty.spawn)

### Objectifs

Cette méthode permet de transformer un reverse shell basique en un **shell interactif stable**, proche d’une session SSH, en apportant :

- un **pseudo-TTY** côté distant
- la **gestion correcte des signaux** (Ctrl+C, Ctrl+Z)
- l’**auto-complétion** et l’historique
- un affichage propre pour les outils plein écran (`nano`, `less`, `top`)

C’est la **méthode standard en CTF** dès que Python est disponible sur la cible.

### Dans le terminal Bash du Reverse Shell

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

### Mets le shell en arrière-plan (Ctrl+Z)

### Continue dans le terminal et tape une à une les commandes suivantes:

```bash
stty raw -echo; fg


export TERM=xterm  


stty cols 132 rows 34
```
<br>

> Adapte cols et rows à la taille réelle de ton terminal local.

------

## Variante sans Python (via `/dev/tty`)

### Objectif

Obtenir :

- un **TTY interactif**
- la **gestion correcte des signaux** (Ctrl+C, Ctrl+Z)
- l’**auto-complétion**
- un affichage propre

Cette variante est utile lorsque Python n’est pas disponible sur la cible.

### Dans le reverse shell (bash ou sh)

```bash
/bin/bash -i
```

Si `/bin/bash` n’est pas disponible, utiliser :

```bash
/bin/sh -i
```

------

### Mets le shell en arrière-plan

```bash
Ctrl+Z
```

------

### Dans ton terminal local (Kali)

```bash
stty raw -echo
fg
```

### Réinitialise correctement le terminal distant

```bash
reset
export TERM=xterm
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.
