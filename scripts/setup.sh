#!/bin/bash

# ============================================
# Setup script for Luma Budget
# Installs git hooks and dev dependencies
# ============================================

echo "🚀 Setting up Luma Budget development environment..."
echo ""

# Install git hooks
echo "📌 Installing git hooks..."
cp .agent/skills/luma-governance/scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev       - Start development server"
echo "  npm run validate  - Run governance validator"
echo "  npm run test      - Run tests"
echo "  npm run build     - Build for production"
