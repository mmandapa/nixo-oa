# Slack Bot Setup - Step by Step

## Step 1: Create New App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** button (top right)
3. Select **"From scratch"**
4. Fill in:
   - **App Name**: `FDE Bot` (or any name you like)
   - **Pick a workspace**: Select your workspace
5. Click **"Create App"**

## Step 2: Enable Socket Mode

1. In the left sidebar, click **"Socket Mode"**
2. Toggle **"Enable Socket Mode"** to ON
3. Click **"Generate Token"** under "App-Level Tokens"
4. Name it: `FDE Bot Socket Mode`
5. Add scope: `connections:write`
6. Click **"Generate"**
7. **COPY THE TOKEN** (starts with `xapp-`) - this is your `SLACK_APP_TOKEN`
   - ⚠️ You can only see this once! Save it now.

## Step 3: Add Bot Scopes

1. In left sidebar, click **"OAuth & Permissions"**
2. Scroll down to **"Scopes"** → **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these:
   - `channels:history` - Read messages from public channels
   - `channels:read` - View basic channel info
   - `users:read` - Get user display names
   - `groups:history` - Read private channels (if you need them)
   - `groups:read` - View private channel info (if you need them)

## Step 4: Subscribe to Events

1. In left sidebar, click **"Event Subscriptions"**
2. Toggle **"Enable Events"** to ON
3. Under **"Subscribe to bot events"**, click **"Add Bot User Event"**
4. Add these events:
   - `message.channels` - Messages in public channels
   - `message.groups` - Messages in private channels (if needed)

## Step 5: Install App to Workspace

1. In left sidebar, click **"Install App"** (or go back to "OAuth & Permissions")
2. Click **"Install to Workspace"** button
3. Review permissions and click **"Allow"**
4. **COPY THE BOT USER OAUTH TOKEN** (starts with `xoxb-`) - this is your `SLACK_BOT_TOKEN`
   - This is shown on the "OAuth & Permissions" page after installation

## Step 6: Get Your User ID

1. Go to: https://api.slack.com/methods/auth.test
2. Enter your `SLACK_BOT_TOKEN` (the `xoxb-` one)
3. Click **"Test Method"**
4. Look for `"user_id"` in the response - this is your `FDE_SLACK_USER_ID`
   - OR you can use the `user_id` field from the response
   - Note: This might be the bot's user ID, not yours. You may need to get your own user ID differently.

**Alternative way to get YOUR user ID:**
- In Slack, right-click on your profile → "View Profile" → Look at the URL
- The user ID is in the URL, or
- Use this API: https://api.slack.com/methods/users.identity (if you have a user token)

## Step 7: Invite Bot to Channels

1. In Slack, go to any channel where you want the bot to monitor
2. Type: `/invite @YourBotName`
3. The bot will join the channel

## Summary - What You'll Have:

- ✅ `SLACK_BOT_TOKEN`: `xoxb-...` (from OAuth & Permissions page)
- ✅ `SLACK_APP_TOKEN`: `xapp-...` (from Socket Mode page)
- ✅ `FDE_SLACK_USER_ID`: `U01ABC123` (your Slack user ID)

Once you have these, share them and I'll update the `.env` file!

