# Démo Hugo — Template Writeups (PaperMod)

Site de démonstration Hugo déployé sur Netlify :  
📍 **https://hugo.hackethical.be**

---

## Objectifs

- Servir de **base stable** pour des writeups (CTF) avec une **TOC ergonomique** et une **recherche locale avancée**.
- Centraliser les styles dans **`assets/css/extended/custom.css`** (Hugo Pipes).
- Disposer d’un **workflow PR + Deploy Preview** (Netlify) pour valider chaque changement avant merge.
- Préparer la transition vers un **archétype writeup** (prochaine étape).

---

## Fonctionnalités en place ✅

- Thème : **PaperMod** (mode sombre/clair).
- Contenu en **Page Bundles** : `content/writeups/<slug>/index.md`.
- **En-tête d’article (header)** : résumé manuel + vignette `image.png` (120×120) + ligne de **tags** (style homogène avec la home).
- **TOC positionnable (gauche/droite) en desktop** : par défaut **à droite** ; un simple réglage CSS permet de la placer **à gauche** (voir plus bas). Styles :  
  - Style natif (puces, indentation). **Pas de soulignement**.  
  - **Numérotation** H2/H3/H4 (1, 1.1, 1.1.1) ajoutée par CSS (TOC et contenu).  
  - **Sticky** avec variables d’alignement, **pas de scrollbar interne**.  
  - **Synchronisation au scroll** (IntersectionObserver) : l’item de la section visible devient **bleu clair**.  
  - **Auto-déploiement/repli** des sous-niveaux (H3/H4) en fonction de la section active (chevrons ▸/▼).  
  - **“Fin de page” robuste** : un *sentinel* force l’activation du **dernier titre** quand on arrive vraiment en bas.  
  - Repère de sélection par **milieu d’écran** (≈ 40%) pour ne pas “sauter” les sections courtes.  
  - **Mobile** (≤ 991 px) inchangé : la TOC s’affiche **sous** le contenu.
- **Recherche locale avancée** (client-side) :
  - Requêtes insensibles à la casse, multi-termes, **phrases exactes** entre guillemets.
  - **Multi-occurrences** listées (titre + extrait). **Numérotation globale** des occurrences (pas de remise à zéro par page).
  - Couleurs :
    - Sombre : toutes occurrences = **texte jaune vif** sans fond ; occurrence **active** = **noir sur fond jaune**.
    - Clair  : toutes occurrences = **texte orange vif** sans fond ; occurrence **active** = **orange sur fond jaune**.
  - Navigation : **`[`** / **`]`** (précédent/suivant) + mini-barre et boutons.
  - **Ouverture depuis /search** : scroll automatique sur l’occurrence ciblée (avec filet de recentrage).
  - **Sorties** : `Esc` (nettoyage doux) ; `Shift+Esc` (sortie dure, retrait des `<mark>`).
  - Exclusions du surlignage : dates “Publié / Modifié” et **TOC** (toutes variantes).
- **Home** : cartes résumé (texte + vignette) au style harmonisé et **clampés à 4 lignes** pour une hauteur uniforme.
- **Hugo Pipes** : minify + fingerprint (CSS/JS).

---

## Arborescence utile

```
assets/
  css/
    extended/
      custom.css              # CSS central : layout, TOC, tags, home, search, numérotation titres
  js/
    highlight.js              # Surlignage & navigation des occurrences (pages & search)

layouts/
  _default/
    single.html               # Gabarit article (header résumé+image+tags, body 2 colonnes, footer nav)
    search.html               # Page /search (index + rendu résultats/occurrences)
  partials/
    post-meta.html            # “Publié le / Modifié le …” + zone tags (shortcode {{< tagsline >}})
    extend_footer.html        # Charge highlight.js + script TOC (sync + auto-collapse + sentinel)
    extend_head.html          # (optionnel) réservé aux ajouts <head>; CSS injecté via Hugo Pipes

static/
  # (images, favicons…)

config :
- hugo.yaml                   # baseURL, outputs (JSON pour /search), params PaperMod…
- netlify.toml                # HUGO_VERSION, HUGO_ENABLEGITINFO, commande build
```

> **Note** : toute règle CSS concernant la TOC qui ne fait **pas** partie de `custom.css` doit être supprimée pour éviter les conflits. Aucun JS ne “déplace” la TOC : elle reste dans le conteneur prévu par le layout.

---

## Front matter conseillé (writeups)

Dans `content/writeups/<slug>/index.md` :

```yaml
---
title: "Valentine.htb"
date: 2025-08-04
lastmod: 2025-08-09
tags: ["HTB","CTF","Heartbleed","Tmux","Linux"]

# Résumé affiché dans le header de l’article et sur la home
summary: >-
  Résumé — Exploitation de Heartbleed (CVE-2014-0160) pour récupérer un mot de passe,
  déchiffrer une clé SSH, puis escalader via une session tmux root oubliée.

# Vignette 120×120
cover:
  image: "image.png"      # présent dans le bundle du writeup
  anchor: "center"        # "top" | "center" | "bottom" selon l’image
---
```

> Le **résumé** est saisi **à la main** dans le front matter pour un contrôle total (pas d’extraction automatique).

---

## Variables & réglages TOC (CSS)

Dans `assets/css/extended/custom.css` :

```css
:root{
  --toc-width: 320px;         /* largeur de la colonne TOC */
  --toc-stick: 2rem;          /* offset sticky en haut de l’écran */
  --toc-align-box: 0.75rem;   /* décale TOUT le panneau (fond + bordure) vers le bas */
  --toc-active: #1E90FF;      /* couleur item actif (clair) */
  --toc_droite: 1;            /* 1 = TOC à droite (défaut), 0 = TOC à gauche */
}
html.dark, body.dark{
  --toc-active: #9ecbff;      /* couleur item actif (sombre) */
}
```

### Basculer la position (desktop)
> Une seule fois, ajoute ce bloc **à la fin** de `custom.css` (il conserve le comportement mobile actuel).

```css
@media (min-width: 992px){
  .post-content{
    display:flex;               /* remplace la grille uniquement en desktop */
    align-items:flex-start;
    gap:2rem;                   /* identique à column-gap */
  }
  #TableOfContents{
    order: var(--toc_droite);   /* 1 => droite, 0 => gauche */
    flex: 0 0 var(--toc-width,320px);
    max-width: var(--toc-width,320px);
  }
  .post-article{
    order: calc(1 - var(--toc_droite));
    min-width:0;
    flex:1 1 auto;
  }
}
```

- **Par défaut** : `--toc_droite: 1;` → TOC à **droite** (comportement d’origine).
- **Pour la TOC à gauche** : mettre `--toc_droite: 0;` dans `:root` (ou via une classe globale si besoin).  
- **Mobile (≤ 991 px)** : inchangé, la TOC s’affiche **sous** le contenu.

---

## Build & Serve (local)

### Rebuild “propre” conseillé
```bash
hugo server -D   --ignoreCache   --disableFastRender   --renderStaticToDisk   --cleanDestinationDir   --forceSyncStatic   --noHTTPCache   --gc
```

### “Hard reset” caches
```bash
# Windows
rmdir /s /q .\public
rmdir /s /q .esources\_gen
hugo mod clean
```

Navigateur : **Ctrl+F5** (hard refresh) ou activer “Disable cache” dans DevTools.

---

## Workflow Git + PR + Deploy Preview

1. **Synchroniser `master`**
   ```bash
   git switch master
   git pull --ff-only
   ```
2. **Créer une branche de travail**
   ```bash
   git switch -c feature/ma-modif
   # … modifications …
   git add -A
   git commit -m "feat: description claire"
   git push -u origin feature/ma-modif
   ```
3. **Ouvrir la PR** (base : `master`) → Netlify crée un **Deploy Preview**.
4. **Vérifier le Preview** (TOC sync & auto-collapse, recherche, dark/clair, home, navigation).
5. **Merge** (Squash & merge de préférence).
6. **Tag de sauvegarde** (optionnel)
   ```bash
   git switch master
   git pull --ff-only
   git tag -a baseline-XYZ -m "checkpoint utile"
   git push origin baseline-XYZ
   ```

---

## Dépendances & paramètres Hugo

- `baseURL: "https://hugo.hackethical.be/"` (**HTTPS + slash final**).
- Sorties (JSON requis pour la recherche) :
  ```yaml
  outputs:
    home: ["HTML","RSS","JSON"]
  ```
- `enableGitInfo: true` (via env Netlify `HUGO_ENABLEGITINFO=true`) pour `lastmod`.
- PaperMod installé (module/submodule) et à jour.

---

## Dépannage rapide

- **TOC en bas** / “qui clignote puis redescend” :
  - vérifier que `custom.css` est bien dans `assets/css/extended/` (donc packagé par PaperMod Extended) ;
  - vérifier la structure `single.html` (colonne article + TOC) ;
  - supprimer tout ancien JS qui “déplace” `#TableOfContents` ;
  - rebuild “propre” + **Ctrl+F5**.
- **Soulignés dans la TOC** : s’assurer que les dernières règles “no-underline” de `custom.css` sont chargées **après** tout le CSS du thème.
- **Recherche** n’amène pas à l’occurrence & pas de mini-barre :
  - `extend_footer.html` doit charger `assets/js/highlight.js` via Hugo Pipes et émettre l’événement d’initialisation ;
  - vérifier `outputs.home` contient `JSON` ;
  - rebuild “propre” + **Ctrl+F5**.
- **Pages blanches** : si PaperMod en submodule, synchroniser puis relancer :
  ```bash
  git submodule sync
  git submodule update --init --recursive --depth 1
  ```

---

## Licences & crédits

- Thème : **PaperMod** — © auteurs respectifs.  
- Scripts (surlignage & TOC sync) : spécifiques à ce dépôt, réutilisables pour le futur template.

---

**Dernière mise à jour** : TOC positionnable (gauche/droite) en desktop via variable CSS `--toc_droite`; recherche avancée; styles unifiés (tags, home, header d’article).
