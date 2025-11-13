# Debugging Dashboard Not Updating

## Step-by-Step Debugging

### 1. Check Backend is Receiving Messages

**In backend terminal, you should see:**
```
Received message event: The login button doesn't work
Processing message: C01ABC123:1234.567890
```

**If you DON'T see this:**
- Bot might not be in the channel
- Message might be from FDE user (filtered out)
- Socket Mode might not be connected

**Fix:**
- Invite bot: `/invite @FDE Bot` in Slack
- Check backend logs for connection errors
- Verify `FDE_SLACK_USER_ID` is correct

### 2. Check Backend is Processing

**Look for these logs:**
```
Classification: relevant=True, category=bug, confidence=0.85
Message processed in 6.5s -> Ticket abc-123-def
```

**If you see "Message not relevant":**
- Message was filtered out (casual chat)
- This is expected for "thanks!", "hello", etc.

**If you see errors:**
- Check OpenAI API key
- Check Supabase connection
- Check database schema is run

### 3. Check Database Has Data

**Go to Supabase Dashboard:**
1. https://supabase.com/dashboard/project/pysdmgysyfukojlpfkkv/editor
2. Check `tickets` table - should have rows
3. Check `messages` table - should have rows

**If tables are empty:**
- Backend is not writing to database
- Check backend logs for database errors
- Verify `SUPABASE_KEY` in backend `.env`

### 4. Check Frontend Console

**Open browser console (F12):**
- Should see: "Fetching tickets from Supabase..."
- Should see: "Fetched X tickets"
- Should see: "New ticket!" when message arrives

**If you see errors:**
- "Missing Supabase environment variables" → Check `.env.local`
- Network errors → Check Supabase URL/key
- Timeout errors → Check Supabase connection

### 5. Check Realtime Subscription

**In browser console, you should see:**
```
New ticket! {id: "...", title: "..."}
```

**If you DON'T see this:**
- Realtime might not be enabled
- Subscription might have failed
- Check browser console for subscription errors

**Fix:**
- Verify Realtime is enabled in Supabase (run schema.sql)
- Check Network tab for WebSocket connection
- Refresh page to re-subscribe

## Quick Fixes

### Fix 1: Refresh Dashboard
Sometimes the subscription disconnects. Just refresh the page.

### Fix 2: Check Supabase Realtime
1. Go to Supabase dashboard
2. Settings → API → Realtime
3. Make sure it's enabled

### Fix 3: Verify Environment Variables
**Backend `.env`:**
- `SUPABASE_URL` - correct?
- `SUPABASE_KEY` - correct? (should be anon key or service role)

**Frontend `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL` - correct?
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - correct?

### Fix 4: Test Direct Database Query
In browser console, run:
```javascript
const { data, error } = await supabase.from('tickets').select('*')
console.log('Tickets:', data, 'Error:', error)
```

If this works but dashboard doesn't update, it's a Realtime issue.

## Common Issues

### Issue: Backend processes but dashboard doesn't update
**Cause:** Realtime subscription not working
**Fix:** 
1. Check browser console for subscription errors
2. Verify Realtime is enabled in Supabase
3. Try refreshing the page

### Issue: No messages in backend logs
**Cause:** Bot not receiving events
**Fix:**
1. Check bot is in channel
2. Check Socket Mode is connected
3. Verify Slack app has correct scopes

### Issue: "Message not relevant" for all messages
**Cause:** Classification too strict
**Fix:** Check classification prompt in `backend/ai/prompts.py`

### Issue: Database empty but backend says "processed"
**Cause:** Database write failing silently
**Fix:** Check backend logs for database errors

