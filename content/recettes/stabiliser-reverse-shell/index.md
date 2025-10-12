---
title: "Stabiliser un Reverse Shell"
description: "TTY upgrade (script, bash, python, socat) – méthode rapide."
draft: false
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
updated: 2025-10-09 10:49:57
---
## Dans le terminal Bash du Reverse Shell taper

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## Faire un [ctrl+Z]

## Ensuite dans le terminal taper

```bash
stty raw -echo; fg
export TERM=xterm  
stty cols 132 rows 34
```
<br>


