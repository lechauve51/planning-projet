# Guide de Configuration GitHub

Ce guide vous explique comment mettre votre code sur GitHub et créer une image Docker.

## 📦 Étape 1 : Préparer le repository GitHub

### 1.1 Créer un nouveau repository sur GitHub

1. Allez sur [GitHub](https://github.com)
2. Cliquez sur "New repository"
3. Remplissez :
   - **Name** : `planning-builder` (ou le nom de votre choix)
   - **Description** : "Application web de type Gantt pour la gestion de planning de projets"
   - **Visibility** : Public ou Private (selon vos préférences)
   - **Ne cochez PAS** "Initialize with README" (vous avez déjà un README)

### 1.2 Initialiser Git localement (si pas déjà fait)

```bash
# Dans le dossier du projet
cd /Users/alexandrechauvie/Library/CloudStorage/OneDrive-LPBConseil/Cursor/Planning

# Initialiser Git (si pas déjà fait)
git init

# Vérifier les fichiers à commiter
git status
```

### 1.3 Ajouter tous les fichiers

```bash
# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Vérifier ce qui sera commité
git status
```

### 1.4 Créer le premier commit

```bash
git commit -m "Initial commit: Planning Builder v1.1.0"
```

### 1.5 Connecter au repository GitHub

```bash
# Remplacer <votre-username> et <votre-repo> par vos valeurs
git remote add origin https://github.com/<votre-username>/<votre-repo>.git

# Vérifier la connexion
git remote -v
```

### 1.6 Pousser le code

```bash
# Pousser vers GitHub
git branch -M main
git push -u origin main
```

## 🐳 Étape 2 : Créer une image Docker

### 2.1 Build local de l'image

```bash
# Construire l'image
docker build -t planning-builder:latest .

# Vérifier que l'image est créée
docker images | grep planning-builder
```

### 2.2 Tester l'image localement

```bash
# Lancer le conteneur
docker run -d -p 3000:3000 --name planning-builder-test planning-builder:latest

# Vérifier les logs
docker logs planning-builder-test

# Tester dans le navigateur
open http://localhost:3000

# Arrêter et supprimer le conteneur de test
docker stop planning-builder-test
docker rm planning-builder-test
```

### 2.3 Tag et push vers Docker Hub

#### Option A : Docker Hub

```bash
# Login sur Docker Hub
docker login

# Tag l'image avec votre nom d'utilisateur Docker Hub
docker tag planning-builder:latest <votre-username>/planning-builder:v1.1.0
docker tag planning-builder:latest <votre-username>/planning-builder:latest

# Push vers Docker Hub
docker push <votre-username>/planning-builder:v1.1.0
docker push <votre-username>/planning-builder:latest
```

#### Option B : GitHub Container Registry (ghcr.io)

```bash
# Login sur GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u <votre-username> --password-stdin

# Tag l'image
docker tag planning-builder:latest ghcr.io/<votre-username>/planning-builder:v1.1.0
docker tag planning-builder:latest ghcr.io/<votre-username>/planning-builder:latest

# Push vers GitHub Container Registry
docker push ghcr.io/<votre-username>/planning-builder:v1.1.0
docker push ghcr.io/<votre-username>/planning-builder:latest
```

> **Note** : Pour GitHub Container Registry, vous devez créer un Personal Access Token (PAT) avec les permissions `write:packages` et `read:packages`.

## 🤖 Étape 3 : Automatisation avec GitHub Actions

Les workflows GitHub Actions sont déjà configurés dans `.github/workflows/` :

### 3.1 CI Workflow

Le workflow `ci.yml` s'exécute automatiquement sur chaque push et pull request pour :
- Installer les dépendances
- Lancer le linter
- Builder l'application

### 3.2 Docker Build Workflow

Le workflow `docker-build.yml` s'exécute automatiquement :
- Sur chaque push vers `main` ou `master`
- Lors de la création de tags `v*` (ex: `v1.1.0`)

Il va automatiquement :
- Construire l'image Docker
- La publier sur GitHub Container Registry (ghcr.io)

### 3.3 Créer une nouvelle version

```bash
# Mettre à jour la version dans package.json
# Puis créer un tag Git
git tag v1.1.0
git push origin v1.1.0
```

Le workflow va automatiquement construire et publier l'image avec ce tag.

## 📝 Étape 4 : Documentation du repository

### 4.1 Ajouter une description sur GitHub

Sur la page de votre repository GitHub :
1. Cliquez sur l'icône ⚙️ (Settings)
2. Ajoutez une description : "Application web de type Gantt pour la gestion de planning de projets"
3. Ajoutez des topics : `nextjs`, `typescript`, `docker`, `gantt-chart`, `planning`

### 4.2 Ajouter un fichier LICENSE (optionnel)

Si vous voulez ajouter une licence :

```bash
# Exemple avec MIT License
curl -o LICENSE https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt
# Puis éditez le fichier pour remplacer [year] et [fullname]
```

## 🔍 Vérification

### Vérifier que tout est sur GitHub

1. Allez sur votre repository GitHub
2. Vérifiez que tous les fichiers sont présents
3. Vérifiez que les workflows GitHub Actions sont visibles dans l'onglet "Actions"

### Vérifier l'image Docker

```bash
# Pull l'image depuis le registry
docker pull <votre-username>/planning-builder:latest

# Tester
docker run -d -p 3000:3000 <votre-username>/planning-builder:latest
```

## 🚀 Utilisation de l'image

Une fois l'image publiée, d'autres peuvent l'utiliser :

```bash
# Depuis Docker Hub
docker run -d -p 3000:3000 <votre-username>/planning-builder:latest

# Depuis GitHub Container Registry
docker run -d -p 3000:3000 ghcr.io/<votre-username>/planning-builder:latest
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

