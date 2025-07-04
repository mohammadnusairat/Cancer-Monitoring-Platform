#!/bin/bash

mkdir -p cancer-monitoring-platform/backend/app/{api/v1/endpoints,core,services,db}
mkdir -p cancer-monitoring-platform/data

cd cancer-monitoring-platform
touch backend/app/main.py backend/requirements.txt docker-compose.yml README.md

# Vite React setup
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
cd ..

echo "✅ Project scaffold created successfully!"
