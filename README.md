# QuizArena — Frontend

## Équipe

- Goumou Celestin, goumoucelestin3@gmailcom

---

## Présentation du projet

QuizArena est une plateforme de quiz en ligne permettant de créer des quiz, de les partager avec la communauté et de grimper dans un classement global. Les utilisateurs peuvent créer des questions manuellement ou importer des quiz depuis l'API Open Trivia DB avec traduction automatique en français.

**Points les plus faciles :**
- La mise en place de React Router et du routing
- La création des composants visuels avec Tailwind CSS
- La configuration de react-i18next

**Points les plus difficiles :**
- La gestion du contexte d'authentification avec le renouvellement automatique du JWT
- La synchronisation de l'état du jeu (timer + réponses + score) dans GamePage
- La configuration correcte d'ESLint avec les règles TypeScript et React

---

## Technologies utilisées

| Technologie | Version | Raison du choix |
|---|---|---|
| React | 18 |
| Vite | 6 |
| TypeScript | 5 | Typage statique, détection d'erreurs |
| React Router | 6 | Gestion des routes côté client|
| Tailwind CSS | 3 |
| Axios | 1.x | Client HTTP |
| react-i18next | 15.x | Internationalisation FR/EN |
| Vitest | 4.x | Tests unitaires compatibles Vite |
| React Testing Library | 16.x | Tests de composants orientés utilisateur |
| ESLint | 9.x | Linter avec règles TypeScript et React |

---

## Gestion de projet

- **GitHub** : hébergement du code — [github.com/celestin-001/quizarena-frontend](https://github.com/celestin-001/quizarena-frontend)
- **Architecture** : séparation claire par responsabilité (pages, hooks, api, contexts, components)

---

## Expérience générale

**Niveau avant le projet :**
- React : Intermediare
- TypeScript : débutant
- NestJS : découverte

**Ce qui a été appris :**
- L'utilisation des intercepteurs Axios pour automatiser les headers JWT
- La configuration d'ESLint avec TypeScript
- L'écriture de tests avec Vitest et MemoryRouter

**Ce que je referait :**
- React + Vite + TypeScript : oui, combinaison très productive
- Tailwind CSS : oui, gain de temps énorme sur le style
- react-i18next : oui, simple à mettre en place

---

## Installation

### Prérequis

- **Node.js** >= 18 ([nodejs.org](https://nodejs.org))
- **npm** >= 9
- Le backend QuizArena doit tourner sur `http://localhost:3000`

> Le projet a été développé et testé sur **Linux (Ubuntu)**. Il fonctionne également sur Windows et macOS.

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/celestin-001/quizarena-frontend.git
cd quizarena-frontend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
# ou créer manuellement un fichier .env à la racine :
echo "VITE_API_URL=http://localhost:3000" > .env
```

---

## Utilisation

```bash
# Lancer le serveur de développement
npm run dev
# → Application disponible sur http://localhost:5173

# Lancer les tests
npm run test

# Vérifier le linter
npx eslint src/ --ext .ts,.tsx

# Build de production (vérifie TypeScript + compile)
npm run build
```

> **Recommandation** : lancer sur **Linux** ou **macOS** pour éviter les problèmes de chemins Windows avec Vite.

---

## Structure du projet

```
src/
├── api/            → Fonctions HTTP (POST, PUT, DELETE)
├── components/     → Composants réutilisables (UI, Layout, Quiz)
├── contexts/       → AuthContext (état global d'authentification)
├── hooks/          → Hooks custom pour les requêtes GET
├── i18n/           → Traductions FR et EN
├── pages/          → Une page par route
├── router/         → Configuration React Router
├── types/          → Interfaces TypeScript
└── utils/          → Utilitaires (gestion du token JWT)
```

---

## Pages disponibles

| Route | Page | Accès |
|---|---|---|
| `/` | Accueil | Public |
| `/quizzes` | Liste des quiz | Public |
| `/quizzes/:id` | Détail d'un quiz | Public |
| `/quizzes/create` | Créer un quiz | Connecté |
| `/quizzes/:id/edit` | Modifier un quiz | Connecté (auteur) |
| `/login` | Connexion | Visiteur |
| `/register` | Inscription | Visiteur |
| `/game/:id` | Jouer à un quiz | Connecté |
| `/game/:id/results` | Résultats | Connecté |
| `/leaderboard` | Classement | Public |

---

## Notes finales

- La traduction est disponible en **français** (défaut) et **anglais** via le bouton FR/EN dans la Navbar
- Le token JWT est renouvelé automatiquement avant expiration
- La pagination des quiz est stockée dans l'URL (`?page=2`) pour que les liens soient partageables
- Les quiz peuvent être importés automatiquement depuis **Open Trivia DB** avec traduction FR via **MyMemory**
- En cas d'erreur 401, l'utilisateur est déconnecté et redirigé vers `/login` automatiquement
