# Step-by-Step Test Cases

## Prerequisites

Before testing, make sure:
1. ✅ Backend is running (`python main.py` in backend directory)
2. ✅ Frontend is running (`npm run dev` in frontend directory)
3. ✅ Dashboard is open at http://localhost:3000
4. ✅ Bot is invited to your Slack channel: `/invite @FDE Bot`
5. ✅ Browser console is open (F12 → Console tab) to see logs

---

## Test Case 1: Bug Report (Should Appear)

### Steps:
1. **In Slack**, go to a channel where the bot is invited
2. **Send this message**: `The login button doesn't work on mobile`
3. **Wait 10 seconds**

### Expected Results:

**Backend Terminal:**
```
Received message event: The login button doesn't work on mobile
Processing message: C09S3Q6703Z:1762991598.030309
Classification: relevant=True, category=bug, confidence=0.85
Message processed in 6.5s -> Ticket abc-123-def
```

**Browser Console:**
```
✅ New ticket received! {id: "...", title: "The login button doesn't work on mobile", ...}
```

**Dashboard:**
- ✅ Ticket appears in **"🐛 Bug Reports"** section
- ✅ Shows message text: "The login button doesn't work on mobile"
- ✅ Shows channel name (e.g., "#all-nixo-oa")
- ✅ Shows timestamp (e.g., "less than a minute ago")
- ✅ Shows user name

### ✅ Pass Criteria:
- Message appears within 10 seconds
- Correctly categorized as "bug"
- All information displayed correctly

---

## Test Case 2: Feature Request + Follow-up (Should Group Together)

### Steps:
1. **In Slack**, send: `Can you add export to CSV?`
2. **Wait for it to appear** in dashboard (should create a new ticket)
3. **Wait 2-3 minutes** (important: don't send immediately)
4. **Send a follow-up** (NOT in a thread): `I don't see a button for it right now`
5. **Wait 10 seconds**

### Expected Results:

**Backend Terminal:**
```
# First message
Processing message: C09S3Q6703Z:1762991600.123456
Classification: relevant=True, category=feature
Creating new ticket for: Can you add export to CSV?

# Second message (2-3 min later)
Processing message: C09S3Q6703Z:1762991720.789012
Classification: relevant=True, category=feature
Grouped by similarity: abc-123-def (score: 0.87)
```

**Dashboard:**
- ✅ Both messages appear in **ONE ticket** (not two separate tickets)
- ✅ Ticket shows **"2 messages"** in the header
- ✅ Both message texts are visible in the ticket card
- ✅ Ticket is in **"✨ Feature Requests"** section

### ✅ Pass Criteria:
- Both messages grouped into same ticket
- Ticket shows correct message count (2)
- Both messages visible in ticket

### 🔍 How Grouping Works:
- Messages are grouped by **semantic similarity** (AI embeddings)
- Same channel required
- Within 30 minute window
- Similarity threshold: 0.82

---

## Test Case 3: Casual Messages (Should NOT Appear)

### Steps:
1. **In Slack**, send: `Thanks!`
2. **Wait 15 seconds**
3. **Send**: `See you tomorrow`
4. **Wait 15 seconds**

### Expected Results:

**Backend Terminal:**
```
Received message event: Thanks!
Processing message: C09S3Q6703Z:1762991800.111111
Classification: relevant=False, category=None, confidence=0.95
Message not relevant: Thanks!
```

**Dashboard:**
- ❌ "Thanks!" does NOT appear
- ❌ "See you tomorrow" does NOT appear
- ✅ Only relevant tickets remain visible

### ✅ Pass Criteria:
- Casual messages are filtered out
- Dashboard only shows relevant tickets
- No tickets created for casual messages

---

## Test Case 4: Thread Grouping (Advanced)

### Steps:
1. **In Slack**, send: `The back button is not working`
2. **Wait for it to appear** in dashboard
3. **Reply in thread** to that message: `Still broken on iOS`
4. **Reply again in thread**: `Also broken on Android`
5. **Wait 10 seconds**

### Expected Results:

**Dashboard:**
- ✅ All 3 messages appear in **ONE ticket**
- ✅ Ticket shows **"3 messages"**
- ✅ All messages visible in chronological order
- ✅ Ticket title is from the first message

### ✅ Pass Criteria:
- Thread messages automatically grouped
- All messages in same ticket
- Correct message count

---

## Test Case 5: Different Categories (Should NOT Group)

### Steps:
1. **Send**: `The login button doesn't work` (bug)
2. **Wait for it to appear**
3. **Send**: `How do I login?` (support question)
4. **Wait 10 seconds**

### Expected Results:

**Dashboard:**
- ✅ Two **separate tickets** created
- ✅ One in "🐛 Bug Reports"
- ✅ One in "🆘 Support Questions"
- ❌ NOT grouped together (different topics)

### ✅ Pass Criteria:
- Different topics create separate tickets
- Correctly categorized

---

## Test Case 6: Real-time Updates

### Steps:
1. **Keep dashboard open** (don't refresh)
2. **In Slack**, send: `Can you add dark mode?`
3. **Watch dashboard** (no refresh needed)

### Expected Results:

**Dashboard:**
- ✅ New ticket appears **automatically** within 10 seconds
- ✅ No page refresh needed
- ✅ "Live" indicator is green/pulsing
- ✅ Browser console shows: "✅ New ticket received!"

### ✅ Pass Criteria:
- Real-time updates work
- No manual refresh needed
- Updates appear quickly

---

## Test Case 7: De-duplication

### Steps:
1. **Send a message**: `The export feature is broken`
2. **Wait for it to appear**
3. **Send the EXACT same message again**: `The export feature is broken`
4. **Wait 10 seconds**

### Expected Results:

**Backend Terminal:**
```
# First message
Processing message: C09S3Q6703Z:1762991900.111111
Message processed in 6.5s -> Ticket abc-123

# Second message (duplicate)
Processing message: C09S3Q6703Z:1762991900.111111
Message already processed
```

**Dashboard:**
- ✅ Only **ONE ticket** appears
- ❌ No duplicate ticket created

### ✅ Pass Criteria:
- Duplicate messages don't create duplicate tickets
- System handles retries gracefully

---

## Quick Test Checklist

Run these in order:

- [ ] **Test 1**: Send "The login button doesn't work on mobile" → Appears as bug
- [ ] **Test 2**: Send "Can you add export to CSV?" then "I don't see a button for it" → Grouped together
- [ ] **Test 3**: Send "Thanks!" → Does NOT appear
- [ ] **Test 4**: Send message, reply in thread → All grouped
- [ ] **Test 5**: Send different category messages → Separate tickets
- [ ] **Test 6**: Send message while dashboard open → Updates automatically
- [ ] **Test 7**: Send duplicate message → No duplicate ticket

---

## Troubleshooting

### Message Not Appearing?
1. Check backend logs for errors
2. Verify bot is in channel
3. Check message is from customer (not FDE user)
4. Check browser console for errors

### Messages Not Grouping?
1. Wait 2-3 minutes between messages (for similarity grouping)
2. Make sure messages are in same channel
3. Check backend logs for similarity scores
4. Messages must be semantically similar (>0.82 threshold)

### Dashboard Not Updating?
1. Check browser console for subscription status
2. Verify Realtime is enabled in Supabase
3. Refresh page to re-subscribe
4. Check Network tab for WebSocket connection

---

## Expected Performance

- **Message processing**: 6-8 seconds
- **Dashboard update**: < 1 second after processing
- **Total latency**: < 10 seconds ✅

---

## Success Criteria Summary

✅ Relevant messages appear (bug/feature/support/question)
✅ Casual messages filtered out
✅ Related messages grouped together
✅ Thread messages automatically grouped
✅ Real-time updates work
✅ No duplicate tickets
✅ Correct categorization
✅ All information displayed correctly

