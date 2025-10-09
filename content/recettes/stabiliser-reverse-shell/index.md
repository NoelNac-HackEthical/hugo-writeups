---
title: "Stabiliser un reverse shell"
description: "TTY upgrade (script, bash, python, socat) – méthode rapide."
draft: false
showIntro: false
cover:
  hidden: true
  hiddenInSingle: true
updated: 2025-10-09 10:49:57
---
## Étapes

Dans le terminal du reverse shell 

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

ctrl Z

```bash
stty raw -echo; fg
export TERM=xterm  
stty cols 132 rows 34
```

