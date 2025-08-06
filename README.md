# Démo Hugo — Vers un Template Complet

Ce dépôt Git est le **site Hugo de démonstration** associé à la publication Netlify :  
📍 **https://hugo.hackethical.be**

---

## Objectifs

Ce site sert de **base de travail** pour :

- Tester et valider toutes les fonctionnalités que je souhaite dans mes futurs sites Hugo
- Préparer un **template réutilisable** (`hugo-template`) à cloner pour de nouveaux projets
- Structurer les contenus sous forme de **Page Bundles**
- Activer les options avancées de Hugo : tags, catégories, menus dynamiques, recherche locale, affichage "last modified", thème sombre/clair, etc.
- Produire une version Netlify prête à déployer

---

## Fonctionnalités en place ✅

- Thème [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- Contenu structuré en page bundles (`content/writeups/<slug>/index.md`)
- Traduction française (`fr.yaml`) avec affichage des dates localisées
- Support Netlify via `netlify.toml`
- Personnalisation CSS (`assets/css/custom.css`)
- Surcharge des layouts Hugo (`layouts/partials/post-meta.html`, etc.)
- GitInfo activé pour `lastmod` automatique

---

## À venir 🚧

- Menus dynamiques (catégories, archives, tags)
- Page de recherche (JS + Fuse.js)
- Système de taxonomies complet
- Ajout de commentaires (facultatif)
- Template `hugo-template` basé sur ce dépôt

---

## Déploiement

Ce site est automatiquement publié sur Netlify à chaque `git push` :

🔗 **https://hugo.hackethical.be**

---

## Licence

À usage personnel — librement réutilisable pour mes autres projets.

