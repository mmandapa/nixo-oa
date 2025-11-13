# Testing Guide - FDE Slackbot

## Prerequisites Check

Before testing, make sure:
- ✅ Backend is running (`python main.py` in backend directory)
- ✅ Frontend is running (`npm run dev` in frontend directory)
- ✅ Database schema is run in Supabase
- ✅ Bot is invited to Slack channels

## Step-by-Step Testing

### 1. Check Backend is Running

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Expected output:**
```
Starting FDE Slackbot...
FDE User ID: U09TDH154Q0
Starting Slack Socket Mode handler...
```

If you see errors, check:
- `.env` file has all required keys
- Slack tokens are correct
- OpenAI API key is valid

### 2. Check Frontend is Running

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.0.3
- Local:        http://localhost:3000
```

**Open browser:** http://localhost:3000

**Expected:**
- Dashboard loads (may show "No tickets yet" if empty)
- No errors in browser console (F12)

### 3. Test Message Classification

#### Test Case 1: Bug Report (Should Appear)
**In Slack:**
1. Go to a channel where the bot is invited
2. Send: `The login button doesn't work on mobile`
3. Wait 10 seconds

**Expected in Dashboard:**
- ✅ Ticket appears in "🐛 Bug Reports" section
- ✅ Shows message text
- ✅ Shows channel name
- ✅ Shows timestamp

**Check Backend Logs:**
Should see:
```
Processing message: C01ABC123:1234.567890
Classification: relevant=True, category=bug, confidence=0.85
Message processed in 6.5s -> Ticket abc-123
```

#### Test Case 2: Feature Request (Should Appear)
**In Slack:**
Send: `Can you add export to CSV?`

**Expected:**
- ✅ Appears in "✨ Feature Requests" section

#### Test Case 3: Support Question (Should Appear)
**In Slack:**
Send: `How do I export my data?`

**Expected:**
- ✅ Appears in "🆘 Support Questions" section

#### Test Case 4: Casual Message (Should NOT Appear)
**In Slack:**
Send: `thanks!` or `See you tomorrow`

**Expected:**
- ❌ Does NOT appear in dashboard
- Backend logs: `Message not relevant: thanks!`

### 4. Test Grouping

#### Test Case 5: Thread Grouping
**In Slack:**
1. Send: `The login button doesn't work`
2. Reply in thread: `Still broken on iOS`
3. Reply again: `Also broken on Android`

**Expected:**
- ✅ All 3 messages appear in ONE ticket
- ✅ Ticket shows "3 messages"
- ✅ All messages visible in ticket card

#### Test Case 6: Similarity Grouping
**In Slack:**
1. Send: `Can you add CSV export?`
2. Wait 2 minutes
3. Send (NOT in thread): `I don't see a button for CSV export`

**Expected:**
- ✅ Both messages grouped in ONE ticket
- ✅ Shows "2 messages"

### 5. Test Real-time Updates

**Test:**
1. Open dashboard in browser
2. Send a message in Slack
3. Watch dashboard (don't refresh)

**Expected:**
- ✅ New ticket appears within 10 seconds
- ✅ No page refresh needed
- ✅ "Live" indicator is green

### 6. Test De-duplication

**Test:**
1. Send a message in Slack
2. Wait for it to appear
3. Send the EXACT same message again

**Expected:**
- ✅ Only ONE ticket appears
- ✅ Backend logs: `Message already processed`

## Troubleshooting

### Backend Issues

**Problem: "ModuleNotFoundError: No module named 'aiohttp'"**
```bash
cd backend
source venv/bin/activate
pip install aiohttp
```

**Problem: "Slack connection failed"**
- Check `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` in `.env`
- Verify Socket Mode is enabled in Slack app settings
- Check bot is installed to workspace

**Problem: "OpenAI API error"**
- Verify `OPENAI_API_KEY` is correct
- Check API quota/limits
- Check network connection

**Problem: "Supabase connection error"**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check database schema is run
- Verify tables exist in Supabase dashboard

### Frontend Issues

**Problem: "Loading tickets..." forever**
- Check browser console (F12) for errors
- Verify `.env.local` has correct Supabase credentials
- Check Network tab for failed requests
- Verify Realtime is enabled in Supabase

**Problem: "Error loading tickets"**
- Check Supabase URL and anon key
- Verify RLS policies allow reads
- Check browser console for specific error

**Problem: "No real-time updates"**
- Verify Realtime is enabled in Supabase (run schema.sql)
- Check browser console for subscription errors
- Verify Supabase Realtime is not blocked by firewall

### Message Not Appearing

**Checklist:**
1. ✅ Bot is invited to channel
2. ✅ Message is from a customer (not FDE user)
3. ✅ Message is not a bot message
4. ✅ Backend is running and receiving events
5. ✅ Check backend logs for processing errors
6. ✅ Message is relevant (not filtered out)

**Debug Steps:**
1. Check backend logs for "Processing message..."
2. Check if classification says "relevant=False"
3. Check browser console for errors
4. Check Supabase dashboard - is ticket in database?

## Expected Performance

- **Initial load:** < 2 seconds (if 0 tickets)
- **Message processing:** 6-8 seconds end-to-end
- **Dashboard update:** < 1 second after backend processes
- **Total latency:** < 10 seconds (requirement met)

## Success Criteria

✅ Messages appear in dashboard within 10 seconds
✅ Relevant messages are classified correctly
✅ Casual messages are filtered out
✅ Related messages are grouped together
✅ No duplicate tickets
✅ Real-time updates work without refresh
✅ Dashboard loads without errors

## Quick Test Script

Run this in Slack to test all categories:

```
1. Bug: "The login button doesn't work"
2. Feature: "Can you add dark mode?"
3. Support: "How do I export data?"
4. Question: "When will feature X launch?"
5. Casual: "thanks!" (should NOT appear)
```

All should appear except #5!

