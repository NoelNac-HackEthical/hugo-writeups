---
title: "Outils de stéganographie (CTF)"
description: "Outils de stéganographie utilisés en CTF pour analyser des fichiers et extraire des données cachées."
tags: ["recettes","tools", "stéganographie"]
categories: ["Mes recettes"]
date: 2025-11-22T12:34:34+01:00
---

Cette recette regroupe les outils essentiels utilisés en CTF pour détecter et extraire des données dissimulées par stéganographie.

## Stegseek — outil principal en CTF

- **Outil principal** pour rechercher automatiquement des données cachées et extraire les fichiers protégés par mot de passe

- Recherche automatique (wordlist intégrée)

```bash
stegseek image.jpg
```

## Outils courants

- **stegseek** : brute-force et extraction automatique (outil principal)
- **steghide** : stéganographie classique (embed / extract)
- **strings** : détection rapide de chaînes ASCII suspectes
- **exiftool** : analyse des métadonnées

## Pour plus d’infos

Lien vers un article sur les outils et techniques de stéganographie régulièrement utilisés :

[Steganography : Tools & Techniques](https://medium.com/@ria.banerjee005/steganography-tools-techniques-bba3f95c7148)

