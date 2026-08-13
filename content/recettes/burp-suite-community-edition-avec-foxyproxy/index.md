---
title: "Burp Suite Community Edition avec FoxyProxy"
description: "Installer et configurer FoxyProxy, lancer Burp Suite Community Edition et utiliser Proxy et Repeater."
tags: ["recettes","tools"]
categories: ["Mes recettes"]
date: 2026-08-13T14:49:27+02:00
draft: true
---

## Objectif

- Installer et configurer l’extension **FoxyProxy** dans Firefox.
- Lancer **Burp Suite Community Edition** et faire passer le trafic du navigateur par son proxy local.
- Intercepter une requête HTTP puis l’envoyer dans **Repeater** afin de pouvoir la modifier et la rejouer.

---

## Prérequis

- Kali Linux avec **Burp Suite Community Edition** installé.
- Firefox.
- Une application web accessible depuis le navigateur pour effectuer les tests.
---

## Étapes

### Installer FoxyProxy dans Firefox

Dans Firefox, ouvre le menu principal puis sélectionne **Add-ons and themes**.

Dans la barre de recherche des extensions, recherche :

```text
FoxyProxy
```

Parmi les résultats proposés, sélectionne **FoxyProxy Standard**.

![](firefox-addons-foxyproxy.png)



Sur la page de l’extension, clique sur **Add to Firefox**.

![](foxy-proxy-add-to-firefox.png)



Firefox affiche alors les permissions demandées par l’extension. Clique sur **Add** pour confirmer l’installation.

![](foxy-proxy-add-popup.png)



Une fois l’installation terminée, Firefox confirme que **FoxyProxy** a été ajouté. Laisse l’option **Pin extension to toolbar** activée afin de garder l’icône de l’extension facilement accessible, puis clique sur **OK**.

![](foxyproxy-was-added-to-firefox.png)



L’icône de FoxyProxy apparaît maintenant dans la barre d’outils de Firefox. Clique dessus pour ouvrir son menu, puis sélectionne **Options**.

![](burp-suite-community-edition-avec-foxyproxy\foxyproxy-config-options.png)



Tu peux maintenant passer à la configuration du proxy utilisé par Burp Suite.

### Configurer FoxyProxy pour Burp Suite

Clique sur l’icône **FoxyProxy** dans la barre d’outils de Firefox, puis ouvre les paramètres de l’extension.

Ajoute un nouveau proxy avec les valeurs suivantes :

```text
Title: Burp Suite
Proxy Type: HTTP
Proxy IP address or DNS name: 127.0.0.1
Port: 8080
```

Enregistre ensuite la configuration.

Le proxy `127.0.0.1:8080` correspond au proxy local utilisé par défaut par Burp Suite
