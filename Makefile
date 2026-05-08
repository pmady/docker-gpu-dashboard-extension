IMAGE ?= pmady/docker-gpu-dashboard-extension
TAG ?= latest

BUILDER=buildx-multi-arch

.PHONY: help build install update dev clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the extension image
	docker build -t $(IMAGE):$(TAG) .

install: build ## Install the extension into Docker Desktop
	docker extension install $(IMAGE):$(TAG)

update: build ## Update the extension in Docker Desktop
	docker extension update $(IMAGE):$(TAG)

dev: ## Enable development mode with hot reload
	docker extension dev ui-source $(IMAGE):$(TAG) http://localhost:5173
	cd ui && npm run dev

dev-reset: ## Disable development mode
	docker extension dev reset $(IMAGE):$(TAG)

validate: ## Validate the extension
	docker extension validate $(IMAGE):$(TAG)

clean: ## Remove the extension
	docker extension rm $(IMAGE):$(TAG) || true

ui-deps: ## Install frontend dependencies
	cd ui && npm install

backend-build: ## Build backend binary locally
	cd backend && CGO_ENABLED=0 go build -o ../bin/gpu-backend .

backend-mock: ## Run backend locally in mock mode
	cd backend && MOCK_GPU=true SOCKET_PATH=/tmp/gpu-backend.sock go run .
