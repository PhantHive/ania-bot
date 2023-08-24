#!/bin/bash

# Set the source and destination directories
SOURCE_DIR="/home/Phearion/aniaPrivate"
DEST_DIR="$(pwd)/src/assets"

SOURCE_BOT_ENV="/home/Phearion/bots/A-Nia/app/.env"

# Copy files and directories recursively
cp -a "$SOURCE_DIR"/* "$DEST_DIR"
cp -r "$SOURCE_BOT_ENV" "$(pwd)}"
