# Planning Builder

Application web de type Gantt pour la gestion de planning de projets, pensée pour un usage conseil / CODIR.
J'ai créer cette application pour un besoin spécifique, mais j'entend l'améliorer afin d'avoir un maximum de fonctionnalités. N'hésitez pas à participer !

[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Démarrage rapide](#-démarrage-rapide)
- [Docker](#-docker)
- [Déploiement](#-déploiement)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Technologies](#-technologies)

## Fonctionnalités

- ✅ Édition de portefeuille de projets sous forme d'étiquettes sur une grille temporelle
- ✅ Drag & drop et resize avec snap sur la grille
- ✅ Personnalisation de couleurs (par étiquette OU par groupe)
- ✅ Configuration flexible de la timeline (date début, granularité, plage, mode d'affichage)
- ✅ Export PNG/JPG haute résolution pour PowerPoint
- ✅ Import/Export JSON
- ✅ Sauvegarde automatique dans localStorage

## 🚀 Démarrage rapide

**Vous n'avez pas Node.js ou Docker ?** → Voir [QUICKSTART.md](./QUICKSTART.md)

### Option 1 : Sans Docker (recommandé pour commencer)

```bash
# 1. Installer Node.js 20+ depuis https://nodejs.org/ (version LTS)
# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Option 2 : Avec Docker

```bash
# Après avoir installé Docker Desktop
make build
make up
```

Voir [INSTALLATION.md](./INSTALLATION.md) pour les détails complets.

## Build

```bash
npm run build
npm start
```

## 🐳 Docker

### Utilisation rapide avec Make

```bash
# Construire et démarrer
make build
make up

# Voir les logs
make logs

# Arrêter
make down

# Aide
make help
```

### Construction et exécution avec Docker

```bash
# Construire l'image
docker build -t planning-builder .

# Exécuter le conteneur
docker run -p 3000:3000 planning-builder
```

### Utilisation avec Docker Compose

```bash
# Démarrer l'application
docker compose up -d

# Voir les logs
docker compose logs -f

# Arrêter l'application
docker compose down

# Reconstruire après modifications
docker compose up -d --build
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build multi-stage

Le Dockerfile utilise un build multi-stage pour optimiser la taille de l'image finale :
- **Stage 1 (deps)** : Installation des dépendances
- **Stage 2 (builder)** : Build de l'application Next.js
- **Stage 3 (runner)** : Image finale optimisée avec uniquement les fichiers nécessaires

L'image finale utilise le mode `standalone` de Next.js pour une taille minimale (~150MB).

### Variables d'environnement

Vous pouvez personnaliser le comportement via des variables d'environnement dans `docker-compose.yml` :

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - HOSTNAME=0.0.0.0
```

## 🚀 Déploiement

Pour des instructions détaillées sur le déploiement, voir [DEPLOYMENT.md](./DEPLOYMENT.md).

### Créer et publier une image Docker

```bash
# Build local
docker build -t planning-builder:latest .

# Tag pour un registry
docker tag planning-builder:latest votre-username/planning-builder:v1.1.0

# Push vers Docker Hub
docker push votre-username/planning-builder:v1.1.0
```

### GitHub Actions

Un workflow GitHub Actions est configuré pour automatiquement construire et publier l'image Docker lors des pushes sur `main` ou lors de la création de tags.

Voir [.github/workflows/docker-build.yml](./.github/workflows/docker-build.yml)

## Utilisation

### Créer un projet

1. Cliquez sur "Nouveau projet" dans le header
2. Remplissez les informations (nom, code, groupe, dates)
3. Le projet apparaîtra sur la timeline

### Déplacer un projet

- Cliquez et glissez une étiquette horizontalement pour la déplacer dans le temps
- Le snap automatique aligne le projet sur la grille

### Redimensionner un projet

- Utilisez les poignées gauche/droite sur les étiquettes pour redimensionner
- Le resize snap également sur la grille

### Configurer la timeline

1. Cliquez sur "Paramètres"
2. Configurez :
   - Date de début et de fin
   - Granularité (semaine, mois, trimestre, semestre, année)
   - Pas (ex: 1 mois, 2 semaines)
   - Mode de division des cartes (1 carte unique ou plusieurs cartes)

### Gérer les groupes

1. Cliquez sur "Groupes"
2. Ajoutez, modifiez ou supprimez des groupes
3. Changez les couleurs des groupes
4. Les projets héritent de la couleur de leur groupe (sauf override)

### Exporter

1. Utilisez la barre d'export en haut
2. Choisissez l'échelle (1x, 2x, 3x)
3. Exportez la carte actuelle ou toutes les cartes
4. Format PNG ou JPG

### Import/Export JSON

- **Export** : Sauvegarde toutes les données (timeline, projets, groupes)
- **Import** : Charge un fichier JSON précédemment exporté
- **Réinitialiser** : Remet à zéro toutes les données

## Structure du projet

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── PlanningBuilder.tsx    # Composant principal
│   ├── CardBoard.tsx          # Affichage des cartes
│   ├── TimelineCard.tsx        # Une carte de timeline
│   ├── ProjectTag.tsx          # Étiquette de projet (drag/resize)
│   ├── SettingsPanel.tsx       # Panneau de configuration
│   ├── GroupManager.tsx        # Gestion des groupes
│   ├── ProjectEditor.tsx       # Édition de projet
│   ├── ExportImageBar.tsx      # Barre d'export
│   └── ImportExport.tsx        # Import/Export JSON
├── lib/                  # Logique métier
│   └── timeline-engine.ts      # Moteur de génération de timeline
├── store/                # State management
│   └── usePlanningStore.ts     # Store Zustand
└── types/               # Types TypeScript
    └── index.ts              # Définitions de types
```

## Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **html-to-image** - Export d'images
- **date-fns** - Manipulation de dates
- **file-saver** - Téléchargement de fichiers
- **jszip** - Création d'archives ZIP

## Notes techniques

- Les projets sont stockés avec des dates absolues (ISO), pas des index de colonnes
- Lors d'un changement de granularité, les projets sont automatiquement ajustés
- La grille est générée dynamiquement à partir de la configuration
- Le drag & drop utilise des événements pointer natifs pour la fluidité
- L'export utilise html-to-image avec support haute résolution

