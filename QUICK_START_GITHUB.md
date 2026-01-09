# 🚀 Guide Rapide : GitHub + Docker

## ✅ Ce qui est déjà prêt

- ✅ Dockerfile optimisé (multi-stage)
- ✅ docker-compose.yml configuré
- ✅ .dockerignore configuré
- ✅ .gitignore configuré
- ✅ GitHub Actions workflows (CI + Docker build)
- ✅ Documentation complète

## 📦 Étape 1 : Initialiser Git et pousser sur GitHub

```bash
# 1. Initialiser Git
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Premier commit
git commit -m "Initial commit: Planning Builder v1.1.0"

# 4. Créer un repository sur GitHub (via le site web)
#    https://github.com/new
#    Ne cochez PAS "Initialize with README"

# 5. Connecter au repository (remplacez <username> et <repo>)
git remote add origin https://github.com/<username>/<repo>.git

# 6. Pousser le code
git branch -M main
git push -u origin main
```

## 🐳 Étape 2 : Tester le build Docker localement

```bash
# Construire l'image
docker build -t planning-builder:latest .

# Tester l'image
docker run -d -p 3000:3000 --name planning-test planning-builder:latest

# Vérifier
open http://localhost:3000

# Nettoyer
docker stop planning-test && docker rm planning-test
```

## 📤 Étape 3 : Publier l'image Docker

### Option A : Docker Hub

```bash
# Login
docker login

# Tag
docker tag planning-builder:latest <votre-username>/planning-builder:v1.1.0
docker tag planning-builder:latest <votre-username>/planning-builder:latest

# Push
docker push <votre-username>/planning-builder:v1.1.0
docker push <votre-username>/planning-builder:latest
```

### Option B : GitHub Container Registry (automatique avec GitHub Actions)

1. Créer un Personal Access Token sur GitHub :
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Permissions : `write:packages`, `read:packages`
   - Copier le token

2. Ajouter le token comme secret GitHub :
   - Repository → Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `GITHUB_TOKEN`
   - Value: votre token

3. Le workflow GitHub Actions publiera automatiquement l'image sur `ghcr.io` lors des pushes sur `main` ou lors de la création de tags.

## 🤖 Étape 4 : Utiliser GitHub Actions (automatique)

Les workflows sont déjà configurés dans `.github/workflows/` :

- **CI** : S'exécute sur chaque push/PR (lint + build)
- **Docker Build** : S'exécute sur push vers `main` ou création de tags `v*`

Pour créer une nouvelle version :

```bash
git tag v1.1.0
git push origin v1.1.0
```

L'image sera automatiquement construite et publiée sur `ghcr.io/<username>/planning-builder:v1.1.0`

## 📚 Documentation complète

- **GITHUB_SETUP.md** : Guide détaillé pour GitHub
- **DEPLOYMENT.md** : Guide de déploiement Docker
- **README.md** : Documentation principale
- **CONTRIBUTING.md** : Guide de contribution

## ✅ Checklist finale

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] Image Docker testée localement
- [ ] Image Docker publiée (Docker Hub ou ghcr.io)
- [ ] GitHub Actions configurées (si utilisation de ghcr.io)
- [ ] Documentation lue

## 🎉 C'est prêt !

Votre application est maintenant prête à être partagée et déployée !

