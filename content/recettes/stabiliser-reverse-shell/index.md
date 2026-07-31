---
title: "Stabiliser un Reverse Shell Bash"
description: "Méthodes simples et fiables pour stabiliser un reverse shell Bash et obtenir un terminal interactif."
tags: ["Recettes", "Tools", "reverse-shell", "Bash"]
categories: ["Mes recettes"]
---



## Objectif

Après l’obtention d’un reverse shell, le terminal est souvent limité :

- pas d’auto-complétion ;
- gestion incorrecte de `Ctrl+C` ;
- affichage cassé ;
- impossibilité d’utiliser correctement `nano`, `top`, `less`, etc.

Cette recette permet d’obtenir un shell interactif beaucoup plus confortable et proche d’une véritable session SSH.

> Sans stabilisation, `Ctrl+C` peut fermer complètement le reverse shell.

## Préparer le listener côté Kali

Deux possibilités peuvent être utilisées pour préparer le listener sur Kali : `rlwrap` ou un simple `nc`.

### Listener avec rlwrap

`rlwrap` apporte immédiatement un meilleur confort d’utilisation, notamment pour l’édition de ligne et l’historique des commandes :

```bash
rlwrap -cAr nc -lvnp 4444
```

Cette commande convient bien lorsque tu souhaites disposer d’un shell plus agréable dès la réception de la connexion.

### Listener avec nc

Tu peux également utiliser directement Netcat :

```bash
nc -lvnp 4444
```

Cette version est plus minimale, mais elle évite d’ajouter une couche supplémentaire entre le terminal local et le reverse shell. Elle peut donc être préférable lorsque tu comptes effectuer une stabilisation complète avec `stty raw -echo`.

En pratique :

- utilise `rlwrap` pour améliorer rapidement un shell simple ;
- utilise `nc` pour conserver un listener minimal avant une stabilisation complète.

Les méthodes présentées dans cette recette peuvent être utilisées avec les deux types de listeners.

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

Teste d’abord `python3` :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Si `python3` n’est pas disponible :

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```

### Mettre le shell en arrière-plan

Utilise la combinaison de touches suivante :

```text
Ctrl+Z
```

### Dans ton terminal Kali

Désactive l’écho local, passe le terminal en mode brut, puis ramène le reverse shell au premier plan :

```bash
stty raw -echo; fg
```

Après `fg`, il peut être nécessaire d’appuyer une fois sur `Entrée` pour retrouver l’invite du reverse shell.

### Configurer le terminal distant

Deux variantes peuvent être utilisées.

#### Variante avec export TERM

Dans le reverse shell :

```bash
export TERM=xterm
```

#### Variante avec reset

Tu peux également réinitialiser le terminal avec :

```bash
reset
```

Lorsque `reset` demande le type de terminal, réponds :

```text
xterm
```

Définis ensuite explicitement la variable `TERM` :

```bash
export TERM=xterm
```

Cette variante permet de réinitialiser un affichage devenu incorrect, puis d’indiquer clairement aux programmes interactifs que le terminal doit être traité comme un terminal `xterm`.

### Adapter la taille du terminal

Définis ensuite le nombre de colonnes et de lignes :

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.

Tu peux obtenir ces valeurs dans un autre terminal Kali avec :

```bash
stty size
```

La commande affiche d’abord le nombre de lignes, puis le nombre de colonnes :

```text
34 132
```

Tu peux alors utiliser :

```bash
stty rows 34 cols 132
```

## Méthode 2 — script

Si Python n’est pas disponible, `script` permet souvent d’obtenir un véritable pseudo-terminal stable et propre.

### Dans le reverse shell

```bash
script -qc /bin/bash /dev/null
```

Alternative :

```bash
script /dev/null -c bash
```

### Mettre le shell en arrière-plan

```text
Ctrl+Z
```

### Dans ton terminal Kali

```bash
stty raw -echo; fg
```

Après `fg`, appuie une fois sur `Entrée` si l’invite du reverse shell ne réapparaît pas immédiatement.

### Configurer le terminal distant

Tu peux définir directement le type de terminal :

```bash
export TERM=xterm
```

Tu peux aussi utiliser la variante avec `reset` :

```bash
reset
```

Lorsque le type de terminal est demandé, réponds :

```text
xterm
```

### Adapter la taille du terminal

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.

## Méthode 3 — Fallback minimal avec bash -i

Si ni Python ni `script` ne sont disponibles, un shell interactif minimal peut malgré tout être obtenu.

### Dans le reverse shell

```bash
/bin/bash -i
```

Si `/bin/bash` n’est pas disponible :

```bash
/bin/sh -i
```

### Mettre le shell en arrière-plan

```text
Ctrl+Z
```

### Dans ton terminal Kali

```bash
stty raw -echo; fg
```

Après `fg`, appuie une fois sur `Entrée` si nécessaire.

### Configurer le terminal distant

Utilise l’une des deux variantes suivantes.

Avec la variable `TERM` :

```bash
export TERM=xterm
```

Ou avec `reset` :

```bash
reset
```

Lorsque `reset` demande le type de terminal, réponds :

```text
xterm
```

### Adapter la taille du terminal

```bash
stty cols 132 rows 34
```

> Adapte `cols` et `rows` à la taille réelle de ton terminal local.

## Restaurer le terminal Kali après la fermeture du shell

Après la fermeture volontaire ou accidentelle du reverse shell, ton terminal Kali peut rester sans écho ou sembler bloqué à cause de la commande :

```bash
stty raw -echo
```

Dans ce cas, saisis la commande suivante, même si les caractères ne s’affichent pas :

```bash
reset
```

Appuie ensuite sur `Entrée`.

Si cela ne suffit pas, ferme le terminal concerné et ouvre-en un nouveau.

## Alternatives supplémentaires

Certaines cibles peuvent également disposer d’outils utiles comme :

- `perl` ;
- `socat`.

`socat` permet notamment d’obtenir un shell très proche d’une véritable session SSH, mais nécessite généralement une configuration plus avancée.
