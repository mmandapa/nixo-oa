# Grouping Fix - Improved Logic

## Changes Made

### 1. Lowered Similarity Threshold
- **Before**: 0.82 (too strict)
- **After**: 0.75 (more flexible)
- **Why**: Allows more related messages to group together

### 2. Increased Time Window
- **Before**: 30 minutes
- **After**: 60 minutes
- **Why**: Gives more time for follow-up messages to be grouped

### 3. Improved Grouping Logic
- **Before**: Strictly preferred same category
- **After**: 
  - If similarity > 0.85: Group regardless of category
  - If similarity > 0.75: Prefer same category, but group anyway if no match
  - **Key**: Messages about the same topic will group even if classified differently

### 4. Better Logging
- Added debug logs for similarity scores
- Shows why tickets are/aren't grouped
- Helps troubleshoot grouping issues

## How to Test

### Test Case: CSV Export Messages

1. **Send first message**: `Can you add export to CSV?`
   - Should create a ticket (probably "feature")

2. **Wait 1-2 minutes**

3. **Send second message**: `I don't see a button for it right now`
   - Should group with first message
   - Check backend logs for: "✅ Grouped by similarity"

### What to Check in Backend Logs

**Good grouping:**
```
Searching for similar tickets in channel C09S3Q6703Z
Similar ticket found: abc-123 (similarity: 0.87, category: feature, current category: support)
✅ Grouped by similarity: abc-123 (score: 0.870, category: feature vs support)
```

**Not grouping (if similarity too low):**
```
Searching for similar tickets in channel C09S3Q6703Z
No similar tickets found (threshold: 0.75)
Creating new ticket for: I don't see a button...
```

## If Still Not Grouping

1. **Check similarity scores** in backend logs
2. **Lower threshold further** if needed (edit `backend/.env`):
   ```
   SIMILARITY_THRESHOLD=0.70
   ```
3. **Check time window** - messages must be within 60 minutes
4. **Check channel** - messages must be in same channel

## Restart Backend

After changes, restart backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

Then test again with the CSV export messages.

