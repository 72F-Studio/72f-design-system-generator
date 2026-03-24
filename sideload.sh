#!/bin/bash

# Configuration
CONTAINER="pd-f75zpb2r-penpot-frontend-1"
DEST_PATH="/var/www/app/"
VER="v210-"

# Files
PLUGIN_JS="dist/plugin.js"
UI_JS="dist/ui.js"
UI_CSS="dist/ui.css"
INDEX_HTML="dist/index.html"
MANIFEST="manifest.json"

echo "[72F Studio U2] Building latest changes..."
npm run build

echo "[72F Studio U2] Preparing sideload for $CONTAINER (Version: $VER)..."

# Update index.html paths for the container version
sed "s|/ui.js|u2-${VER}ui.js|g; s|/ui.css|u2-${VER}ui.css|g" $INDEX_HTML > dist/u2-${VER}ui.html

# Copy files
echo "[72F Studio U2] Copying files to Docker..."
docker cp $PLUGIN_JS $CONTAINER:${DEST_PATH}u2-${VER}plugin.js
docker cp $UI_JS $CONTAINER:${DEST_PATH}u2-${VER}ui.js
docker cp $UI_CSS $CONTAINER:${DEST_PATH}u2-${VER}ui.css
docker cp dist/u2-${VER}ui.html $CONTAINER:${DEST_PATH}u2-${VER}ui.html
docker cp $MANIFEST $CONTAINER:${DEST_PATH}u2-${VER}manifest.json

# Permissions
echo "[72F Studio U2] Setting permissions..."
docker exec -u 0 $CONTAINER sh -c "chmod 755 ${DEST_PATH}u2-${VER}*"

echo "[72F Studio U2] Sideload complete!"
echo "Plugin Manifest URL: http://localhost:9001/u2-${VER}manifest.json"
