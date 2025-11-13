# AI-Based Grouping Implementation

## What Changed

The grouping system now uses **AI (GPT-4o-mini)** to explicitly check if messages are about the same issue, regardless of when they were sent.

### Before
- Only used vector similarity (embeddings)
- Limited to 60-minute time window
- Could miss related messages sent hours/days later

### After
- **Priority 1**: Thread-based grouping (unchanged)
- **Priority 2**: **AI-based grouping** (NEW!) - checks last 24 hours
- **Priority 3**: Vector similarity (fallback)

## How It Works

1. When a new message arrives, the system:
   - First checks if it's in a thread → group by thread
   - Then checks recent tickets (last 24 hours) using **AI**
   - For each recent ticket, asks GPT-4: "Are these messages about the same issue?"
   - If AI says yes (confidence ≥ 0.75), groups them
   - Falls back to vector similarity if AI doesn't find a match

2. **AI Prompt**:
   - Compares the new message with the first message of each recent ticket
   - Considers ticket title for context
   - Returns: `is_same_issue`, `confidence`, `reasoning`

## Benefits

✅ **Time-independent**: Messages sent hours/days apart can still group  
✅ **Context-aware**: AI understands semantic relationships better than vectors  
✅ **Accurate**: Explicitly asks "are these the same issue?" rather than relying on similarity scores  
✅ **Flexible**: Works even if messages are worded very differently

## Example

**Scenario**: Customer asks about CSV export on Monday, then asks again on Wednesday

**Before**:
- Monday: "Can you add CSV export?" → Creates ticket A
- Wednesday: "I don't see a button for CSV export" → Creates ticket B (separate!)

**After**:
- Monday: "Can you add CSV export?" → Creates ticket A
- Wednesday: "I don't see a button for CSV export" → **AI groups with ticket A** ✅

## Configuration

- **Time window**: 24 hours (configurable in `grouping_engine.py`)
- **Confidence threshold**: 0.75 (minimum confidence for grouping)
- **Max tickets checked**: 10 most recent tickets

## Performance

- Adds ~1-2 seconds per message (AI API call)
- Only checks when thread grouping fails
- Caches results (implicitly via database)

## Testing

1. Send: `Can you add CSV export?`
2. Wait a few minutes (or hours)
3. Send: `I don't see a button for CSV export`
4. Check backend logs for: `✅ Grouped by AI: <ticket_id>`
5. Both messages should appear in the same ticket on dashboard

## Backend Logs

Look for:
```
Searching for related tickets using AI in channel C09S3Q6703Z
AI grouping match: confidence=0.92, reasoning="Both messages are about CSV export feature"
✅ Grouped by AI: abc-123 (category: feature vs support)
```

If not grouping:
```
AI grouping: not same (confidence=0.65, reasoning="Different topics")
```

