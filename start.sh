#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js 18+ is required."; exit 1; }
if [ ! -d node_modules ]; then npm install; fi
npm start
