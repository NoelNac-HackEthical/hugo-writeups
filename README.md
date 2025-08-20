# Démo Hugo — Vers un Template Complet

Ce dépôt Git est le **site Hugo de démonstration** déployé sur Netlify :  
📍 **https://hugo.hackethical.be**

---

## Objectifs

- Servir de **base de travail** pour valider les fonctionnalités (mise en page, TOC, recherche, dark/clair…).  
- Préparer un **template réutilisable** (`hugo-template`) pour de futurs sites.  
- Structurer le contenu en **Page Bundles**.  
- Activer GitInfo pour **lastmod** automatique et un déploiement **Netlify** propre.

---

## Fonctionnalités en place ✅

- Thème : **PaperMod**
- Contenu : `content/writeups/<slug>/index.md` (page bundles)
- Localisation FR (dates, libellés)
- **TOC à droite** (colonne fixe) avec **numérotation** (TOC + titres du contenu)
- **Recherche locale avancée** (client-side) : surlignage, navigation, multi-occurrences, sortie douce/dure
- Pipelines Hugo (**minify + fingerprint**) pour CSS/JS
- Netlify : build avec `HUGO_ENABLEGITINFO` pour lastmod

---

## Structure des surcharges (layouts & assets)

```
assets/
  css/
    extended/
      custom.css              # CSS central (PaperMod le concatène/minifie automatiquement)
  js/
    highlight.js              # Surlignage + navigation des occurrences (pages & search)

layouts/
  _default/
    single.html               # (version wrapper PaperMod d’origine utilisée par le site)
    search.html               # Page de résultats (global index + rendu des occurrences)
  partials/
    post-meta.html            # En-tête “Publié le / Modifié le / …”
    extend_footer.html        # Charge highlight.js et signale "postcontent-ready"
    extend_head.html          # (vide / non nécessaire : CSS via assets/css/extended)

netlify.toml                  # Config Netlify (Hugo version, envs)
hugo.yaml                     # Config Hugo (baseURL, outputs, params…)
```

---

## TOC à droite (stable)

### Structure HTML utilisée (wrapper PaperMod)
```html
<article class="post-single">
  <div class="post-body-wrapper">
    <div class="post-content">…</div>
    <aside class="toc-sidebar">
      <nav id="TableOfContents">…</nav>
    </aside>
  </div>
</article>
```

### Feuilles de style
- **`assets/css/extended/custom.css`** : applique la mise en page 2 colonnes via `.post-body-wrapper` (flex), stylise `.toc-sidebar #TableOfContents`, ajoute le titre **“Sommaire”** (pseudo-élément), numérote H2/H3/H4 **dans la TOC** et **dans le contenu**.

> Note : aucune manipulation DOM pour la TOC n’est nécessaire (et **aucun script** ne déplace `#TableOfContents`).

---

## 🔍 Recherche locale avancée

- **Requêtes** : insensible à la casse, multi-termes, **phrases exactes** entre guillemets.  
- **Occurrences multiples** listées (titre + extrait contenu).  

**Surlignage & navigation**
- **Page “search”** :  
  - toutes les occurrences = **texte** sans fond  
    - **mode sombre** : **jaune vif** (texte)  
    - **mode clair** : **orange vif** (texte)  
  - occurrence **active** : **fond jaune**, texte **noir** (sombre) / **orange** (clair)  
  - **numérotation globale** des occurrences (ne redémarre pas à chaque page)  
  - résultats **sous** l’input (input élargi)
- **Dans les pages article** : mêmes couleurs/règles que ci-dessus.
- **Navigation** : `[` et `]` (précédent/suivant) + mini-barre compteur et boutons.

**Ouverture depuis /search**
- Scroll automatique sur l’occurrence ciblée (avec filet de recentrage en cas de décalage de mise en page).

**Sorties**
- **Échap** / bouton **×** : nettoie tout (marks + nav), **reste** exactement où l’on est.  
- **Maj+Échap** : sortie “dure” (retire les `<mark>` du DOM en verrouillant la position).

**Exclusions** du surlignage : dates **“Publié / Modifié”**, **TOC** (toutes variantes).

**Fichiers concernés**
```
layouts/_default/search.html        # Page de recherche (index + rendu des occurrences)
assets/js/highlight.js              # Surlignage + nav locale & inter-pages + sorties
layouts/partials/extend_footer.html # Inclusion du script via Hugo Pipes (+ 'postcontent-ready')
```

---

## Build & Serve (local)

### Rebuild “propre” (recommandé)
```bash
hugo server -D   --ignoreCache   --disableFastRender   --renderStaticToDisk   --cleanDestinationDir   --forceSyncStatic   --noHTTPCache   --gc
```

### “Hard reset” caches (si besoin)
```bash
# Windows
rmdir /s /q .\public
rmdir /s /q .esources\_gen
hugo mod clean
```
> Navigateur : **Ctrl+F5** (hard refresh) ou coche **Disable cache** (DevTools → Network).

---

## Workflow Git + PR + Netlify Deploy Preview

1) **Mise à jour** de `master`
   ```bash
   git switch master
   git pull --ff-only
   ```
2) **Branche de travail**
   ```bash
   git switch -c feature/ma-modif
   # … modifications …
   git add -A
   git commit -m "feat: description claire"
   git push -u origin feature/ma-modif
   ```
3) **Ouvrir la PR** sur GitHub (base: `master`) → Netlify crée un **Deploy Preview**.  
4) **Vérifier le Preview** (TOC, numérotation, recherche, dark/clair).  
5) **Merge** (Squash & merge).  
6) **Tag de sauvegarde** (optionnel)
   ```bash
   git switch master
   git pull --ff-only
   git tag -a baseline-XYZ -m "checkpoint utile"
   git push origin baseline-XYZ
   ```

---

## Paramètres Hugo importants

- `baseURL: "https://hugo.hackethical.be/"` (HTTPS + slash final)
- `outputs`
  ```yaml
  outputs:
    home: ["HTML","RSS","JSON"]  # JSON requis pour l’index de recherche
  ```
- `enableGitInfo: true` (dans Netlify via `HUGO_ENABLEGITINFO=true`)
- Thème PaperMod activé (module/submodule selon ta config)

---

## Dépannage rapide

- **La TOC retombe en bas** :  
  - vérifier que la structure HTML contient **`.post-body-wrapper`** avec **`.post-content`** et **`.toc-sidebar`** ;  
  - vérifier que **`custom.css`** est bien dans `assets/css/extended/` (PaperMod Extended) ;  
  - hard refresh navigateur.
- **Recherche n’amène pas au bon endroit** : vérifier que `extend_footer.html` charge bien `assets/js/highlight.js` via Hugo Pipes et émet `postcontent-ready`.
- **Pages blanches en local** : synchroniser PaperMod si module/submodule :
  ```bash
  git submodule sync
  git submodule update --init --recursive --depth 1
  ```
  puis relancer `hugo server` (commande “propre” ci-dessus).

---

## Licences & crédits

- Thème : **PaperMod** — © auteurs respectifs.  
- Code de surlignage/navigation : spécifique à ce dépôt, librement réutilisable dans le cadre du template.

---

*Dernière mise à jour : TOC wrapper stable, CSS via PaperMod Extended, recherche avancée (couleurs dark/clair, numérotation globale, navigation, sorties).*
