# Guide Docker - Planning Builder

## Démarrage rapide

### Option 1 : Avec Make (recommandé)

```bash
# Construire l'image
make build

# Démarrer l'application
make up

# Voir les logs
make logs

# Arrêter
make down
```

### Option 2 : Avec Docker Compose

```bash
# Construire et démarrer
docker compose up -d --build

# Voir les logs
docker compose logs -f

# Arrêter
docker compose down
```

### Option 3 : Avec Docker directement

```bash
# Construire l'image
docker build -t planning-builder .

# Exécuter le conteneur
docker run -d -p 3000:3000 --name planning-builder planning-builder
```

## Architecture du Dockerfile

Le Dockerfile utilise un build multi-stage optimisé :

1. **Stage `deps`** : Installation des dépendances npm
2. **Stage `builder`** : Compilation de l'application Next.js
3. **Stage `runner`** : Image finale minimale avec uniquement les fichiers nécessaires

### Avantages

- **Taille réduite** : ~150MB (vs ~1GB avec node_modules complet)
- **Sécurité** : Exécution avec un utilisateur non-root
- **Performance** : Mode standalone de Next.js
- **Cache optimisé** : Les dépendances sont mises en cache séparément

## Personnalisation

### Changer le port

Modifiez `docker-compose.yml` :

```yaml
ports:
  - "8080:3000"  # Port externe:port interne
```

### Variables d'environnement

Ajoutez des variables dans `docker-compose.yml` :

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - CUSTOM_VAR=value
```

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker compose logs planning-builder

# Vérifier que le conteneur tourne
docker ps
```

### Reconstruire complètement

```bash
# Nettoyer et reconstruire
make clean
make build
make up
```

### Problème de permissions

Si vous avez des problèmes de permissions, vérifiez que les fichiers sont bien copiés avec les bonnes permissions dans le Dockerfile.

## Production

Pour un déploiement en production :

1. Utilisez un reverse proxy (nginx, traefik) devant le conteneur
2. Configurez HTTPS avec Let's Encrypt
3. Utilisez un orchestrateur (Docker Swarm, Kubernetes) pour la haute disponibilité
4. Configurez des volumes pour la persistance si nécessaire (actuellement localStorage côté client)

## Exemple avec Nginx

```nginx
server {
    listen 80;
    server_name planning.example.com;

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

