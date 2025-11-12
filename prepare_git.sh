#!/bin/bash

echo "🔒 Checking for sensitive files before git commit..."
echo ""

# Check for .env files
if find . -name ".env" -o -name ".env.local" | grep -v node_modules | grep -v .git | grep -v venv; then
  echo "⚠️  WARNING: Found .env files! These should be ignored."
  echo "   Make sure they're in .gitignore"
else
  echo "✅ No .env files found (good!)"
fi

echo ""
echo "📋 Files that will be committed:"
git status --short 2>/dev/null | head -20 || echo "Not a git repo yet"

echo ""
echo "🔍 Checking .gitignore coverage..."
if [ -f .gitignore ]; then
  echo "✅ .gitignore exists"
  if grep -q "\.env" .gitignore; then
    echo "✅ .env files are in .gitignore"
  else
    echo "⚠️  .env files NOT in .gitignore!"
  fi
else
  echo "⚠️  No .gitignore found!"
fi

echo ""
echo "To commit and push:"
echo "  git add ."
echo "  git commit -m 'Initial FDE Slackbot implementation'"
echo "  git push"

