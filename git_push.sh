#!/bin/bash

set -e  # Exit on error

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
echo "📋 Initializing git (if needed)..."
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git initialized"
else
  echo "✅ Git repo already exists"
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
git commit -m "Initial FDE Slackbot implementation

- Backend: Python/FastAPI with Slack Socket Mode
- Frontend: Next.js with real-time Supabase subscriptions
- AI: OpenAI GPT-4 classification and embeddings
- Database: Supabase PostgreSQL with vector similarity
- Features: Real-time updates, intelligent grouping, de-duplication"

echo ""
echo "✅ Commit successful!"
echo ""
echo "📤 To push to remote:"
echo "   git remote add origin <your-repo-url>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or if remote already exists:"
echo "   git push"

