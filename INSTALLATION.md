# Guide d'installation - Planning Builder

## Option 1 : Installation avec Docker (recommandé pour production)

### Installer Docker Desktop pour Mac

1. **Télécharger Docker Desktop** :
   - Allez sur https://www.docker.com/products/docker-desktop/
   - Téléchargez Docker Desktop pour Mac (Apple Silicon ou Intel selon votre Mac)
   - Ouvrez le fichier `.dmg` téléchargé
   - Glissez Docker dans le dossier Applications

2. **Lancer Docker Desktop** :
   - Ouvrez Docker depuis Applications
   - Acceptez les termes de licence
   - Docker va démarrer (icône de baleine dans la barre de menu)

3. **Vérifier l'installation** :
   ```bash
   docker --version
   docker compose version
   ```

4. **Construire et lancer l'application** :
   ```bash
   make build
   make up
   ```

## Option 2 : Installation sans Docker (développement local)

### Prérequis

- Node.js 20+ (recommandé via nvm ou téléchargement direct)
- npm ou yarn

### Installation de Node.js

**Avec Homebrew** (recommandé) :
```bash
brew install node
```

**Ou télécharger directement** :
- Allez sur https://nodejs.org/
- Téléchargez la version LTS
- Installez le package

**Avec nvm** (gestionnaire de versions) :
```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Redémarrer le terminal, puis :
nvm install 20
nvm use 20
```

### Installation de l'application

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application sera accessible sur http://localhost:3000

### Build pour production (sans Docker)

```bash
# Construire l'application
npm run build

# Lancer en mode production
npm start
```

## Vérification de l'installation

### Vérifier Node.js
```bash
node --version  # Doit afficher v20.x.x ou supérieur
npm --version   # Doit afficher 9.x.x ou supérieur
```

### Vérifier Docker (si installé)
```bash
docker --version
docker compose version
```

## Dépannage

### Problème avec npm install

Si vous avez des erreurs de permissions :
```bash
sudo npm install
```

Ou mieux, configurez npm pour ne pas utiliser sudo :
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Problème avec Docker Desktop

- Vérifiez que Docker Desktop est bien lancé (icône dans la barre de menu)
- Redémarrez Docker Desktop si nécessaire
- Vérifiez les ressources allouées dans Docker Desktop > Settings > Resources

### Port 3000 déjà utilisé

Si le port 3000 est déjà utilisé :
```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

Ou changez le port dans `package.json` :
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## Recommandations

- **Pour le développement** : Utilisez l'option 2 (sans Docker) pour un démarrage plus rapide
- **Pour la production** : Utilisez Docker pour un environnement reproductible
- **Pour le partage** : Docker est idéal pour partager l'application avec d'autres développeurs

