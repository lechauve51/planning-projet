.PHONY: help build up down logs restart clean

help: ## Affiche l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construit l'image Docker
	docker compose build

up: ## Démarre l'application
	docker compose up -d

down: ## Arrête l'application
	docker compose down

logs: ## Affiche les logs
	docker compose logs -f

restart: ## Redémarre l'application
	docker compose restart

clean: ## Nettoie les conteneurs et images
	docker compose down -v
	docker rmi planning-builder 2>/dev/null || true

dev: ## Lance en mode développement (sans Docker)
	npm run dev

install: ## Installe les dépendances
	npm install

