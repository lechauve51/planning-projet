# Guide de Contribution

Merci de votre intérêt pour contribuer à Planning Builder !

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn
- Docker (optionnel, pour tester avec Docker)

### Installation

```bash
# Cloner le repository
git clone https://github.com/<votre-username>/planning-builder.git
cd planning-builder

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

## 📝 Workflow de contribution

1. **Fork** le repository
2. **Créer une branche** pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. **Faire vos modifications**
4. **Tester** vos changements (`npm run build`)
5. **Commit** vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
6. **Push** vers votre fork (`git push origin feature/ma-fonctionnalite`)
7. **Créer une Pull Request** sur GitHub

## 🧪 Tests

```bash
# Linter
npm run lint

# Build
npm run build
```

## 📋 Standards de code

- Utiliser TypeScript pour tout nouveau code
- Suivre les conventions de nommage existantes
- Ajouter des commentaires pour les logiques complexes
- Tester vos modifications avant de créer une PR

## 🐛 Signaler un bug

Créez une issue sur GitHub avec :
- Description du problème
- Étapes pour reproduire
- Comportement attendu vs comportement actuel
- Version de l'application
- Environnement (OS, navigateur, etc.)

## 💡 Proposer une fonctionnalité

Créez une issue sur GitHub avec :
- Description de la fonctionnalité
- Cas d'usage
- Exemples d'utilisation

