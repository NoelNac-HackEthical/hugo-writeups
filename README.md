# Démo Hugo — Vers un Template Complet

Ce dépôt Git est le **site Hugo de démonstration** associé à la publication Netlify :  
📍 **https://hugo.hackethical.be**

---

## Objectifs

Ce site sert de **base de travail** pour :

- Tester et valider toutes les fonctionnalités que je souhaite dans mes futurs sites Hugo.
- Préparer un **template réutilisable** (`hugo-template`) à cloner pour de nouveaux projets.
- Structurer les contenus sous forme de **Page Bundles**.
- Activer les options avancées de Hugo : tags, catégories, menus dynamiques, recherche locale, affichage "last modified", thème sombre/clair, etc.
- Produire une version Netlify prête à déployer.

---

## Fonctionnalités en place ✅

- Thème [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- Contenu structuré en page bundles (`content/writeups/<slug>/index.md`)
- Traduction française (`fr.yaml`) avec affichage des dates localisées
- Support Netlify via `netlify.toml`
- Personnalisation CSS (`assets/css/custom.css`)
- Surcharge des layouts Hugo (`layouts/partials/post-meta.html`, etc.)
- GitInfo activé pour `lastmod` automatique

## 🔍 Recherche locale avancée

Recherche client-side puissante, intégrée à PaperMod :  
- **Exacte** (insensible à la casse), multi-termes et **phrases exactes** via guillemets.  
- **Multi-occurrences** : on liste toutes les occurrences (titre + contenu).  
- **Surlignage** lisible (jaune + gras, sans fond), y compris dans les blocs `<pre>/<code>`.  
- **Scroll auto** sur l’occurrence cliquée.  
- **Navigation** `◀ n / total ▶` avec **raccourcis** `[` et `]`.  
- **Navigation inter-pages** : passe à la page suivante/précédente quand on atteint la fin.  
- **Exclusions** : dates « Publié le / Mise à jour » et **TOC** (toutes variantes) ne sont pas surlignés.  
- **Anti-cache** (Hugo pipelines : `minify` + `fingerprint`).  

### Fichiers concernés
```plaintext
layouts/_default/search.html        # Page de recherche (liste toutes les occurrences)
assets/js/highlight.js              # Surlignage + nav locale & inter-pages (+ exclusions)
layouts/partials/extend_footer.html # Inclusion du script (Hugo Pipeline + fingerprint)
