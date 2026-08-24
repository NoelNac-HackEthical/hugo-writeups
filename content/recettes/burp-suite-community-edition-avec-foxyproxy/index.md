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

Dans Firefox, ouvre le menu principal puis sélectionne **Extensions and themes**.

Dans la barre de recherche des extensions, recherche :

```text
FoxyProxy
```

Parmi les résultats proposés, sélectionne **FoxyProxy Standard**.

![](firefox-addons-foxyproxy.png)



Sur la page de l’extension, clique sur **Add to Firefox**.

![](foxy-proxy-add-to-firefox.png)



Firefox affiche alors les permissions demandées par l’extension. Clique sur **Add** pour confirmer l’installation.

<img
  src="foxy-proxy-add-popup.png"
  alt="Fenêtre Firefox affichant les permissions demandées lors de l’installation de FoxyProxy"
  class="img-left-70">



Une fois l’installation terminée, Firefox confirme que **FoxyProxy** a été ajouté. Laisse l’option **Pin extension to toolbar** activée afin de garder l’icône de l’extension facilement accessible, puis clique sur **OK**.

<img
  src="foxyproxy-was-added-to-firefox.png"
  alt="Confirmation dans Firefox que l’extension FoxyProxy a bien été installée"
  class="img-left-70">

L’icône de FoxyProxy apparaît maintenant dans la barre d’outils de Firefox. Clique dessus pour ouvrir son menu, puis sélectionne **Options**.

<img
  src="foxyproxy-config-options.png"
  alt="Menu de FoxyProxy dans Firefox avec le bouton Options permettant d’ouvrir sa configuration"
  class="img-left-50">



Tu peux maintenant passer à la configuration du proxy utilisé par Burp Suite.

### Configurer FoxyProxy pour Burp Suite

Dans les options de FoxyProxy, ouvre l’onglet **Proxies**, puis clique sur **Add** pour créer un nouveau proxy.

![Configuration du proxy Burp Suite dans FoxyProxy avec l’adresse 127.0.0.1 et le port 8080](foxyproxy-config-proxies.png)

Renseigne les champs avec les valeurs suivantes :

```text
Title: Burp Suite
Type: HTTP
Hostname: 127.0.0.1
Port: 8080
```

Laisse les autres champs avec leurs valeurs par défaut, puis clique sur **Save**.

Le proxy `127.0.0.1:8080` correspond au proxy local utilisé par défaut par Burp Suite.

La vérification de la configuration sera effectuée plus loin, directement avec Burp Suite et Firefox.

### Lancer Burp Suite Community Edition

Sous Kali Linux, lance **Burp Suite Community Edition** depuis le menu des applications.

Au premier écran, conserve l’option **Temporary project in memory**, puis clique sur **Next**.

<img
  src="burp-suite-temporary-project-in-memory.png"
  alt="Écran de démarrage de Burp Suite Community Edition avec l’option Temporary project in memory sélectionnée et le bouton Next"
  class="img-left-70">



À l’écran suivant, conserve l’option **Use Burp defaults**, puis clique sur **Start Burp**.

<img
  src="burp-suite-use-burp-defaults.png"
  alt="Écran de configuration de Burp Suite Community Edition avec l’option Use Burp defaults sélectionnée et le bouton Start Burp"
  class="img-left-70">



Burp Suite démarre alors et affiche son interface principale.

![Interface principale de Burp Suite Community Edition après le démarrage](burp-suite-first-screen.png)
