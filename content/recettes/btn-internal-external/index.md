---
title: "Boutons internes et externes"
description: "Créer des boutons internes (même onglet) et externes (nouvel onglet) avec Hugo PaperMod"
tags: ["recette", "shortcode", "hugo", "css"]
---

<div class="no-cols">

## Objectif
- **Boutons internes** → ouvrir les pages du site **dans le même onglet**.  
- **Boutons externes / téléchargements** → ouvrir en **nouvel onglet**.

---

## Étape 1 : Shortcode `btn-internal`

Créer le fichier :

    layouts/shortcodes/btn-internal.html

Contenu :

    {{- $href := .Get "href" -}}
    {{- $text := .Get "text" -}}
    {{- $class := .Get "class" | default "" -}}

    <a class="he-btn {{ $class }}" href="{{ $href }}">
      {{ $text }}
    </a>

👉 Pas de `target="_blank"` → ouvre toujours dans le même onglet.

---

## Étape 2 : Shortcode `btn-external` (optionnel)

Créer le fichier :

    layouts/shortcodes/btn-external.html

Contenu :

    {{- $href := .Get "href" -}}
    {{- $text := .Get "text" -}}
    {{- $class := .Get "class" | default "" -}}

    <a class="he-btn {{ $class }}" href="{{ $href }}" target="_blank" rel="noopener">
      {{ $text }}
    </a>

👉 Ouverture dans un **nouvel onglet** (comme le `btn` d’origine).

---

## Étape 3 : Utilisation dans tes pages

### Exemple (page Outils)

    <div class="tools-list">
      <div class="tool-item dl-row">
        {{</* btn-internal href="/mes-scripts/" text="Mes scripts" class="he-btn--neutral" */>}}
        <span>Présentation, Usage et Téléchargements</span>
      </div>

      <div class="tool-item dl-row">
        {{</* btn-internal href="/recettes/" text="Recettes" class="he-btn--neutral" */>}}
        <span>Mini-tutos / pas-à-pas / trucs</span>
      </div>

      <div class="tool-item dl-row">
        {{</* btn-internal href="/references/" text="Références" class="he-btn--neutral" */>}}
        <span>Liens utiles et intéressants</span>
      </div>
    </div>

### Exemple (boutons de téléchargement)

    <div class="dl-row">
      {{</* btn-external href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap" text="Télécharger" class="he-btn--neutral" */>}}
      {{</* btn-external href="https://github.com/NoelNac-HackEthical/mes-scripts/releases/latest/download/mon-nmap.sha256" text="SHA256" class="he-btn--sm he-btn--neutral" */>}}
    </div>

---

## Résultat
- Boutons internes → navigation fluide dans le site, **pas d’onglets inutiles**.  
- Boutons externes / téléchargement → ouverture séparée, **on ne perd pas la page**.

</div>
