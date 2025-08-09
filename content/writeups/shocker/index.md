---
title: "Shocker.htb"
date: 2025-08-05
draft: false
tags: ["htb", "shellshock", "Privilege Escalation", "Linux"]
categories: ["HackTheBox", "Easy"]
---

![](image.jpg)

<br>

![](difficulty.jpg)

<br>

Ce writeup détaille l'exploitation de la vulnérabilité **Shellshock** sur la machine *Shocker.htb* (Hack The Box).

## Accès initial

...

## Exploitation

```bash
sudo /usr/bin/perl -e 'exec "/bin/bash";'
