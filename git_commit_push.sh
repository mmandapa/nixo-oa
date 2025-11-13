#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "🔒 Security Check: Verifying .env files are ignored..."
echo ""

# Check if .env files exist and are ignored
if [ -f "backend/.env" ]; then
  if git check-ignore "backend/.env" > /dev/null 2>&1; then
    echo "✅ backend/.env is properly ignored"
  else
    echo "❌ ERROR: backend/.env is NOT ignored! Aborting."
    exit 1
  fi
else
  echo "ℹ️  backend/.env doesn't exist (ok)"
fi

if [ -f "frontend/.env.local" ]; then
  if git check-ignore "frontend/.env.local" > /dev/null 2>&1; then
    echo "✅ frontend/.env.local is properly ignored"
  else
    echo "❌ ERROR: frontend/.env.local is NOT ignored! Aborting."
    exit 1
  fi
else
  echo "ℹ️  frontend/.env.local doesn't exist (ok)"
fi

echo ""
echo "📦 Adding files..."
git add .

echo ""
echo "🔍 Verifying no .env files in staging..."
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$"; then
  echo "❌ ERROR: Found .env files in staging area! Aborting."
  git reset
  exit 1
else
  echo "✅ No .env files in staging (safe to commit)"
fi

echo ""
echo "📝 Committing..."
git commit -m "Redesign dashboard with elegant modern UI

- Improved color palette (slate/rose/violet/emerald)
- Enhanced typography and spacing
- Refined cards with better shadows and hover effects
- Gradient backgrounds and backdrop blur
- Custom scrollbars
- Better avatars with consistent gradients
- Polished badges and UI elements
- Fix OpenAI model compatibility (gpt-4o-mini)
- Add comprehensive logging for debugging"

echo ""
echo "✅ Commit successful!"
echo ""
echo "📤 Pushing to remote..."
git push

echo ""
echo "✅ Push complete!"

