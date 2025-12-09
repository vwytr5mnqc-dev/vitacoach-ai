#!/bin/bash

# 1. Inicializar Turborepo en la carpeta actual (asumiendo que está vacía)
# Usamos 'npm' como gestor de paquetes ya que tienes Node instalado.
echo "🏗️  Inicializando Monorepo con Turborepo..."
npx create-turbo@latest . --package-manager npm --skip-install --no-git --example basic

# 2. Limpiar aplicaciones de ejemplo predeterminadas
echo "🧹 Limpiando aplicaciones de ejemplo..."
rm -rf apps/*

# 3. Crear Frontend (Next.js 14 con App Router)
# Nombre: web
echo "🌐 Creando aplicación Next.js (web)..."
cd apps
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-git # Importante para evitar submodulos git dentro del monorepo

# 4. Crear Backend (NestJS)
# Nombre: api
echo "⚙️  Creando aplicación NestJS (api)..."
# Usamos npx para no obligarte a instalar el CLI globalmente
npx @nestjs/cli new api --package-manager npm --strict --skip-git

# 5. Ajustes finales del Monorepo
cd ..

# Instalar todas las dependencias desde la raíz
echo "📦 Instalando dependencias del monorepo..."
npm install

echo "✅ ¡Proyecto VitaCoach AI inicializado correctamente!"
echo "   - Frontend: apps/web"
echo "   - Backend: apps/api"
echo "   - DB Config: docker-compose.yml"