# Git Setup Instructions

## ✅ Security Checklist

Before pushing, make sure:
- [x] `.gitignore` includes all `.env` files
- [x] No API keys in code files
- [x] No tokens in commit history

## 🚀 Git Commands

**1. Initialize git (if not already done):**
```bash
git init
```

**2. Check what will be committed:**
```bash
git status
```

**3. Verify .env files are ignored:**
```bash
git check-ignore backend/.env frontend/.env.local
# Should show both files (meaning they're ignored)
```

**4. Add all files:**
```bash
git add .
```

**5. Verify sensitive files are NOT included:**
```bash
git status
# Should NOT see:
# - backend/.env
# - frontend/.env.local
# - Any files with API keys
```

**6. Commit:**
```bash
git commit -m "Initial FDE Slackbot implementation

- Backend: Python/FastAPI with Slack Socket Mode
- Frontend: Next.js with real-time Supabase subscriptions
- AI: OpenAI GPT-4 classification and embeddings
- Database: Supabase PostgreSQL with vector similarity
- Features: Real-time updates, intelligent grouping, de-duplication"
```

**7. Add remote (if needed):**
```bash
git remote add origin <your-repo-url>
```

**8. Push:**
```bash
git push -u origin main
# or
git push -u origin master
```

## 🔒 Files That Should NEVER Be Committed

- `backend/.env` - Contains API keys
- `frontend/.env.local` - Contains Supabase keys
- Any file with actual tokens/keys

## 📝 Files That ARE Committed (Safe)

- `backend/.env.example` - Template only (no real keys)
- `frontend/.env.local.example` - Template only
- All source code
- Documentation files

## ⚠️ If You Accidentally Committed Secrets

If you already committed secrets, you need to:
1. Remove them from git history (use `git filter-branch` or BFG Repo-Cleaner)
2. Rotate all API keys immediately
3. Update `.gitignore` to prevent future commits

