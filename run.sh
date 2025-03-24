#!/bin/bash

set -e  # Exit on any error

VENV_DIR="./venv"

echo "🐍 Setting up virtual environment (if needed)..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi

echo "📥 Activating virtual environment and installing dependencies..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt

echo "🚀 Starting Flask app..."
python app.py
