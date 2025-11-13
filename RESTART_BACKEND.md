# ⚠️ IMPORTANT: Restart Backend Required

The AI-based grouping feature has been implemented, but **your backend is still running the old code**.

## Steps to Apply Changes

1. **Stop the current backend** (press `Ctrl+C` in the terminal where it's running)

2. **Restart the backend**:
```bash
cd backend
source venv/bin/activate
python main.py
```

3. **Test with duplicate messages**:
   - Send: `The login button doesn't work on mobile`
   - Wait a few seconds
   - Send: `The login button does not work on mobile`
   - **They should now group together!**

## What to Look For in Logs

After restarting, you should see logs like:
```
🔍 Searching for related tickets using AI in channel C09S3Q6703Z
Fetching recent tickets (last 24h) for AI grouping check...
Found 3 recent tickets to check with AI
🤖 AI checking: 'The login button does not work on mobile' vs ticket 'The login button doesn't work on mobile'
AI result: same=True, confidence=0.95, reasoning=Both messages describe the same login issue on mobile
✅ AI grouping match: confidence=0.95, reasoning=...
✅ Grouped by AI: abc-123 (category: bug vs bug)
```

If you see "Creating new ticket" instead, check the AI confidence scores in the logs.

## Why This Happens

The backend loads code when it starts. Changes to Python files won't take effect until you restart the process.

