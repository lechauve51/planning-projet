# Démarrage rapide - Planning Builder

## 🚀 Méthode la plus simple (sans Docker)

### Étape 1 : Installer Node.js

**Option A : Avec Homebrew** (si vous avez Homebrew installé)
```bash
brew install node
```

**Option B : Télécharger directement** (recommandé si pas de Homebrew)
1. Allez sur https://nodejs.org/
2. Téléchargez la version **LTS** (Long Term Support)
3. Double-cliquez sur le fichier `.pkg` téléchargé
4. Suivez l'assistant d'installation

**Option C : Avec nvm** (gestionnaire de versions - avancé)
```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Fermer et rouvrir le terminal, puis :
nvm install 20
nvm use 20
```

### Étape 2 : Vérifier l'installation

Ouvrez un nouveau terminal et tapez :
```bash
node --version
npm --version
```

Vous devriez voir des numéros de version (ex: v20.10.0 et 10.2.3)

### Étape 3 : Installer l'application

Dans le dossier du projet :
```bash
npm install
```

### Étape 4 : Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🐳 Méthode avec Docker (optionnel)

Si vous préférez utiliser Docker :

### Étape 1 : Installer Docker Desktop

1. Allez sur https://www.docker.com/products/docker-desktop/
2. Téléchargez **Docker Desktop for Mac**
3. Installez et lancez Docker Desktop
4. Attendez que Docker soit prêt (icône de baleine dans la barre de menu)

### Étape 2 : Lancer avec Docker

```bash
make build
make up
```

---

## ❓ Problèmes courants

### "command not found: node"
→ Node.js n'est pas installé. Suivez l'Étape 1 ci-dessus.

### "command not found: docker"
→ Docker n'est pas installé. Installez Docker Desktop ou utilisez la méthode sans Docker.

### "Port 3000 already in use"
→ Un autre programme utilise le port 3000. Changez le port :
```bash
npm run dev -- -p 3001
```

### Erreurs lors de `npm install`
→ Vérifiez que vous avez Node.js 20+ installé :
```bash
node --version
```

---

## 📝 Recommandation

**Pour commencer rapidement** : Utilisez la méthode sans Docker (npm install + npm run dev)

**Pour la production** : Utilisez Docker une fois que vous êtes à l'aise avec l'application

