---
title: "Stabiliser un Reverse Shell"
description: "TTY upgrade (script, bash, python, socat) – méthode rapide."
tags: ["recettes", "tools"]
categories: ["Mes recettes"]
---
## Dans le terminal Bash du Reverse Shell taper

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## Faire un [ctrl+Z]

## Continuer dans le terminal et taper

```bash
stty raw -echo; fg
export TERM=xterm  
stty cols 132 rows 34
```
<br>


