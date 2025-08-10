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

### 🔍 Recherche locale avancée
- Basée sur `index.json` généré par Hugo (`layouts/_default/index.json.json`).
- Recherche **exacte** insensible à la casse + **multi-occurrences** par page.
- Affichage clair : `x occurrence(s) dans y page(s)`.
- Surlignage de **toutes** les occurrences trouvées dans la page cible.
- **Scroll automatique** vers l’occurrence cliquée depuis la page de recherche.
- Barre de navigation : `◀ n / total ▶` + raccourcis clavier (`[` = précédent, `]` = suivant).
- Fallback possible vers Fuse.js Basic pour recherche floue si aucun match exact.
- Anti-cache des scripts grâce à `resources.Get | minify | fingerprint` dans `extend_footer.html`.

**Fichiers concernés :**
```plaintext
assets/js/highlight.js              # Surlignage + navigation entre occurrences
layouts/_default/search.html        # Page de recherche
layouts/partials/extend_footer.html # Inclusion du script highlight.js avec fingerprint anti-cache
layouts/_default/index.json.json    # Génération de l'index JSON pour la recherche
