# Docker GPU Dashboard Extension
# Shows real-time NVIDIA GPU metrics in Docker Desktop

# Stage 1: Build Go backend
FROM golang:1.24-bookworm AS backend-builder

WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o gpu-backend .
RUN CGO_ENABLED=0 GOOS=darwin go build -ldflags="-s -w" -o gpu-backend-darwin .

# Stage 2: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY ui/package.json ui/package-lock.json ./
RUN npm ci

COPY ui/ .
RUN npm run build

# Stage 3: Extension image
FROM alpine:3.19

LABEL org.opencontainers.image.title="GPU Dashboard"
LABEL org.opencontainers.image.description="Real-time NVIDIA GPU metrics in Docker Desktop"
LABEL org.opencontainers.image.vendor="Pavan Madduri"
LABEL com.docker.desktop.extension.api.version="0.3.4"
LABEL com.docker.desktop.extension.icon="https://raw.githubusercontent.com/pmady/docker-gpu-dashboard-extension/main/docker.svg"
LABEL com.docker.extension.screenshots='[{"alt":"GPU Dashboard showing utilization and memory","url":"https://raw.githubusercontent.com/pmady/docker-gpu-dashboard-extension/main/screenshots/dashboard.png"}]'
LABEL com.docker.extension.detailed-description="Monitor NVIDIA GPU utilization, memory usage, temperature, and power draw directly in Docker Desktop. Essential for AI/ML container development."
LABEL com.docker.extension.publisher-url="https://github.com/pmady"
LABEL com.docker.extension.changelog="Initial release with real-time GPU monitoring"
LABEL com.docker.extension.categories='["utility-tools"]'

COPY metadata.json .
COPY docker.svg .

# Backend binaries
RUN mkdir -p /linux /darwin
COPY --from=backend-builder /app/gpu-backend /linux/gpu-backend
COPY --from=backend-builder /app/gpu-backend-darwin /darwin/gpu-backend

# Frontend
COPY --from=frontend-builder /app/dist /ui
