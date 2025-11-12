# Quick Start Guide

## 5-Minute Setup

### 1. Supabase Setup (2 min)

1. Go to https://supabase.com and create account
2. Create new project
3. Go to SQL Editor → New Query
4. Copy/paste contents of `database/schema.sql`
5. Run the query
6. Go to Settings → API
7. Copy:
   - Project URL (for `SUPABASE_URL`)
   - `service_role` key (for backend `SUPABASE_KEY`)
   - `anon` key (for frontend `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Slack Bot Setup (2 min)

1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Name: "FDE Bot", select workspace
4. **OAuth & Permissions** → Add scopes:
   - `channels:history`
   - `channels:read`
   - `users:read`
5. **Socket Mode** → Enable → Create token with `connections:write`
6. **Install App** → Install to workspace
7. Copy:
   - Bot Token (starts with `xoxb-`)
   - App Token (starts with `xapp-`)
8. Get your User ID: https://api.slack.com/methods/auth.test (use Bot Token)

### 3. Backend Setup (30 sec)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
FDE_SLACK_USER_ID=U01ABC123
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-service-role-key
LOG_LEVEL=INFO
EOF

python main.py
```

### 4. Frontend Setup (30 sec)

```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

npm run dev
```

### 5. Test It!

1. Open http://localhost:3000
2. In Slack, invite bot to a channel: `/invite @YourBotName`
3. Send a test message: "The login button doesn't work"
4. Watch it appear in dashboard within 10 seconds! 🎉

## Troubleshooting

**Backend not starting?**
- Check all env vars are set
- Verify Slack tokens are correct
- Check Python version (3.9+)

**Messages not appearing?**
- Check bot is in channel
- Verify OpenAI API key works
- Check backend logs for errors

**Frontend not updating?**
- Verify Supabase Realtime is enabled (run schema.sql)
- Check browser console
- Verify anon key is correct

## Next Steps

- Read full README.md for detailed setup
- Check TECHNICAL_WRITEUP.md for architecture details
- Customize classification prompts in `backend/ai/prompts.py`
- Adjust similarity threshold in `backend/config.py`

