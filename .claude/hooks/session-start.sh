#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# No package manager dependencies — this is a single-file HTML5 game.
# Phaser 3 is loaded from CDN at runtime; no build step required.

# Ensure python3 is available for the local dev server (python3 -m http.server 8080)
if ! command -v python3 &>/dev/null; then
  echo "Warning: python3 not found. Install it to run a local dev server." >&2
fi
