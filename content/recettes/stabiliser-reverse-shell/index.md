---
title: "Stabiliser un Reverse Shell Bash"
description: "Méthodes simples et fiables pour stabiliser un reverse shell Bash et obtenir un terminal interactif."
tags: ["Recettes", "Tools", "reverse-shell", "Bash"]
categories: ["Mes recettes"]
---

## Objectif

Après l’obtention d’un reverse shell, le terminal est souvent limité :

- pas d’auto-complétion
- gestion incorrecte de `Ctrl+C`
- affichage cassé
- impossibilité d’utiliser correctement `nano`, `top`, `less`, etc.

Cette recette permet d’obtenir un shell interactif beaucoup plus confortable et proche d’une vraie session SSH.

> Sans stabilisation, `Ctrl+C` peut fermer complètement le reverse shell.


## Préparer le listener côté Kali

Depuis ton Kali, lance le listener avec `rlwrap` afin d’obtenir un shell plus confortable et mieux géré qu’avec un simple `nc` :

```bash
rlwrap -cAr nc -lvnp 4444
```

`rlwrap` améliore notamment l’édition de ligne, l’historique et la gestion du terminal interactif.


## Identifier les outils disponibles

Dans le reverse shell, commence par rechercher les outils disponibles sur la cible :

```bash
which python3 python script perl socat bash sh nc 2>/dev/null
```

Exemple :

```text
/usr/bin/python3
/usr/bin/script
/usr/bin/perl
/bin/bash
/bin/sh
```

Tu peux ensuite utiliser la meilleure méthode disponible dans cet ordre :

1. `python3`
2. `python`
3. `script`
4. `/bin/bash -i`
5. `/bin/sh -i`

## Méthode 1 — Python

C’est la méthode standard en CTF dès que Python est disponible sur la cible.

### Dans le reverse shell

Tester `python3` :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Si `python3` n’est pas disponible :

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

### Mets le shell en arrière-plan

```text
Ctrl+Z
```

### Dans ton terminal Kali

```bash
stty raw -echo; fg
```

### Dans le reverse shell

```bash
export TERM=xterm
```

Enfin :

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.


## Méthode 2 — script

Si Python n’est pas disponible, `script` permet souvent d’obtenir un vrai pseudo-terminal stable et propre.

### Dans le reverse shell

```bash
script -qc /bin/bash /dev/null
```

Alternative :

```bash
script /dev/null -c bash
```


### Mets le shell en arrière-plan

```text
Ctrl+Z
```


### Dans ton terminal Kali

```bash
stty raw -echo; fg
```

### Dans le reverse shell

```bash
export TERM=xterm
```

Enfin :

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.

------

## Méthode 3 — Fallback minimal (bash -i)

Si ni Python ni `script` ne sont disponibles, un shell interactif minimal peut malgré tout être obtenu.

### Dans le reverse shell

```bash
/bin/bash -i
```

Si `/bin/bash` n’est pas disponible :

```bash
/bin/sh -i
```

### Mets le shell en arrière-plan

```text
Ctrl+Z
```


### Dans ton terminal Kali

```bash
stty raw -echo; fg
```

### Dans le reverse shell

```bash
reset
export TERM=xterm
```

Enfin :

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.



## Réinitialiser le terminal

Si l’affichage reste incorrect après la stabilisation, tu peux lancer la commande suivante directement dans le reverse shell distant :

```bash
reset
```



## Alternatives supplémentaires

Certaines cibles peuvent également disposer d’outils utiles comme :

- `perl`
- `socat`

`socat` permet notamment d’obtenir un shell très proche d’une vraie session SSH, mais nécessite généralement une configuration plus avancée.

