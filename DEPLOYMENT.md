# Guide de Déploiement

Ce guide explique comment déployer l'application Planning Builder avec Docker.

## Prérequis

- Docker 20.10+ et Docker Compose 2.0+
- Git (pour cloner le repository)

## 🚀 Déploiement rapide

### 1. Cloner le repository

```bash
git clone <votre-repo-url>
cd Planning
```

### 2. Construire et démarrer avec Docker Compose

```bash
docker compose up -d --build
```

L'application sera accessible sur `http://localhost:3000`

### 3. Vérifier les logs

```bash
docker compose logs -f
```

## 📦 Créer une image Docker

### Option 1 : Build local

```bash
# Construire l'image
docker build -t planning-builder:latest .

# Tag pour un registry (ex: Docker Hub)
docker tag planning-builder:latest votre-username/planning-builder:latest

# Push vers Docker Hub
docker push votre-username/planning-builder:latest
```

### Option 2 : Build avec GitHub Actions

Un workflow GitHub Actions peut être configuré pour automatiser le build et le push vers un registry Docker.

## 🐳 Utilisation de l'image Docker

### Exécuter l'image

```bash
docker run -d \
  --name planning-builder \
  -p 3000:3000 \
  --restart unless-stopped \
  planning-builder:latest
```

### Avec variables d'environnement

```bash
docker run -d \
  --name planning-builder \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --restart unless-stopped \
  planning-builder:latest
```

## 🔧 Configuration Docker Compose

Le fichier `docker-compose.yml` est déjà configuré avec :

- **Port** : 3000 (modifiable dans le fichier)
- **Healthcheck** : Vérification automatique de l'état de l'application
- **Restart policy** : `unless-stopped` (redémarrage automatique)

### Personnaliser le port

Modifiez `docker-compose.yml` :

```yaml
ports:
  - "8080:3000"  # Port externe:port interne
```

## 📝 Variables d'environnement

Variables disponibles :

- `NODE_ENV` : `production` (par défaut)
- `PORT` : `3000` (par défaut)
- `HOSTNAME` : `0.0.0.0` (par défaut)
- `NEXT_TELEMETRY_DISABLED` : `1` (par défaut)

## 🏗️ Architecture de l'image

L'image utilise un build multi-stage :

1. **deps** : Installation des dépendances npm
2. **builder** : Compilation de l'application Next.js
3. **runner** : Image finale optimisée (~150MB)

L'image finale utilise le mode `standalone` de Next.js pour une taille minimale.

## 🔍 Vérification

### Vérifier que le conteneur tourne

```bash
docker ps
```

### Vérifier les logs

```bash
docker logs planning-builder
# ou avec docker compose
docker compose logs -f
```

### Tester l'application

```bash
curl http://localhost:3000
```

## 🛠️ Maintenance

### Mettre à jour l'application

```bash
# Arrêter
docker compose down

# Reconstruire
docker compose up -d --build
```

### Nettoyer

```bash
# Supprimer les conteneurs et volumes
docker compose down -v

# Nettoyer les images non utilisées
docker image prune -a
```

## 📦 Push vers un Registry

### Docker Hub

```bash
# Login
docker login

# Tag
docker tag planning-builder:latest votre-username/planning-builder:v1.1.0

# Push
docker push votre-username/planning-builder:v1.1.0
```

### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag planning-builder:latest ghcr.io/votre-username/planning-builder:v1.1.0

# Push
docker push ghcr.io/votre-username/planning-builder:v1.1.0
```

## 🚢 Déploiement en production

### Recommandations

1. **Utiliser un reverse proxy** (nginx, traefik) devant l'application
2. **Configurer HTTPS** avec Let's Encrypt
3. **Sauvegarder les données** (localStorage est côté client, mais vous pouvez exporter régulièrement)
4. **Surveiller les logs** et la santé de l'application
5. **Utiliser des secrets** pour les variables sensibles

### Exemple avec Nginx

```nginx
server {
    listen 80;
    server_name planning.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Sécurité

- L'application tourne avec un utilisateur non-root (`nextjs`)
- Les ports sont exposés uniquement en localhost par défaut
- Pas de données sensibles stockées côté serveur (tout est dans localStorage côté client)

## 📊 Monitoring

### Healthcheck

Le healthcheck est configuré dans `docker-compose.yml` :

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logs

Les logs sont accessibles via :

```bash
docker compose logs -f planning-builder
```

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker compose logs planning-builder

# Vérifier le statut
docker compose ps
```

### Port déjà utilisé

Changez le port dans `docker-compose.yml` :

```yaml
ports:
  - "3001:3000"  # Utilisez un autre port
```

### Problème de build

```bash
# Nettoyer et reconstruire
docker compose down
docker system prune -a
docker compose up -d --build
```

