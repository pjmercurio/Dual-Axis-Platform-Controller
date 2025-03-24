#!/bin/bash

set -e  # Exit immediately on error

# Step 1: Clean old PyInstaller build
echo "🧹 Cleaning previous dist/build folders..."
rm -rf build dist __pycache__ app.spec

# Step 2: Compile Flask app using PyInstaller
echo "🛠️🔬 Compiling Flask app..."
pyinstaller --onefile \
    --collect-submodules=flask \
    --hidden-import=socket \
    --hidden-import=_socket \
    --hidden-import=contextvars \
    --hidden-import=_contextvars \
    --hidden-import=datetime \
    --hidden-import=_datetime \
    --hidden-import=math \
    --hidden-import=termios \
    --hidden-import=multiprocessing \
    --hidden-import=multiprocessing.reduction \
    --add-data "templates:templates" \
    --add-data "static:static" \
    app.py

# Step 3: Move compiled binary to Electron dist
echo "📦 Moving compiled app to Electron dist folder..."
mkdir -p electron-app/dist
cp dist/app electron-app/dist/app

# Step 4: Build Electron app
echo "🛠️💫 Building Electron app..."
cd electron-app
npm install
npm run build
cd ..

echo "✅ Build complete!"
