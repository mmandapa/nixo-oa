# FDE Slackbot - Customer Message Tracker

A real-time dashboard for Forward-Deployed Engineers to monitor customer conversations in Slack. The bot intelligently classifies, groups, and displays relevant customer messages with zero duplicates.

## Features

- 🔄 **Real-time Updates**: Messages appear in the dashboard within <10 seconds
- 🤖 **AI-Powered Classification**: Automatically categorizes messages (support/bug/feature/question)
- 🧠 **Intelligent Grouping**: Groups related messages across threads and channels
- 🚫 **Smart Filtering**: Filters out casual chat and irrelevant messages
- 📊 **Clean Dashboard**: Modern, responsive UI with real-time updates
- ✅ **Zero Duplicates**: Built-in de-duplication ensures no duplicate tickets

## Architecture

```
Slack → Socket Mode → Python Backend → OpenAI → Supabase → Next.js Frontend
```

- **Backend**: Python + FastAPI + Slack Bolt (Socket Mode)
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: OpenAI GPT-4 (classification) + text-embedding-ada-002 (similarity)

## Prerequisites

- Python 3.9+
- Node.js 18+
- Slack workspace (admin access)
- Supabase account (free tier works)
- OpenAI API key

## Quick Start

### 1. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Note your Supabase URL and keys (you'll need both service role key and anon key)

### 2. Slack Bot Setup

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "FDE Bot") and select your workspace
4. Go to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes**, add:
   - `channels:history` - Read messages from public channels
   - `channels:read` - View basic channel info
   - `users:read` - Get user display names
   - `groups:history` - Read private channels (if needed)
   - `groups:read` - View private channel info
5. Go to **Socket Mode** and enable it, create an App-Level Token with `connections:write` scope
6. Go to **Event Subscriptions** and subscribe to:
   - `message.channels` - Messages in public channels
   - `message.groups` - Messages in private channels (if needed)
7. Install the app to your workspace
8. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
9. Copy the **App-Level Token** (starts with `xapp-`)
10. Find your Slack User ID (you can use https://api.slack.com/methods/auth.test to get it)

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials:
# - SLACK_BOT_TOKEN (from step 2)
# - SLACK_APP_TOKEN (from step 2)
# - FDE_SLACK_USER_ID (your Slack user ID)
# - OPENAI_API_KEY
# - SUPABASE_URL
# - SUPABASE_KEY (service role key)

# Run the backend (from project root)
cd ..  # Go back to project root
python -m backend.main
# OR from backend directory:
cd backend
python main.py
```

The backend will start and connect to Slack via Socket Mode. You should see:
```
Starting FDE Slackbot...
Starting Slack Socket Mode handler...
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Run the frontend
npm run dev
```

Open http://localhost:3000 to see the dashboard.

### 5. Invite Bot to Channels

In Slack, invite your bot to the channels where customers are:
```
/invite @YourBotName
```

## Testing the Demo

1. **Test Bug Report**:
   - In Slack, send: "The login button doesn't work on mobile"
   - ✅ Should appear in dashboard within 10s as a bug ticket

2. **Test Grouping**:
   - Send: "Can you add export to CSV?"
   - Send (not in thread): "I don't see a button for it right now"
   - ✅ Both should appear grouped together

3. **Test Filtering**:
   - Send: "thanks!" or "See you tomorrow"
   - ❌ Should NOT appear (casual message filtered out)

## Environment Variables

### Backend (.env)

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret  # Optional for Socket Mode
FDE_SLACK_USER_ID=U01ABC123  # Your Slack user ID

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key

# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-service-role-key  # Service role key (backend only)

# Application Settings
LOG_LEVEL=INFO
SIMILARITY_THRESHOLD=0.82
TIME_WINDOW_MINUTES=30
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
.
├── backend/
│   ├── main.py                 # Entry point
│   ├── config.py               # Configuration
│   ├── models.py               # Pydantic models
│   ├── slack/
│   │   ├── event_handler.py    # Slack event handling
│   │   └── utils.py            # Slack utilities
│   ├── ai/
│   │   ├── classifier.py       # OpenAI classification
│   │   ├── embeddings.py       # Embedding generation
│   │   └── prompts.py          # AI prompts
│   ├── processing/
│   │   ├── message_processor.py # Main orchestrator
│   │   ├── grouping_engine.py  # Grouping logic
│   │   └── deduplication.py    # De-duplication
│   └── database/
│       ├── client.py            # Supabase client
│       ├── tickets.py           # Ticket operations
│       └── messages.py          # Message operations
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── TicketCard.tsx       # Ticket display
│   │   ├── TicketList.tsx      # Ticket list
│   │   └── MessageBubble.tsx   # Message display
│   ├── hooks/
│   │   └── useRealtimeTickets.ts # Realtime hook
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       └── types.ts            # TypeScript types
└── database/
    └── schema.sql              # Database schema
```

## How It Works

### Real-time Flow

1. Customer sends message in Slack
2. Slack Events API delivers via Socket Mode (<1s)
3. Backend receives event and processes:
   - De-duplication check (50ms)
   - OpenAI classification (2s)
   - Embedding generation (1s, parallel)
   - Grouping algorithm (500ms)
   - Database write (500ms)
4. Supabase Realtime broadcasts change (1s)
5. Next.js receives update and re-renders (500ms)
**Total: ~6-7 seconds**

### Classification Logic

**Relevant Messages:**
- Support: "How do I export data?", "Where is the settings page?"
- Bug: "Login button is broken", "Error on page load"
- Feature: "Can you add dark mode?", "Need CSV export"
- Question: "When will feature X launch?", "What does this do?"

**Irrelevant Messages:**
- Casual: "thanks", "sounds good", "ok"
- Greetings: "good morning", "hey", "hello"
- Social: "see you tomorrow", "have a good weekend"
- Emoji-only: "👍", "😊"

### Grouping Algorithm

**Priority 1: Thread-based** (100% confidence)
- Messages with same `thread_ts` always group together

**Priority 2: Semantic Similarity** (85% confidence)
- Vector embedding comparison (cosine similarity > 0.82)
- Same channel only
- Within 30 minute window
- Uses OpenAI text-embedding-ada-002

**Priority 3: Create New Ticket**
- If no match found, creates new ticket

### De-duplication

- Uses unique constraint on `slack_message_id` (format: `{channel_id}:{ts}`)
- Prevents duplicate processing from Slack retries
- Database-level enforcement

## Troubleshooting

### Backend not receiving events
- Check Socket Mode is enabled in Slack app settings
- Verify `SLACK_APP_TOKEN` is correct (starts with `xapp-`)
- Check bot is invited to channels

### Messages not appearing
- Check OpenAI API key is valid
- Verify Supabase credentials
- Check backend logs for errors
- Ensure bot has correct Slack scopes

### Frontend not updating
- Check Supabase Realtime is enabled (run schema.sql)
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check browser console for errors

### Classification issues
- Review OpenAI API usage/quota
- Check message text isn't too long (truncated at 8000 chars)
- Adjust `SIMILARITY_THRESHOLD` in config if needed

## Performance

- **Target Latency**: <10 seconds end-to-end
- **Actual**: ~6-7 seconds average
- **Optimizations**:
  - Parallel API calls (classification + embedding)
  - Database indexing (vector, timestamps)
  - Limited search scope (30 min window)
  - Async processing throughout

## Security

- Bot tokens stored in environment variables (never committed)
- Service role key backend-only (not exposed to frontend)
- Minimal Slack scopes (read-only)
- Socket Mode (no public endpoints needed)

## Cost Estimate

- **OpenAI**: ~$45/month (500 messages/day)
- **Supabase**: Free tier sufficient
- **Slack**: Free
- **Total**: ~$45/month

## License

MIT

## Support

For issues or questions, contact: priya@withnixo.com

