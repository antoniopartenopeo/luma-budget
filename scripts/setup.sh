#!/bin/bash

# ============================================
# Setup script for Numa Budget
# Installs git hooks and dev dependencies
# ============================================

echo "🚀 Setting up Numa Budget development environment..."
echo ""

# Install git hooks
echo "📌 Installing git hooks..."
git config core.hooksPath .githooks

if [ -f ".agent/skills/numa-governance-update/scripts/pre-commit" ]; then
  cp .agent/skills/numa-governance-update/scripts/pre-commit .githooks/pre-commit
  chmod +x .githooks/pre-commit
  echo "✅ Pre-commit hook installed"
fi

if [ -f ".githooks/pre-push" ]; then
  chmod +x .githooks/pre-push
  echo "✅ Pre-push hook installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev       - Start development server"
echo "  npm run validate  - Run governance validator"
echo "  npm run test      - Run tests"
echo "  npm run build     - Build for production"
