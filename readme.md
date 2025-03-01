<div align="center">

# 🏢 Calculateur de Primes d'Assurance 🏢

```ascii
  ____      _            _       _                     _          ____       _                     
 / ___|__ _| | ___ _   _| | __ _| |_ ___ _   _ _ __   __| | ___  |  _ \ _ __(_)_ __ ___   ___  ___ 
| |   / _` | |/ __| | | | |/ _` | __/ _ \ | | | '__| / _` |/ _ \ | |_) | '__| | '_ ` _ \ / _ \/ __|
| |__| (_| | | (__| |_| | | (_| | ||  __/ |_| | |   | (_| |  __/ |  __/| |  | | | | | | |  __/\__ \
 \____\__,_|_|\___|\__,_|_|\__,_|\__\___|\__,_|_|    \__,_|\___| |_|   |_|  |_|_| |_| |_|\___||___/
```

<p align="center">
  <strong>Un outil puissant pour simuler et optimiser vos primes d'assurance</strong><br>
  <em>Propriété de Groupe Didacte</em>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
</p>

<p align="center">
  <a href="#-présentation">Présentation</a> •
  <a href="#-fonctionnalités">Fonctionnalités</a> •
  <a href="#-guide-dutilisation">Guide d'utilisation</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-faq">FAQ</a>
</p>

</div>

## 🌟 Présentation

Le **Calculateur de Primes d'Assurance** est une application web moderne qui permet aux professionnels de l'assurance de simuler, calculer et optimiser les primes d'assurance en fonction de divers paramètres et historiques de sinistres.

Cette application offre une interface intuitive pour:
- 💰 Calculer les primes d'assurance en fonction de la surface et des paramètres économiques
- 📉 Analyser l'impact des sinistres sur les primes
- ⚖️ Optimiser le ratio Sinistres/Primes (S/P)
- 📊 Visualiser les résultats via des graphiques interactifs
- 💾 Exporter les données pour une analyse plus approfondie

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=Capture+d%27%C3%A9cran+de+l%27application" alt="Capture d'écran de l'application" width="80%" />
</div>

## 🚀 Fonctionnalités

<div align="center">

| 📊 **Simulation** | 📈 **Analyse** | 💾 **Gestion des données** |
|:-----------------|:--------------|:------------------------|
| Calcul de primes | Graphiques interactifs | Sauvegarde des paramètres |
| Ajustement pour inflation | Tableaux détaillés | Exportation des résultats |
| Gestion des franchises | Comparaison avant/après | Persistance locale |
| Analyse des sinistres | Ratio S/P | Validation des données |

</div>

### ✨ Points forts

- **Interface intuitive**: Navigation simple et efficace entre les différentes étapes
- **Calculs en temps réel**: Résultats mis à jour instantanément lors de la modification des paramètres
- **Visualisations dynamiques**: Graphiques interactifs pour une meilleure compréhension des données
- **Validation intelligente**: Détection automatique des erreurs et incohérences dans les données
- **Exportation flexible**: Possibilité d'exporter les résultats en JSON pour une utilisation externe
- **Thème clair/sombre**: Interface adaptable aux préférences visuelles de l'utilisateur

## 📖 Guide d'utilisation

### Étape 1: Configuration des paramètres généraux

Commencez par renseigner les paramètres généraux de votre simulation:

1. Saisissez la **prime actuelle par m²** que vous payez actuellement
2. Indiquez la **surface totale** de votre bien immobilier
3. Définissez le **taux de taxe** applicable à votre contrat
4. Ajustez le taux d'**inflation** prévu pour les années à venir
5. Fixez votre **ratio S/P cible** selon vos objectifs de rentabilité
6. Précisez le montant de la **franchise** applicable par sinistre

### Étape 2: Saisie des données de sinistres

Renseignez ensuite les informations relatives aux sinistres:

1. Indiquez le **montant total des sinistres** sur la période considérée
2. Précisez le **coût pris en charge par l'assurance** (Coût Cie)
3. Renseignez le **coût payé par le client** (franchises, etc.)
4. Indiquez le **nombre total de sinistres** déclarés
5. Précisez le **nombre de sinistres DDE** (Dégâts Des Eaux)

### Étape 3: Analyse des résultats

Une fois les données saisies, l'application calcule automatiquement:

1. La **prime ajustée** en fonction des paramètres et de l'historique des sinistres
2. La **variation en pourcentage et en €/m²** par rapport à la prime actuelle
3. Le **ratio S/P actuel** et son écart par rapport à la cible
4. La **répartition des coûts** entre l'assureur et l'assuré
5. Des **graphiques comparatifs** pour visualiser les résultats

### Fonctionnalités supplémentaires

- **Sauvegarde des paramètres**: Enregistrez vos configurations pour une utilisation ultérieure
- **Réinitialisation**: Remettez tous les paramètres à leurs valeurs par défaut
- **Exportation**: Téléchargez les résultats au format JSON pour une analyse externe

## 🔧 Paramètres de simulation

L'application prend en compte de nombreux paramètres pour une simulation précise:

### Paramètres généraux
- **Prime actuelle (€/m²)**: Prime d'assurance actuelle par mètre carré
- **Surface totale (m²)**: Surface totale assurée
- **Taux de taxe (%)**: Taux de taxe applicable sur la prime d'assurance
- **Inflation (%)**: Taux d'inflation annuel prévu
- **S/P cible (%)**: Ratio Sinistres/Primes cible
- **Franchise (€)**: Montant de la franchise par sinistre

### Données des sinistres
- **Montant total des sinistres (€)**: Somme totale des sinistres sur la période
- **Coût Cie (€)**: Part des sinistres prise en charge par l'assurance
- **Coût payé par le client (€)**: Part des sinistres payée par le client
- **Nombre de sinistres**: Nombre total de sinistres déclarés
- **Dont sinistres DDE**: Nombre de sinistres Dégâts Des Eaux

## 📊 Résultats et analyses

L'application génère des résultats détaillés incluant:

- **Prime actuelle vs Prime ajustée**: Comparaison des montants avant et après ajustement
- **Variation en pourcentage et en €/m²**: Impact financier des ajustements
- **Ratio S/P actuel vs cible**: Analyse de la rentabilité
- **Répartition des coûts**: Visualisation de la répartition entre assureur et assuré
- **Détails des calculs**: Accès à toutes les étapes intermédiaires du calcul

### Formules de calcul principales

```
Ratio S/P actuel = Coût Cie / Prime totale actuelle
Prime totale actuelle = Prime par m² × Surface totale
Coût projeté des sinistres = Coût Cie × (1 + Inflation)
Prime nette requise = Coût projeté des sinistres / Ratio S/P cible
Prime totale ajustée = Prime nette requise × (1 + Taux de taxe)
Nouvelle prime par m² = Prime totale ajustée / Surface totale
```

## 🛠️ Installation et démarrage

### Prérequis

- Node.js 18.0 ou supérieur
- npm 9.0 ou supérieur

### Installation

```bash
# Cloner le dépôt
git clone [url-du-repo]
cd calculateur-de-primes

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en mode production
npm start
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```
NEXT_PUBLIC_APP_NAME=Calculateur de Primes d'Assurance
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X  # Optionnel
```

## 🔍 Architecture technique

L'application est construite avec:

- **Next.js**: Framework React pour le rendu côté serveur et client
- **TypeScript**: Pour un typage fort et une meilleure maintenabilité
- **Tailwind CSS**: Pour un design responsive et moderne
- **Recharts**: Pour la visualisation des données
- **React Hook Form**: Pour la gestion des formulaires
- **Context API**: Pour la gestion de l'état global

### Structure du projet

```
calculateur-de-primes/
├── app/                  # Pages et layout Next.js
├── components/           # Composants React réutilisables
├── hooks/                # Hooks React personnalisés
├── lib/                  # Utilitaires et logique métier
│   ├── context/          # Contextes React
│   ├── types.ts          # Types TypeScript
│   └── insurance-calculations.ts  # Logique de calcul
├── public/               # Fichiers statiques
└── styles/               # Styles globaux
```

## 🔒 Sécurité et performance

- **Validation des données**: Vérification complète des entrées utilisateur
- **Gestion des erreurs**: Capture et traitement approprié des exceptions
- **Mise en cache**: Optimisation des calculs répétitifs
- **Monitoring des performances**: Suivi des métriques clés
- **Debouncing**: Limitation des calculs lors de la saisie rapide
- **Lazy loading**: Chargement différé des composants lourds

## 📱 Compatibilité

L'application est entièrement responsive et compatible avec:
- 💻 Ordinateurs de bureau (Windows, macOS, Linux)
- 📱 Tablettes (iOS, Android)
- 📱 Smartphones (iOS, Android)
- 🌐 Navigateurs modernes (Chrome, Firefox, Safari, Edge)

## 🔄 Mises à jour et maintenance

L'application bénéficie d'une maintenance régulière:

- 🔄 Mises à jour trimestrielles des paramètres réglementaires
- 🐛 Corrections de bugs en continu
- ✨ Nouvelles fonctionnalités basées sur les retours utilisateurs
- 🔍 Optimisations de performance

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## ❓ FAQ

<details>
<summary><strong>Comment sont calculées les primes ajustées?</strong></summary>
<p>Les primes ajustées sont calculées en fonction du ratio S/P cible, de l'historique des sinistres, de l'inflation prévue et des taxes applicables. L'objectif est d'atteindre le ratio S/P cible tout en tenant compte de l'évolution des coûts.</p>
</details>

<details>
<summary><strong>Puis-je exporter mes résultats?</strong></summary>
<p>Oui, l'application permet d'exporter les résultats au format JSON. Cliquez simplement sur le bouton "Exporter" dans l'interface des résultats.</p>
</details>

<details>
<summary><strong>Les données sont-elles sauvegardées?</strong></summary>
<p>Les paramètres sont sauvegardés localement dans le navigateur. Vous pouvez également utiliser le bouton "Sauvegarder" pour enregistrer explicitement votre configuration actuelle.</p>
</details>

<details>
<summary><strong>Comment réinitialiser tous les paramètres?</strong></summary>
<p>Utilisez le bouton "Réinitialiser" dans l'interface pour remettre tous les paramètres à leurs valeurs par défaut.</p>
</details>

## 📄 Licence

© 2024 Groupe Didacte. Tous droits réservés.

Ce logiciel est la propriété exclusive de Groupe Didacte et ne peut être utilisé, copié, modifié ou distribué sans autorisation écrite préalable.

---

<div align="center">
  <p>
    <strong>Groupe Didacte</strong> - Solutions d'assurance innovantes
  </p>
  <p>
    <a href="https://www.groupedidacte.com">www.groupedidacte.com</a> • 
    <a href="mailto:contact@groupedidacte.com">contact@groupedidacte.com</a> • 
    <a href="tel:+33123456789">+33 1 23 45 67 89</a>
  </p>
  
  <p>
    <a href="https://twitter.com/groupedidacte"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>
    <a href="https://www.linkedin.com/company/groupe-didacte"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  </p>
</div>
