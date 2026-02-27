#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Deploying Creator Economy Tools..."
git add .
git commit -m "Update $(date '+%Y-%m-%d %H:%M')"
git push
echo "✅ Done! Vercel will deploy in ~10 seconds."
echo "🌐 https://creator-economy-tools.vercel.app"
