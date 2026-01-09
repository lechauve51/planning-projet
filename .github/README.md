# GitHub Repository Setup

Ce dossier contient les workflows GitHub Actions pour automatiser le build et le déploiement.

## Workflows disponibles

### CI (`ci.yml`)

- **Déclenchement** : Sur chaque push et pull request
- **Actions** :
  - Installation des dépendances
  - Linting
  - Build de l'application

### Docker Build (`docker-build.yml`)

- **Déclenchement** : Sur push vers `main`/`master` ou création de tags `v*`
- **Actions** :
  - Build de l'image Docker
  - Push vers GitHub Container Registry (ghcr.io)
  - Tags automatiques basés sur les branches et versions

## Utilisation

### Publier une nouvelle version

1. Mettre à jour la version dans `package.json`
2. Créer un tag Git :
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. Le workflow va automatiquement construire et publier l'image avec le tag de version

### Accéder à l'image publiée

L'image sera disponible sur :
```
ghcr.io/votre-username/planning-builder:latest
ghcr.io/votre-username/planning-builder:v1.1.0
```

### Utiliser l'image depuis GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull
docker pull ghcr.io/votre-username/planning-builder:latest

# Run
docker run -p 3000:3000 ghcr.io/votre-username/planning-builder:latest
```

