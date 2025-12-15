# Build stage
FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Export build artifacts (dist folder)
FROM alpine:latest AS export
WORKDIR /dist
COPY --from=build /app/dist .
