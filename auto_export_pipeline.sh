#!/bin/bash

echo "========================================"
echo "🚀 Starting Auto Export Pipeline - $(date)"
echo "========================================"

cd ~/Desktop/cyclemind

# 1. Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull

# 2. Add any new Psych Test Log files
echo "📦 Staging new markdown files..."
git add "src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs/"

# 3. Commit + Push only if there are changes
if git diff --cached --quiet; then
    echo "✅ No new files to commit."
else
    echo "📝 Committing and pushing new files..."
    git commit -m "Auto-export from Base44 - $(date '+%Y-%m-%d %H:%M')"
    git push
    echo "✅ Git push complete."
fi

# 4. Push new files to Opik
echo "📤 Pushing new traces to Opik..."
python3 push_to_opik.py

echo "========================================"
echo "✅ Pipeline finished at $(date)"
echo "========================================"