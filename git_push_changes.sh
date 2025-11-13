#!/bin/bash

# Git push script for database wipe feature
# Run this from the project root: bash git_push_changes.sh

set -e

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "📝 Committing changes..."
git commit -m "Add database wipe functionality

- Add 'Delete All' button with confirmation dialog
- Add individual delete buttons on ticket cards
- Implement deleteTicket and deleteAllTickets functions
- Add real-time DELETE event subscription
- Improve delete all to handle batches
- Update TicketCard and TicketList components to support delete
- Add safety confirmations and loading states"

echo ""
echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Done! Changes pushed successfully."

