#!/bin/bash
# Build and deploy reginerd.tv to the VPS.
# Usage: ./deploy.sh
set -e

VPS="root@167.71.114.248"
REMOTE_DIR="/var/www/reginerd.tv"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ">>> Building site..."
cd "$SCRIPT_DIR"
npm run build

echo ">>> Deploying to $VPS:$REMOTE_DIR..."
rsync -avz --delete dist/ "$VPS:$REMOTE_DIR/"

echo ""
echo "✅ Deployed! https://reginerd.tv"
