# QuizArena — Backend

## Équipe

- Goumou Celestin, goumoucelestin3@gmail.com

---

## Présentation du projet

QuizArena est une API RESTful permettant de gérer des quiz, des questions, des utilisateurs et des scores. Elle expose des endpoints pour l'authentification JWT, la gestion complète des quiz et questions (CRUD), la soumission de scores et un classement global.

L'API consomme également deux services externes :
- **Open Trivia DB** : pour importer des questions de quiz prêtes à l'emploi
- **MyMemory** : pour traduire automatiquement les questions en français

**Points les plus faciles :**
- La mise en place des modules NestJS 
- La configuration TypeORM avec SQLite (pas de serveur à installer)
- La création des entités et relations

**Points les plus difficiles :**
- La gestion de la contrainte FOREIGN KEY avec SQLite et TypeORM
- Le débogage des DTOs avec class-validator (types number/string)
- La traduction asynchrone en parallèle des questions importées

---

## Technologies utilisées

| Technologie | Version | Raison du choix |
|---|---|---|
| NestJS | 10.x | Framework Node.js , TypeScript natif |
| TypeScript | 5.x | Typage statique, cohérence avec le frontend |
| TypeORM | 0.3.x |
| SQLite (better-sqlite3) | 9.x | Pas de serveur à installer|
| Passport.js + JWT | — | Authentification standard et sécurisée |
| bcrypt | 5.x | Hachage des mots de passe |
| class-validator | 0.14.x | Validation des DTOs |
| Axios | 1.x | Appels aux API externes |

---

## Gestion de projet


- **GitHub** : hébergement du code — [github.com/celestin-001/quizarena-backend](https://github.com/celestin-001/quizarena-backend)

---

## Expérience générale

**Niveau avant le projet :**
- NestJS : découverte complète
- TypeORM : découverte complète
- JWT : notions de cours

**Ce qui a été appris :**
- L'architecture modulaire de NestJS (Module / Controller / Service)
- Le pattern Repository avec TypeORM
- La mise en place d'une authentification JWT complète avec guards
- La consommation d'API externes côté serveur
- La gestion des relations entre entités (ManyToOne, OneToMany)

**Ce que je referait :**
- NestJS : oui, très structurant et maintenable
- SQLite pour le dev :gain de temps énorme
- TypeORM : oui

---

## Installation

### Prérequis

- **Node.js** >= 18 ([nodejs.org](https://nodejs.org))
- **npm** >= 9

> Le projet a été développé et testé sur **Linux (Ubuntu)**. Il fonctionne également sur Windows et macOS.

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/celestin-001/quizarena-backend.git
cd quizarena-backend

# 2. Installer les dépendances
npm install
```

La base de données SQLite (`quizarena.db`) est créée **automatiquement** au premier démarrage grâce à `synchronize: true` dans la config TypeORM. Aucune migration n'est nécessaire.

---

## Utilisation

```bash
# Lancer en mode développement (watch)
npm run start:dev
# → API disponible sur http://localhost:3000

# Lancer en mode production
npm run build
npm run start:prod
```

> **Recommandation** : utiliser le mode `start:dev` en développement pour le rechargement automatique.

---

## Routes d'API

### Auth — `/auth`

```
[POST] /auth/register  → Créer un compte utilisateur
                         Body: { username, email, password }
                         Retourne: { token, user }

[POST] /auth/login     → Se connecter
                         Body: { email, password }
                         Retourne: { token, user }

[GET]  /auth/me        → Récupérer le profil connecté
                         Headers: Authorization: Bearer <token>
                         Retourne: { id, username, email, createdAt }
```

### Quiz — `/quizzes`

```
[GET]  /quizzes                → Liste paginée des quiz
                                 Query: ?page=1&search=&category=&difficulty=
                                 Retourne: { data, total, page, limit }

[GET]  /quizzes/:id            → Détail d'un quiz avec ses questions
                                 Retourne: { ...quiz, questions[] }

[POST] /quizzes                → Créer un quiz (authentifié)
                                 Headers: Authorization: Bearer <token>
                                 Body: { title, description?, category, difficulty? }
                                 Retourne: Quiz créé

[PUT]  /quizzes/:id            → Modifier un quiz (authentifié, auteur uniquement)
                                 Headers: Authorization: Bearer <token>
                                 Body: { title?, description?, category?, difficulty? }
                                 Retourne: Quiz modifié

[DELETE] /quizzes/:id          → Supprimer un quiz (authentifié, auteur uniquement)
                                 Headers: Authorization: Bearer <token>
                                 Retourne: { message }
```

### Questions — `/quizzes/:quizId/questions` et `/questions`

```
[GET]  /quizzes/:quizId/questions     → Liste des questions d'un quiz
                                        Retourne: Question[]

[POST] /quizzes/:quizId/questions     → Ajouter une question (authentifié, auteur)
                                        Headers: Authorization: Bearer <token>
                                        Body: { text, options[], correctIndex, points? }
                                        Retourne: Question créée

[PUT]  /questions/:id                 → Modifier une question (authentifié, auteur)
                                        Headers: Authorization: Bearer <token>
                                        Body: { text?, options[]?, correctIndex?, points? }
                                        Retourne: Question modifiée

[DELETE] /questions/:id               → Supprimer une question (authentifié, auteur)
                                        Headers: Authorization: Bearer <token>
                                        Retourne: { message }
```

### Jeu — `/games`

```
[POST] /games                  → Soumettre un score (authentifié)
                                 Headers: Authorization: Bearer <token>
                                 Body: { quizId, score, totalPoints, answers[] }
                                 Retourne: GameResult créé

[GET]  /games/leaderboard      → Classement global (public)
                                 Retourne: { rank, username, totalScore, gamesPlayed, avgPercent }[]

[GET]  /games/stats/:userId    → Statistiques d'un utilisateur (authentifié)
                                 Headers: Authorization: Bearer <token>
                                 Retourne: { gamesPlayed, totalScore, avgPercent, recentGames[] }
```

### Trivia (API externe) — `/trivia`

```
[GET]  /trivia/categories      → Liste des catégories Open Trivia DB traduites en FR
                                 Retourne: { id, name }[]

[POST] /trivia/import          → Importer un quiz depuis Open Trivia DB (authentifié)
                                 Headers: Authorization: Bearer <token>
                                 Body: { title, amount?, difficulty?, categoryId? }
                                 Retourne: Quiz créé avec questions traduites en français
```

---

## Structure du projet

```
src/
├── auth/           → Authentification JWT (register, login, strategy)
├── game/           → Scores et classement
├── question/       → CRUD des questions
├── quiz/           → CRUD des quiz
├── trivia/         → Import depuis Open Trivia DB + traduction MyMemory
├── user/           → Entité utilisateur
├── app.module.ts   → Module racine
└── main.ts         → Point d'entrée (CORS, validation, port 3000)
```

---

## Services externes consommés

### Open Trivia DB
- **URL** : `https://opentdb.com/api.php`
- **Usage** : Récupération de questions de quiz en anglais
- **Authentification** : aucune (API publique gratuite)

### MyMemory Translation
- **URL** : `https://api.mymemory.translated.net/get`
- **Usage** : Traduction automatique anglais → français des questions importées
- **Authentification** : aucune (API publique gratuite)

---

- La base de données `quizarena.db` est créée automatiquement à la racine du projet
- Le secret JWT est actuellement en dur (`quizarena_secret`) — à déplacer dans un `.env` pour la production
- `synchronize: true` dans TypeORM recrée les tables automatiquement — à désactiver en production
- Le CORS est configuré pour accepter uniquement `http://localhost:5173` (frontend dev)
- Les mots de passe sont hachés avec bcrypt (10 rounds) — jamais stockés en clair
