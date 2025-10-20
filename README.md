# writeups.hackethical.be

Site Hugo basé sur le thème PaperMod, consacré aux writeups HackTheBox et CTFs — résolutions méthodiques, scripts réutilisables et hacking éthique.

## Présentation

Ce dépôt contient le code source complet du site [writeups.hackethical.be](https://writeups.hackethical.be), construit avec Hugo et le thème PaperMod. Le site regroupe :
- mes writeups HackTheBox et autres challenges CTF ;
- une section *tools* présentant mes scripts Bash ;
- diverses personnalisations (barre de tags, TOC latérale, bouton copier le code, SEO, etc.).

## Structure

```
hugo-writeups/
├── content/         → Writeups et outils
├── layouts/         → Modèles et partiels personnalisés
├── assets/css/      → Styles sur mesure
├── static/          → Favicons et images
├── hugo.yaml        → Configuration principale
└── netlify.toml     → Déploiement Netlify
```

## Utilisation locale

```bash
git clone https://github.com/NoelNac-HackEthical/hugo-writeups.git
cd hugo-writeups
hugo server
```

Ouvre ensuite http://localhost:1313 pour prévisualiser le site.

## Déploiement

Déploiement automatique sur **Netlify** :
- Production : https://writeups.hackethical.be  
- Preview : généré pour chaque Pull Request

## Branches et tags

- Branche principale : `master`  
- Branches de travail : fonctionnalités et tests  
- Tags de sauvegarde : `backup-YYYYMMDD-HHMM-description`

## Auteur

NoelNac
[writeups.hackethical.be](https://writeups.hackethical.be) • [GitHub](https://github.com/NoelNac-HackEthical) • [noelnac@hackethical.be](mailto:noelnac@hackethical.be)

## Licence

Code du site sous licence **MIT**, contenu publié à des fins **éducatives et éthiques uniquement**.
